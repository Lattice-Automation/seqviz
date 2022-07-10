/**
 * Source code for this parser comes from:
 * https://github.com/IsaacLuo/SnapGeneFileReader
 */
import * as bufferpack from "bufferpack";
import { StringDecoder } from "string_decoder";
import * as xml2js from "xml2js";

import { dnaComplement, partFactory } from "../../utils/parser";
import { annotationFactory } from "../../utils/sequence";

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
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    const buffer = read(size);
    const unpacked = await bufferpack.unpack(`>${mode}`, buffer);
    if (unpacked === undefined) return undefined;
    return unpacked[0];
  };

  // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
  read(1); // read the first byte

  // READ THE DOCUMENT PROPERTIES
  const length = await unpack(4, "I");
  const title = read(8, "ascii");
  if (length !== 14 || title !== "SnapGene") {
    throw new Error("wrong format for a SnapGene file");
  }
  const data = {};
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'isDNA' does not exist on type '{}'.
  data.isDNA = await unpack(2, "H");
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'exportVersion' does not exist on type '{... Remove this comment to see the full error message
  data.exportVersion = await unpack(2, "H");
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'importVersion' does not exist on type '{... Remove this comment to see the full error message
  data.importVersion = await unpack(2, "H");

  /* eslint-disable no-await-in-loop */
  while (offset <= fileArrayBuffer.byteLength) {
    // # READ THE WHOLE FILE, BLOCK BY BLOCK, UNTIL THE END
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
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

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'circular' does not exist on type '{}'.
      data.circular = isFirstBitA1(binaryRep);
      const size = blockSize - 1;
      if (size < 0) {
        throw new Error("error parsing sequence data");
      }
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type '{}'.
      data.seq = read(size, "ascii");
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'compSeq' does not exist on type '{}'.
      data.compSeq = dnaComplement(data.seq).compSeq;
    } else if (ordOfNB === 6) {
      //  # READ THE NOTES
      const blockContent = read(blockSize, "utf8");
      const notes = await editMD(blockContent);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'notes' does not exist on type '{}'.
      data.notes = notes ? notes.description : "";
    } else if (ordOfNB === 10) {
      //  # READ THE FEATURES
      const directionalityDict = {
        "0": "NONE",
        "1": 1,
        "2": -1,
        "3": "BIDIRECTIONAL",
        undefined: "NONE",
      };

      const xml = read(blockSize, "utf8");
      const b = await editMD(xml);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'Features' does not exist on type 'unknow... Remove this comment to see the full error message
      const { Features: { Feature = [] } = {} } = b;
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'annotations' does not exist on type '{}'... Remove this comment to see the full error message
      data.annotations = [];
      Feature.forEach(({ $: attrs, Segment = [] }) => {
        let minStart = 0;
        let maxEnd = 0;
        if (Segment) {
          Segment.forEach(({ $: seg }) => {
            if (!seg) throw new Error("Invalid feature definition");
            const { range } = seg;
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'split' does not exist on type 'never'.
            const [start, end] = range.split("-");
            minStart = minStart === 0 ? start : Math.min(minStart, start);
            maxEnd = Math.max(maxEnd, end);
          });
        }
        const { directionality } = attrs;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'annotations' does not exist on type '{}'... Remove this comment to see the full error message
        data.annotations.push({
          ...annotationFactory(),
          direction: directionalityDict[directionality],
          end: maxEnd - 1,
          name: attrs.name,
          start: minStart - 1,
          type: attrs.type,
        });
      });
    } else {
      // # UNKNOWN: WE IGNORE THE WHOLE BLOCK
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
      read(blockSize);
    }
  }

  return [
    {
      ...partFactory(),
      ...data,
      name: fileName.replace(".dna", ""),
    },
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

const isFirstBitA1 = num => Number(num.toString().split("").pop()) === 1;

const editMD = str =>
  new Promise((resolve, reject) => {
    xml2js.parseString(str, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
