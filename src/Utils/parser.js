import { annotationFactory } from "./sequence";

/**
 * returns an object with sequence and complement sequence as strings
 *
 * Takes in a sequence "seqInput" and returns an object with fields
 * seq and compSeq (done because some input base pairs might not make
 * sense and should be filtered out)
 */

// from http://arep.med.harvard.edu/labgc/adnan/projects/Utilities/revcomp.html
const DNAComplement = {
  a: "t",
  t: "a",
  c: "g",
  g: "c",
  A: "T",
  T: "A",
  C: "G",
  G: "C",
  r: "y",
  R: "Y",
  y: "r",
  Y: "R",
  S: "S",
  s: "s",
  W: "W",
  w: "w",
  d: "h",
  D: "H",
  h: "d",
  H: "D",
  k: "m",
  K: "M",
  m: "k",
  M: "K",
  v: "b",
  V: "B",
  b: "v",
  B: "V",
  N: "N",
  n: "n",
  X: "X",
  x: "x",
  U: "A",
  u: "a"
};

/**
 * @typedef {Object} SeqReturn
 * @param {String} [seq] [the template sequence]
 * @param {String} [compSeq] [the complement sequence]
 */

/**
 * return the filtered sequence and its complement
 * if its an empty string, return the same for both
 * @param  {String} origSeq [the incoming sequence]
 * @return {SeqReturn}         [the resulting sequence and complement sequence]
 */
export const dnaComplement = origSeq => {
  if (!origSeq) {
    return { seq: "", compSeq: "" };
  }

  // filter out unrecognized basepairs and build up the complement
  let seq = "";
  let compSeq = "";
  for (let i = 0, origLength = origSeq.length; i < origLength; i += 1) {
    if (DNAComplement[origSeq[i]]) {
      seq += origSeq[i];
      compSeq += DNAComplement[origSeq[i]];
    }
  }
  return { seq, compSeq };
};

/**
 * just like dnaComplement except the dna is reversed as well to get the reverseComplement
 *
 * @param {string}  seq  the seq that we're interested in finding the reverse complement of
 * @return {string}     the reverse complement of the input
 */
export const reverseComplement = inputSeq => {
  const { compSeq } = dnaComplement(inputSeq);
  return compSeq
    .split("")
    .reverse()
    .join("");
};

export const trimCarriageReturn = untrimmed =>
  untrimmed.replace(/^[\n\r]+|[\n\r]+$/g, "");

export const extractDate = data => {
  let date = Date.now();
  data.forEach(other => {
    if (Date.parse(other)) {
      // it's a valid date... ie not NaN
      date = Date.parse(other);
    }
  });
  return date;
};

export const firstElement = arr => {
  if (!Array.isArray(arr)) return undefined;
  return arr[0];
};

export const partFactory = () => ({
  name: "",
  date: new Date().getTime(),
  seq: "",
  compSeq: "",
  tags: [],
  annotations: [],
  cutSites: [],
  note: ""
});

export const partStub = colors => {
  const sequence =
    "atcguyrwskmdvhbxnATCGUYRWSKMDVHBXNatcguyrwskmdvhbxnATCGUYRWSKMDVHBXNatcguyrwskmdvhbxnATCGUYRWSKMDVHBXNatcguyrwskmdvhbxnATCGUYRWSKMDVHBXNatcguyrwskmdvhbxnATCGUYRWSKMDVHBXN";
  return {
    ...partFactory(),
    name: "No Part to Display",
    seq: sequence,
    compSeq: dnaComplement(sequence).compSeq,
    annotations: [
      {
        ...annotationFactory(colors),
        start: 20,
        end: 30,
        direction: "FORWARD",
        name: "forward annotation"
      },
      {
        ...annotationFactory(colors),
        start: 50,
        end: 70,
        direction: "REVERSE",
        name: "reverse annotation"
      }
    ]
  };
};
