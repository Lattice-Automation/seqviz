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
  u: "a",
};

/**
 * @typedef {Object} SeqReturn
 * @type {object}
 * @property {string} seq the template sequence
 * @property {string} compSeq the complement sequence
 */

/**
 * return the filtered sequence and its complement
 * if its an empty string, return the same for both
 */
export const dnaComplement = (origSeq: string): SeqReturn => {
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
 * Return the reverse complement of a DNA sequence
 *
 * @param {string}  seq the seq that we're interested in finding the reverse complement of
 * @return {string}     the reverse complement of the input
 */
export const reverseComplement = inputSeq => {
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
 * @param {String} direction user defined direction for a SeqViz element
 */
export const directionality = direction => {
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

export const partFactory = () => ({
  name: "",
  date: new Date().getTime(),
  seq: "",
  compSeq: "",
  tags: [],
  annotations: [],
  primers: [],
  cutSites: [],
  note: "",
  source: { name: "", file: "" },
});
