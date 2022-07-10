import { DirectionProp, Part } from "../part";

// from http://arep.med.harvard.edu/labgc/adnan/projects/Utilities/revcomp.html
const DNAComplement = {
  A: "T",
  B: "V",
  C: "G",
  D: "H",
  G: "C",
  H: "D",
  K: "M",
  M: "K",
  N: "N",
  R: "Y",
  S: "S",
  T: "A",
  U: "A",
  V: "B",
  W: "W",
  X: "X",
  Y: "R",
  a: "t",
  b: "v",
  c: "g",
  d: "h",
  g: "c",
  h: "d",
  k: "m",
  m: "k",
  n: "n",
  r: "y",
  s: "s",
  t: "a",
  u: "a",
  v: "b",
  w: "w",
  x: "x",
  y: "r",
};

/**
 * return the filtered sequence and its complement
 * if its an empty string, return the same for both
 */
export const dnaComplement = (origSeq: string): { compSeq: string; seq: string } => {
  if (!origSeq) {
    return { compSeq: "", seq: "" };
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
  return { compSeq, seq };
};

/**
 * Return the reverse complement of a DNA sequence
 */
export const reverseComplement = (inputSeq): string => {
  const { compSeq } = dnaComplement(inputSeq);
  return compSeq.split("").reverse().join("");
};

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

const fwd = new Set(["FWD", "FORWARD", "FOR", "1", 1]);
const rev = new Set(["REV", "REVERSE", "-1", -1]);

/**
 * Parse the user defined direction, estimate the direction of the element
 *
 * ```js
 * directionality("FWD") => 1
 * directionality("FORWARD") => 1
 * directionaltiy("NONSENSE") => 0
 * ```
 *
 */
export const directionality = (direction: DirectionProp | undefined | string): -1 | 0 | 1 => {
  if (!direction) {
    return 0;
  }
  if (fwd.has(direction)) {
    return 1;
  }
  if (rev.has(direction)) {
    return -1;
  }
  return 0;
};

export const partFactory = (): Part => ({
  annotations: [],
  compSeq: "",
  cutSites: [],
  date: new Date().getTime(),
  name: "",
  note: "",
  primers: [],
  seq: "",
  source: { file: "", name: "" },
});
