/**
 * Source code for this parser comes from:
 * https://github.com/IsaacLuo/SnapGeneFileReader
 */

import { StringDecoder } from "string_decoder";
import bufferpack from "bufferpack";
import xml2js from "xml2js";

import { dnaComplement, partFactory } from "../../utils/parser";
// @ts-ignore
import { annotationFactory } from "../../utils/sequence.ts";

export default async (fileArrayBuffer, options) => {
  const { fileName = "" } = options;
  let offset = 0;
  const read = (size, fmt) => {
    const buffer = Buffer.from(fileArrayBuffer.slice(offset, size + offset));
    offset += size;
    if (fmt) {
      const decoder = new StringDecoder(fmt);
      return decoder.write(buffer);
    }
    return buffer;
  };

  const unpack = async (size, mode) => {
    const buffer = read(size);
    const unpacked = await bufferpack.unpack(`>${mode}`, buffer);
    if (unpacked === undefined) return undefined;
    return unpacked[0];
  };

  read(1); // read the first byte

  // READ THE DOCUMENT PROPERTIES
  const length = await unpack(4, "I");
  const title = read(8, "ascii");
  if (length !== 14 || title !== "SnapGene") {
    throw new Error("wrong format for a SnapGene file");
  }
  const data = {};
  data.isDNA = await unpack(2, "H");
  data.exportVersion = await unpack(2, "H");
  data.importVersion = await unpack(2, "H");

  /* eslint-disable no-await-in-loop */
  while (offset <= fileArrayBuffer.byteLength) {
    // # READ THE WHOLE FILE, BLOCK BY BLOCK, UNTIL THE END
    const nextByte = read(1);

    // # next_byte table
    // # 0: dna sequence
    // # 1: compressed DNA
    // # 2: unknown
    // # 3: unknown
    // # 5: primers
    // # 6: notes
    // # 7: history tree
    // # 8: additional sequence properties segment
    // # 9: file Description
    // # 10: features
    // # 11: history node
    // # 13: unknown
    // # 16: alignable sequence
    // # 17: alignable sequence
    // # 18: sequence trace
    // # 19: Uracil Positions
    // # 20: custom DNA colors

    const blockSize = await unpack(4, "I");
    const ordOfNB = ord(nextByte);
    if (ordOfNB === 0) {
      //  # READ THE SEQUENCE AND ITS PROPERTIES
      const props = await unpack(1, "b");
      const binaryRep = dec2bin(props);

      data.circular = isFirstBitA1(binaryRep);
      const size = blockSize - 1;
      if (size < 0) {
        throw new Error("error parsing sequence data");
      }
      data.seq = read(size, "ascii");
      data.compSeq = dnaComplement(data.seq).compSeq;
    } else if (ordOfNB === 6) {
      //  # READ THE NOTES
      const blockContent = read(blockSize, "utf8");
      const notes = await editMD(blockContent);
      data.notes = notes ? notes.description : "";
    } else if (ordOfNB === 10) {
      //  # READ THE FEATURES
      const directionalityDict = {
        undefined: "NONE",
        "0": "NONE",
        "1": 1,
        "2": -1,
        "3": "BIDIRECTIONAL"
      };

      const xml = read(blockSize, "utf8");
      const b = await editMD(xml);
      const { Features: { Feature = [] } = {} } = b;
      data.annotations = [];
      Feature.forEach(({ $: attrs, Segment = [] }) => {
        let minStart = 0;
        let maxEnd = 0;
        if (Segment) {
          Segment.forEach(({ $: seg }) => {
            if (!seg) throw new Error("Invalid feature definition");
            const { range } = seg;
            const [start, end] = range.split("-");
            minStart = minStart === 0 ? start : Math.min(minStart, start);
            maxEnd = Math.max(maxEnd, end);
          });
        }
        const { directionality } = attrs;
        data.annotations.push({
          ...annotationFactory(),
          name: attrs.name,
          type: attrs.type,
          direction: directionalityDict[directionality],
          start: minStart - 1,
          end: maxEnd - 1
        });
      });
    } else {
      // # UNKNOWN: WE IGNORE THE WHOLE BLOCK
      read(blockSize);
    }
  }

  return [
    {
      ...partFactory(),
      ...data,
      name: fileName.replace(".dna", "")
    }
  ];
};

const ord = string => {
  //  discuss at: http://locutus.io/php/ord/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: incidence
  //   example 1: ord('K')
  //   returns 1: 75
  //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
  //   returns 2: 65536

  const str = string.toString();
  const code = str.charCodeAt(0);
  return code;
};

const dec2bin = dec => (dec >>> 0).toString(2); // eslint-disable-line no-bitwise

const isFirstBitA1 = num =>
  Number(
    num
      .toString()
      .split("")
      .pop()
  ) === 1;

const editMD = str =>
  new Promise((resolve, reject) => {
    xml2js.parseString(str, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
