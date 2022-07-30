import { Annotation, Range, SeqType } from "../elements";
import { COLORS, chooseRandomColor, colorByIndex } from "./colors";
import { complement } from "./parser";
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
const aminoAcidRegex = new RegExp(`^[${aminoAcids}]+$`, "i");
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
  // ".": aminoAcidsMap, TODO: debug
  // "*": aminoAcidsMap,
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

/**
 * Infer the type of a sequence. This is *without* any ambiguous symbols, so maybe wrong by being overly strict.
 */
export const guessType = (seq: string): "dna" | "rna" | "aa" | "unknown" => {
  if (/^[atgc]+$/i.test(seq)) {
    return "dna";
  } else if (/^[augc]+$/i.test(seq)) {
    return "rna";
  } else if (aminoAcidRegex.test(seq)) {
    return "aa";
  }
  return "unknown";
};

/**
 * Find the mismatches
 */
export const getMismatchIndices = (sequence: string, match: string): number[] =>
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
 */
export const returnRanges = (indices: number[]): number[][] => {
  let currStart = indices[0];
  let currCount = indices[0] - 1;
  const ranges: number[][] = [];
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
 */
export const calcGC = (seq: string): number => {
  if (!seq) {
    return 0;
  }
  const gcCount = (seq.match(/[CG]/gi) || []).length;
  const gcPerc = (gcCount / seq.length) * 100;

  return parseFloat(gcPerc.toFixed(2));
};

/**
 * Calculate the melting temp for a given sequence
 */
export const calcTm = (seq: string, match: string = seq): number => {
  const numberbps = seq.length; // number of base pairs
  const numbergcs = (seq.match(/[CG]/gi) || []).length; // number of Gs and Cs
  const numberats = (seq.match(/[AT]/gi) || []).length; // number of As and Ts
  const numbermismatches = getMismatchIndices(seq, match).length; // # of mismatches
  const gcpercent = calcGC(seq);
  // https://www.biophp.org/minitools/melting_temperature/demo.php?formula=basic
  // formula valid for bps 0-14
  if (numberbps < 14) {
    return 2 * numberats + 4 * numbergcs;
  }

  // http://depts.washington.edu/bakerpg/primertemp/
  // formula valid for bps  25-45, gc% > 40 and seq terminates in one or more G/C
  if (numberbps > 24 && numberbps < 46 && gcpercent > 40 && seq.slice(0, 1) in { C: "C", G: "G" }) {
    return (100 / numberbps) * (0.815 * numberbps + 0.41 * numbergcs - numbermismatches - 6.75);
  }

  // https://www.biophp.org/minitools/melting_temperature/demo.php?formula=basic
  // generic formula for bps 14+ no mismatch
  return Math.round(64.9 + (41 * (numbergcs - 16.4)) / numberbps);
};

/**
 * Calculate the length of a sequence
 */
export const calcLength = (start: number, end: number, seqLength: number): number => {
  if (end > start) return end - start;
  if (end === start) return seqLength;
  return seqLength - start + end;
};

/**
 * Reverses a string sequence
 */
export const reverse = (seq: string): string => seq.split("").reverse().join("");

export const annotationFactory = (i = -1, colors?: string[]): Annotation => {
  const c = colors && colors.length ? colors : COLORS;
  return {
    color: i >= 0 ? colorByIndex(i, c) : chooseRandomColor(c),
    direction: 0,
    end: 0,
    id: randomid(),
    name: "",
    start: 0,
  };
};

export const primerFactory = () => ({
  any: 0,
  complementId: "",
  dimer: 0,
  gc: 0,
  hairpin: 0,
  id: randomid(),
  name: "",
  overhang: "",
  penalty: 0,
  sequence: "",
  stability: 0,
  strict: false,
  tm: 0,
  vector: "",
});

/**
 * Given a sequence of DNA, translate it into an AMINO ACID sequence
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
export const createLinearTranslations = (translations: Range[], dnaSeq: string) => {
  // elongate the original sequence to account for translations that cross the zero index
  const dnaDoubled = dnaSeq + dnaSeq;
  return translations.map(t => {
    const { direction, start } = t;
    let { end } = t;
    if (start > end) end += dnaSeq.length;

    // get the DNA sub sequence
    const subDNASeq =
      direction === 1
        ? dnaDoubled.substring(start, end)
        : complement(dnaDoubled.substring(start, end)).compSeq.split("").reverse().join(""); // get reverse complement

    // translate the DNA sub sequence
    const AAseq = direction === 1 ? translateDNA(subDNASeq) : translateDNA(subDNASeq).split("").reverse().join(""); // translate

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
      AAseq: AAseq,
      end: tEnd,
      start: tStart,
    };
  });
};
