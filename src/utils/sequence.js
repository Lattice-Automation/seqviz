import { colorByIndex, chooseRandomColor } from "./colors";
import { dnaComplement } from "./parser";
import randomid from "./randomid";

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

/**
 * mapping the 64 standard codons to amino acids
 * no synth AA's
 *
 * adapted from: "https://github.com/keithwhor/NtSeq/blob/master/lib/nt.js
 */
const codon2AA = {
  AAA: "K",
  AAT: "N",
  AAG: "K",
  AAC: "N",
  ATA: "I",
  ATT: "I",
  ATG: "M",
  ATC: "I",
  AGA: "R",
  AGT: "S",
  AGG: "R",
  AGC: "S",
  ACA: "T",
  ACT: "T",
  ACG: "T",
  ACC: "T",
  TAA: "*",
  TAT: "Y",
  TAG: "*",
  TAC: "Y",
  TTA: "L",
  TTT: "F",
  TTG: "L",
  TTC: "F",
  TGA: "*",
  TGT: "C",
  TGG: "W",
  TGC: "C",
  TCA: "S",
  TCT: "S",
  TCG: "S",
  TCC: "S",
  GAA: "E",
  GAT: "D",
  GAG: "E",
  GAC: "D",
  GTA: "V",
  GTT: "V",
  GTG: "V",
  GTC: "V",
  GGA: "G",
  GGT: "G",
  GGG: "G",
  GGC: "G",
  GCA: "A",
  GCT: "A",
  GCG: "A",
  GCC: "A",
  CAA: "Q",
  CAT: "H",
  CAG: "Q",
  CAC: "H",
  CTA: "L",
  CTT: "L",
  CTG: "L",
  CTC: "L",
  CGA: "R",
  CGT: "R",
  CGG: "R",
  CGC: "R",
  CCA: "P",
  CCT: "P",
  CCG: "P",
  CCC: "P"
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
    .map(letter => (nucleotideWildCards[letter] ? `(${Object.keys(nucleotideWildCards[letter]).join("|")})` : letter))
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
export const calcGC = sequence => {
  if (!sequence) {
    return 0;
  }
  const gcCount = (sequence.match(/[CG]/gi) || []).length;
  const gcPerc = (gcCount / sequence.length) * 100;

  return parseFloat(gcPerc.toFixed(2));
};

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
  if (numberbps > 24 && numberbps < 46 && gcpercent > 40 && sequence.slice(0, 1) in { G: "G", C: "C" }) {
    return (100 / numberbps) * (0.815 * numberbps + 0.41 * numbergcs - numbermismatches - 6.75);
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

export const annotationFactory = (i = -1, colors = null) => ({
  id: randomid(),
  color: i >= 0 ? colorByIndex(i, colors) : chooseRandomColor(colors),
  name: "",
  type: "",
  start: 0,
  end: 0,
  direction: "NONE"
});

export const primerFactory = () => ({
  overhang: "",
  name: "",
  id: randomid(),
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

/**
 * translateDNA
 *
 * given a sequence of DNA, translate it into an AMINO ACID sequence
 */
export const translateDNA = seqInput => {
  const seq = seqInput.toUpperCase();
  const seqLength = seq.length;
  let aaSeq = "";
  for (let i = 0, j = 0; i < seqLength; i += 3, j += 1) {
    if (i + 2 < seqLength) {
      aaSeq += codon2AA[seq[i] + seq[i + 1] + seq[i + 2]] || "?";
    }
  }
  return aaSeq;
};

/**
 * createLinearTranslations
 *
 * a function used by SeqViewer/Circular to take a "translation", as it's stored
 * in the DB (just a start and end point referencing the part sequence) and convert
 * that into elements that are useful for the SeqBlocks
 *
 * the seqBlocks need, at a minimum, to know the direction of the translation, the
 * amino acids relevant to their seqBlock, and the start and end point of the translation
 *
 * the actual start and end point of the translation will usually differ from that in storage,
 * because not all basepairs within the start and end point might be used within the
 * actual translation. For example, if the user selects 5 bps and makes a translation,
 * only the first 3 will be used. so the actual start is 1 and the actual end is 3 (inclusive)
 */
export const createLinearTranslations = (translations, dnaSeq) => {
  // elongate the original sequence to account for translations that cross the zero index
  const dnaDoubled = dnaSeq + dnaSeq;
  return translations.map(t => {
    const { start, direction } = t;
    let { end } = t;
    if (start > end) end += dnaSeq.length;

    // get the DNA sub sequence
    const subDNASeq =
      direction === 1
        ? dnaDoubled.substring(start, end)
        : dnaComplement(dnaDoubled.substring(start, end))
            .compSeq.split("")
            .reverse()
            .join(""); // get reverse complement

    // translate the DNA sub sequence
    const AAseq =
      direction === 1
        ? translateDNA(subDNASeq)
        : translateDNA(subDNASeq)
            .split("")
            .reverse()
            .join(""); // translate

    // the starting point for the translation, reading left to right (regardless of translation
    // direction). this is later needed to calculate the number of bps needed in the first
    // and last codons
    const tStart = direction === 1 ? start : end - AAseq.length * 3;
    let tEnd = direction === 1 ? (start + AAseq.length * 3) % dnaSeq.length : end % dnaSeq.length;

    // treating one particular edge case where the start at zero doesn't make sense
    if (tEnd === 0) {
      tEnd += dnaSeq.length;
    }

    return {
      id: randomid(),
      name: "translation",
      ...t,
      start: tStart,
      end: tEnd,
      AAseq: AAseq
    };
  });
};
