// note: Huge credit and thanks go to IsaacLuo from whose python repository this code was adapted
// https://github.com/IsaacLuo/SnapGeneFileReader
// https://github.com/ediezben/dgparse/blob/master/specs/SnapGene_File_Format_%202.0.pdf

import { dnaComplement, partFactory } from "../../Utils/parser";
import { annotationFactory } from "../../Utils/sequence";
const bufferpack = require("bufferpack");
const xml2Js = require("xml2js");
const { StringDecoder } = require("string_decoder");

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

  if (code >= 0xd800 && code <= 0xdbff) {
    // High surrogate (could change last hex to 0xDB7F to treat
    // high private surrogates as single characters)
    const hi = code;
    if (str.length === 1) {
      // This is just a high surrogate with no following low surrogate,
      // so we return its value;
      return code;
      // we could also throw an error as it is not a complete character,
      // but someone may want to know
    }
    const low = str.charCodeAt(1);
    return (hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
  }
  if (code >= 0xdc00 && code <= 0xdfff) {
    // Low surrogate
    // This is just a low surrogate with no preceding high surrogate,
    // so we return its value;
    return code;
    // we could also throw an error as it is not a complete character,
    // but someone may want to know
  }

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

const parseXml = str =>
  new Promise((resolve, reject) => {
    xml2Js.parseString(str, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

export default async (fileArrayBuffer, options) => {
  const { fileName = "", colors = [] } = options;
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

  async function unpack(size, mode) {
    const buffer = await read(size);
    const unpacked = await bufferpack.unpack(`>${mode}`, buffer);
    if (unpacked === undefined) return undefined;
    return unpacked[0];
  }

  await read(1); // read the first byte
  // READ THE DOCUMENT PROPERTIES
  const length = await unpack(4, "I");
  const title = await read(8, "ascii");
  if (length !== 14 || title !== "SnapGene") {
    throw new Error("Wrong format for a SnapGene file");
  }
  const data = {};
  // data.isDNA =
  await unpack(2, "H");
  // data.exportVersion =
  await unpack(2, "H");
  // data.importVersion =
  await unpack(2, "H");
  // data.other = [];
  /* eslint-disable no-await-in-loop */
  while (offset <= fileArrayBuffer.byteLength) {
    // # READ THE WHOLE FILE, BLOCK BY BLOCK, UNTIL THE END
    const nextByte = await read(1);

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
        throw new Error("Error parsing sequence data");
      }
      data.seq = await read(size, "ascii");
      data.compSeq = dnaComplement(data.seq).compSeq;
    } else if (ordOfNB === 6) {
      //  # READ THE NOTES
      const blockContent = await read(blockSize, "utf8");
      const notes = await parseXml(blockContent);
      data.notes = notes ? notes.description : "";
    } else if (ordOfNB === 10) {
      //  # READ THE FEATURES
      const directionalityDict = {
        undefined: "NONE",
        "0": "NONE",
        "1": "FORWARD",
        "2": "REVERSE",
        "3": "BIDIRECTIONAL"
      };

      const xml = await read(blockSize, "utf8");
      const b = await parseXml(xml);
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
          ...annotationFactory(fileName, attrs.name, colors),
          name: attrs.name,
          type: attrs.type,
          direction: directionalityDict[directionality],
          start: minStart - 1,
          end: maxEnd - 1
        });
      });
    } else if (ordOfNB === 2 || ordOfNB === 3 || ordOfNB === 13) {
      // # UNKNOWN: WE IGNORE THE WHOLE BLOCK
      await read(blockSize);
    } else {
      try {
        // blocks with miscellaneous data can be pushed to other
        const xml = await read(blockSize, "utf8");
        const b = await parseXml(xml);
        console.log(b);
      } catch (e) {
        console.log("Error parsing snapgene file: ", e);
      }
    }
  }
  /* eslint-enable no-await-in-loop */

  return {
    ...partFactory(),
    ...data,
    name: fileName.replace(".dna", "")
  };
};
