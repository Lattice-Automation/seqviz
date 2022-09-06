// just a pared down version of: https://github.com/eamitchell/ab1ToJSON/blob/master/clientside.js
import randomid from "../../randomid";

const tagDict = {
  baseCalls2: { tagName: "PBAS", tagNum: 2, typeToReturn: "getChar" },
  colorDataA: { tagName: "DATA", tagNum: 10, typeToReturn: "getShort" },
  colorDataC: { tagName: "DATA", tagNum: 12, typeToReturn: "getShort" },
  colorDataG: { tagName: "DATA", tagNum: 9, typeToReturn: "getShort" },
  colorDataT: { tagName: "DATA", tagNum: 11, typeToReturn: "getShort" },
  peakLocations: { tagName: "PLOC", tagNum: 2, typeToReturn: "getShort" },
  qualNums: { tagName: "PCON", tagNum: 2, typeToReturn: "getNumber" },
};

const convertAB1 = inputArrayBuffer => {
  const dirLocation = inputArrayBuffer.getInt32(26);
  const numElements = inputArrayBuffer.getInt32(18);
  const lastEntry = dirLocation + numElements * 28;

  /**
   * a map of the method to get the data to the type of function used to get it
   */
  const extractionFunctions = {
    getChar: (inOffset, numEntries) => {
      const retArray = [];
      for (let counter = 0; counter < numEntries; counter += 1) {
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
        retArray.push(String.fromCharCode(inputArrayBuffer.getInt8(inOffset + counter)));
      }
      return retArray;
    },
    getNumber: (inOffset, numEntries) => {
      const retArray = [];
      for (let counter = 0; counter < numEntries; counter += 1) {
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
        retArray.push(inputArrayBuffer.getInt8(inOffset + counter));
      }
      return retArray;
    },
    getShort: (inOffset, numEntries) => {
      const retArray = [];
      for (let counter = 0; counter < numEntries; counter += 2) {
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
        retArray.push(inputArrayBuffer.getInt16(inOffset + counter));
      }
      return retArray;
    },
  };

  const getTagName = inOffset => {
    let name = "";
    for (let loopOffset = inOffset; loopOffset < inOffset + 4; loopOffset += 1) {
      name += String.fromCharCode(inputArrayBuffer.getInt8(loopOffset));
    }
    return name;
  };

  const getDataTag = inTag => {
    let output = [];
    let curElem = dirLocation;
    do {
      const currTagName = getTagName(curElem);
      const tagNum = inputArrayBuffer.getInt32(curElem + 4);
      if (currTagName === inTag.tagName && tagNum === inTag.tagNum) {
        const numEntries = inputArrayBuffer.getInt32(curElem + 16);
        const entryOffset = inputArrayBuffer.getInt32(curElem + 20);
        output = extractionFunctions[inTag.typeToReturn](entryOffset, numEntries);
      }
      curElem += 28;
    } while (curElem < lastEntry);
    return output;
  };

  return {
    aTrace: getDataTag(tagDict.colorDataA),
    baseCalls: getDataTag(tagDict.baseCalls2),
    basePos: getDataTag(tagDict.peakLocations),
    cTrace: getDataTag(tagDict.colorDataC),
    gTrace: getDataTag(tagDict.colorDataG),
    qualNums: getDataTag(tagDict.qualNums),
    tTrace: getDataTag(tagDict.colorDataT),
  };
};

/**
 * takes an ab1 file as a binary Buffer (if server) or ArrayBuffer (if client)
 *
 * details on the schema of an AB1 file are here:
 * http://www6.appliedbiosystems.com/support/software_community/ABIF_File_Format.pdf
 *
 * the js parser above was found at: https://github.com/eamitchell/ab1ToJSON/blob/master/clientside.js
 */
export default (file, name) => {
  // convert Buffer to ArrayBuffer
  // see https://gist.github.com/miguelmota/5b06ae5698877322d0ca
  let AB;
  if (file instanceof ArrayBuffer) {
    AB = file;
  } else {
    // all ab1 files start w/ ABIF
    if (file.slice(0, 4).toString() !== "ABIF") throw new Error("Not an ab1 file");
    AB = new ArrayBuffer(file.length);
    const Uint8 = new Uint8Array(AB);
    for (let i = 0; i < file.length; i += 1) {
      Uint8[i] = file[i];
    }
  }

  // make a DataView for the ArrayBuffer
  const view = new DataView(AB);
  const { aTrace, baseCalls, basePos, cTrace, gTrace, qualNums, tTrace } = convertAB1(view); // parse the buffer

  // there are more trace data points and quality number than guessed basepairs
  // we take the basePos array and get the trace/qual numbers out of the arrays based
  // on their location
  const traces = {
    aTrace: basePos.map(p => aTrace[p]),
    cTrace: basePos.map(p => cTrace[p]),
    gTrace: basePos.map(p => gTrace[p]),
    qualNums: qualNums,
    tTrace: basePos.map(p => tTrace[p]),
  };

  // convert to an aligned part format
  const id = randomid();
  const seq = baseCalls.join("");
  return { id, name, seq, traces };
};
