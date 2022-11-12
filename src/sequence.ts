import { Range, SeqType } from "./elements";
import randomid from "./randomid";

/**
 * Map of nucleotide bases
 */
export const nucleotides = { a: "a", c: "c", g: "g", t: "t", u: "u" };

/**
 * Map of DNA basepairs to all the bases encoded by that character in the DNA alphabet.
 *
 * https://meme-suite.org/meme/doc/alphabets.html
 */
const dnaAlphabet = {
  // ".": { a: "a", c: "c", g: "g", t: "t" },
  b: { c: "c", g: "g", t: "t" },
  d: { a: "a", g: "g", t: "t" },
  h: { a: "a", c: "c", t: "t" },
  k: { g: "g", t: "t" },
  m: { a: "a", c: "c" },
  n: { a: "a", c: "c", g: "g", t: "t" },
  r: { a: "a", g: "g" },
  s: { c: "c", g: "g" },
  v: { a: "a", c: "c", g: "g" },
  w: { a: "a", t: "t" },
  x: { a: "a", c: "c", g: "g", t: "t" },
  y: { c: "c", t: "t" },
};

/**
 * Map of RNA basepairs to all the bases encoded by that character in the RNA alphabet.
 *
 * https://meme-suite.org/meme/doc/alphabets.html
 */
const rnaAlphabet = {
  // ".": { c: "c", g: "g", u: "u" },
  b: { c: "c", g: "g", u: "u" },
  d: { a: "a", g: "g", u: "u" },
  h: { a: "a", c: "c", u: "u" },
  k: { g: "g", u: "u" },
  m: { a: "a", c: "c" },
  n: { a: "a", c: "c", g: "g", u: "u" },
  r: { a: "a", g: "g" },
  s: { c: "c", g: "g" },
  v: { a: "a", c: "c", g: "g" },
  w: { a: "a", u: "u" },
  x: { a: "a", c: "c", g: "g", u: "u" },
  y: { c: "c", u: "u" },
};

/**
 * mapping the 64 standard codons to amino acids
 * no synth AA's
 *
 * adapted from: "https://github.com/keithwhor/NtSeq/blob/master/lib/nt.js
 */
const codon2AA = {
  AAA: "K",
  AAC: "N",
  AAG: "K",
  AAT: "N",
  ACA: "T",
  ACC: "T",
  ACG: "T",
  ACT: "T",
  AGA: "R",
  AGC: "S",
  AGG: "R",
  AGT: "S",
  ATA: "I",
  ATC: "I",
  ATG: "M",
  ATT: "I",
  CAA: "Q",
  CAC: "H",
  CAG: "Q",
  CAT: "H",
  CCA: "P",
  CCC: "P",
  CCG: "P",
  CCT: "P",
  CGA: "R",
  CGC: "R",
  CGG: "R",
  CGT: "R",
  CTA: "L",
  CTC: "L",
  CTG: "L",
  CTT: "L",
  GAA: "E",
  GAC: "D",
  GAG: "E",
  GAT: "D",
  GCA: "A",
  GCC: "A",
  GCG: "A",
  GCT: "A",
  GGA: "G",
  GGC: "G",
  GGG: "G",
  GGT: "G",
  GTA: "V",
  GTC: "V",
  GTG: "V",
  GTT: "V",
  TAA: "*",
  TAC: "Y",
  TAG: "*",
  TAT: "Y",
  TCA: "S",
  TCC: "S",
  TCG: "S",
  TCT: "S",
  TGA: "*",
  TGC: "C",
  TGG: "W",
  TGT: "C",
  TTA: "L",
  TTC: "F",
  TTG: "L",
  TTT: "F",
};

const aminoAcids = Array.from(new Set(Object.values(codon2AA)).values()).join("");
const aminoAcidsMap = aminoAcids
  .toLowerCase()
  .split("")
  .filter(aa => aa !== "*") // TODO
  .reduce((acc, aa) => ({ ...acc, [aa]: aa }), {});

/**
 * Map of amino acids alphabet characters to what each matches.
 *
 * https://meme-suite.org/meme/doc/alphabets.html
 */
const aaAlphabet = {
  b: { d: "d", n: "n" },
  j: { i: "i", l: "l" },
  x: aminoAcidsMap,
  z: { e: "e", q: "q" },
};

/** Given a seq type, return the associated symbol alphabet */
export const getAlphabet = (seqType: SeqType) => {
  return {
    aa: aaAlphabet,
    dna: dnaAlphabet,
    rna: rnaAlphabet,
    unknown: dnaAlphabet,
  }[seqType];
};

const aminoAcidRegex = new RegExp(`^[${aminoAcids}BJXZ]+$`, "i");

/**
 * Infer the type of a sequence. This is *without* any ambiguous symbols, so maybe wrong by being overly strict.
 */
export const guessType = (seq: string): SeqType => {
  seq = seq.substring(0, 1000);
  if (/^[atgcn.]+$/i.test(seq)) {
    return "dna";
  } else if (/^[augcn.]+$/i.test(seq)) {
    return "rna";
  } else if (aminoAcidRegex.test(seq)) {
    return "aa";
  }
  return "unknown";
};

/**
 * Reverses a string sequence
 */
export const reverse = (seq: string): string => seq.split("").reverse().join("");

// from http://arep.med.harvard.edu/labgc/adnan/projects/Utilities/revcomp.html
let dnaComp = {
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
dnaComp = {
  ...dnaComp,
  ...Object.keys(dnaComp).reduce((acc, k) => ({ ...acc, [k.toUpperCase()]: dnaComp[k].toUpperCase() }), {}),
};

/**
 * A map from each basepair to its complement
 */
const typeToCompMap = {
  aa: Object.keys(aminoAcidsMap).reduce((acc, k) => ({ ...acc, [k.toUpperCase()]: "", [k.toLowerCase()]: "" }), {
    B: "",
    J: "",
    Z: "",
    b: "",
    j: "",
    z: "",
  }),
  dna: dnaComp,
  rna: { ...dnaComp, A: "U", a: "u" },
  undefined: dnaComp,
};

/**
 * Return the filtered sequence and its complement if its an empty string, return the same for both.
 */
export const complement = (origSeq: string, seqType: SeqType): { compSeq: string; seq: string } => {
  if (!origSeq) {
    return { compSeq: "", seq: "" };
  }
  const compMap = typeToCompMap[seqType];

  // filter out unrecognized base pairs and build up the complement
  let seq = "";
  let compSeq = "";
  for (let i = 0, origLength = origSeq.length; i < origLength; i += 1) {
    if (origSeq[i] in compMap) {
      seq += origSeq[i];
      compSeq += compMap[origSeq[i]];
    }
  }
  return { compSeq, seq };
};

/**
 * Return the reverse complement of a DNA sequence
 */
export const reverseComplement = (inputSeq: string, seqType: SeqType): string => {
  const { compSeq } = complement(inputSeq, seqType);
  return compSeq.split("").reverse().join("");
};

const fwd = new Set(["FWD", "fwd", "FORWARD", "forward", "FOR", "for", "TOP", "top", "1", 1]);
const rev = new Set(["REV", "rev", "REVERSE", "reverse", "BOTTOM", "bottom", "-1", -1]);

/**
 * Parse the user defined direction, estimate the direction of the element
 *
 * ```js
 * directionality("FWD") => 1
 * directionality("FORWARD") => 1
 * ```
 */
export const directionality = (direction: number | string | undefined): -1 | 0 | 1 => {
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

/**
 * Given a sequence, translate it into an Amino Acid sequence
 */
export const translateDNA = (seqInput: string): string => {
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
export const createLinearTranslations = (translations: Range[], seq: string, seqType: SeqType) => {
  // elongate the original sequence to account for translations that cross the zero index
  const dnaDoubled = seq + seq;
  return translations.map(t => {
    const { direction, start } = t;
    let { end } = t;
    if (start > end) end += seq.length;

    // get the DNA sub sequence
    const subSeq =
      direction === 1 ? dnaDoubled.substring(start, end) : reverseComplement(dnaDoubled.substring(start, end), seqType);

    // translate the DNA sub sequence
    const AAseq = direction === 1 ? translateDNA(subSeq) : translateDNA(subSeq).split("").reverse().join(""); // translate

    // the starting point for the translation, reading left to right (regardless of translation
    // direction). this is later needed to calculate the number of bps needed in the first
    // and last codons
    const tStart = direction === 1 ? start : end - AAseq.length * 3;
    let tEnd = direction === 1 ? (start + AAseq.length * 3) % seq.length : end % seq.length;

    // treating one particular edge case where the start at zero doesn't make sense
    if (tEnd === 0) {
      tEnd += seq.length;
    }

    return {
      id: randomid(),
      name: "translation",
      ...t,
      AAseq: AAseq,
      end: tEnd,
      start: tStart,
    };
  });
};
