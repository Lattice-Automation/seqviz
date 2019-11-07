import shortid from "shortid";
import { genRandomColor } from "./colors";

/**
 * Resources shareable throughout Loom
 */

/**
 * Map of nucleotide bases
 */
export const nucleotides = { a: "a", c: "c", t: "t", g: "g", u: "u" };

/**
 * Map of common nucleotide wildcards to their translations
 */
export const nucleotideWildCards = {
  y: { c: "c", t: "t" },
  r: { a: "a", g: "g" },
  w: { a: "a", t: "t" },
  s: { g: "g", c: "c" },
  k: { t: "t", g: "g" },
  m: { c: "c", a: "a" },
  d: { a: "a", g: "g", t: "t" },
  v: { a: "a", c: "c", g: "g" },
  h: { a: "a", c: "c", t: "t" },
  b: { c: "c", g: "g", t: "t" },
  x: { a: "a", c: "c", g: "g", t: "t" },
  n: { a: "a", c: "c", g: "g", t: "t" }
};

export const validSequenceCharacters = {
  ...nucleotides,
  ...nucleotideWildCards
};

/**
 * Translate common nucleotide wildcards
 *
 * Search string sequence for nucleotide wildcards
 * and replace with proper regex
 *
 * @param {String} query
 * @return {String} [/regex/]
 */
export const translateWildNucleotides = nucleotideSequence =>
  nucleotideSequence
    .toLowerCase()
    .split("")
    .map(letter =>
      nucleotideWildCards[letter]
        ? `(${Object.keys(nucleotideWildCards[letter]).join("|")})`
        : letter
    )
    .join("");

/**
 * Find the mismatches
 * @param {string} sequence
 * @param {string} match: match sequence
 * @return {array} mismatches: array of indexes of mismatches
 */
export const getMismatchIndices = (sequence, match) =>
  sequence
    .split("")
    .map((nucleotide, i) => {
      if (nucleotide !== match.split("")[i]) {
        return i;
      }
      return -1;
    })
    .filter(e => e !== -1);

/**
 * Combine sequential indices into ranges
 * @param {array} indices
 * @return {array} array of ranges stored as arrays with start [0] and end [1]
 */
export const returnRanges = indices => {
  let currStart = indices[0];
  let currCount = indices[0] - 1;
  const ranges = [];
  indices.forEach((index, i) => {
    if (index > currCount + 1) {
      ranges.push([currStart, indices[i - 1]]);
      currStart = index;
      currCount = index - 1;
    }
    if (index === indices[indices.length - 1]) {
      ranges.push([currStart, index]);
    }
    currCount += 1;
  });
  return ranges;
};

/**
 * Calculate the GC% of a sequence
 * @param {string} sequence
 */
export const calcGC = sequence =>
  sequence === ""
    ? 0
    : ((sequence.match(/[CG]/gi) || []).length / sequence.length) * 100;

/**
 * Calculate the melting temp for a given sequence
 * @param {string} sequence
 * @param {string} match: sequence to match against
 */
export const calcTm = (sequence, match = sequence) => {
  const numberbps = sequence.length; // number of base pairs
  const numbergcs = (sequence.match(/[CG]/gi) || []).length; // number of Gs and Cs
  const numberats = (sequence.match(/[AT]/gi) || []).length; // number of As and Ts
  const numbermismatches = getMismatchIndices(sequence, match).length; // # of mismatches
  const gcpercent = calcGC(sequence);
  // https://www.biophp.org/minitools/melting_temperature/demo.php?formula=basic
  // formula valid for bps 0-14
  if (numberbps < 14) {
    return 2 * numberats + 4 * numbergcs;
  }

  // http://depts.washington.edu/bakerpg/primertemp/
  // formula valid for bps  25-45, gc% > 40 and sequence terminates in one or more G/C
  if (
    numberbps > 24 &&
    numberbps < 46 &&
    gcpercent > 40 &&
    sequence.slice(0, 1) in { G: "G", C: "C" }
  ) {
    return (
      (100 / numberbps) *
      (0.815 * numberbps + 0.41 * numbergcs - numbermismatches - 6.75)
    );
  }

  // https://www.biophp.org/minitools/melting_temperature/demo.php?formula=basic
  // generic formula for bps 14+ no mismatch
  return Math.round(64.9 + (41 * (numbergcs - 16.4)) / numberbps);
};

/**
 * Calculate the length of a sequence
 * @param {number} start: start index of selection
 * @param {number} end: end index of selection
 * @param {number} seqLength: length of sequence
 */
export const calcLength = (start, end, seqLength) => {
  if (end > start) return end - start;
  if (end === start) return seqLength;
  return seqLength - start + end;
};

/**
 * Reverses a string sequence
 * @param {string} sequence
 */
export const reverse = sequence =>
  sequence
    .split("")
    .reverse()
    .join("");

/**
 * reverse the direction
 * @param direction
 */
export const reverseDirection = direction => {
  if (direction === "FORWARD") {
    return "REVERSE";
  }
  if (direction === "REVERSE") {
    return "FORWARD";
  }
  return "NONE";
};

export const reIndex = (sequence, start) => {
  const reIndexed = sequence.substr(start) + sequence.substr(0, start);
  return reIndexed;
};

export const defaultSelection = {
  ref: null,
  sequenceMeta: { sequence: "", GC: 0, Tm: 0 },
  selectionMeta: {
    type: "",
    start: 0,
    end: 0,
    selectionLength: 0,
    clockwise: true
  },
  feature: null
};

export const trimNewLines = str =>
  str.replace(/^\s+|^\n+|\s+|\n+|\s+$|\n+$/g, "");

/**
 * Minimum and maximum size of a selection used to create a primer
 */
export const primerSizeLimits = { min: 10, max: 500 };

/**
 * Minumum size of selection used to generate PCR primer pairs
 */
export const primerPcrSelectionLimits = { min: 23 };

/**
 * a default annotation generator
 */
export const annotationFactory = (fileName, annotationName, colors = []) => {
  let color;
  if (
    localStorage.getItem(
      `seqviz-cache-${fileName}-annotation-${annotationName}-color`
    )
  ) {
    color = localStorage.getItem(
      `seqviz-cache-${fileName}-annotation-${annotationName}-color`
    );
  } else {
    color = genRandomColor(colors);
    localStorage.setItem(
      `seqviz-cache-${fileName}-annotation-${annotationName}-color`,
      color
    );
  }
  return {
    id: shortid.generate(),
    color: color,
    name: "Untitled",
    type: "",
    start: 0,
    end: 0,
    direction: "NONE"
  };
};

export const primerFactory = () => ({
  overhang: "",
  name: "",
  id: shortid.generate(),
  complementId: "",
  gc: 0,
  tm: 0,
  any: 0,
  dimer: 0,
  hairpin: 0,
  stability: 0,
  penalty: 0,
  vector: "",
  sequence: "",
  strict: false
});
