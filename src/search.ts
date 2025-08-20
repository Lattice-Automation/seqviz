import { NameRange, SeqType, TranslationProp } from "./elements";
import { complement, createTranslations, getAlphabet, nucleotides, reverse } from "./sequence";

export type SearchResult = NameRange & {
  sequenceType: SeqType;
};

/**
 * Search the seq in the forward and reverse complement strands.
 * Return all matched regions. Accounts for abiguous BP encodings and allows for mismatches
 */
export default (query: string, mismatch = 0, seq = "", seqType: SeqType, translations: TranslationProp[]): SearchResult[] => {
  if (!query || !query.length || !seq || !seq.length) {
    return [];
  }

  // Only start searching after query is at least 2 letters, lowest meaningful length
  if (query.trim().length - mismatch < 2) {
    return [];
  }

  // createTranslations does two things to make searching allTranslations
  // easier than searching translations directly:
  // - It calculates the amino acid sequence for any translation that doesn't
  //   have one (hence the "all" in allTranslations)
  // - It "reverses" the sequence of reversed translations so that
  //   AAseq that it appears on seq - so we don't need to worry about whether
  //   a translation is reversed when calculating indices because that's already
  //   baked in.
  const allTranslations = createTranslations(translations.map((t, i) => ({
    ...t,
    // createTranslations has stricter type requirements for direction than
    // just number
    direction: t.direction ? (t.direction < 0 ? -1 : 1) : 1,
    // createTranslation requires a unique id, though it doesn't actually
    // matter for our use case.
    id: `translation${t.name}${i}${t.start}${t.end}`,
  })), seq, seqType);

  const indices = search(query, seq, mismatch, true, seqType, allTranslations);
  if (["dna", "rna"].includes(seqType)) {
    const { compSeq } = complement(seq, seqType);
    const compIndices = search(reverse(query), compSeq, mismatch, false, seqType, allTranslations);
    indices.push(...compIndices);
  }

  if (indices.length > 4000) {
    // Fail out with warning. Rendering would be too expensive.
    console.error("Search too broad: >4000 matches. Please narrow parameters.");
    return [];
  }

  return indices.sort((a, b) => a.start - b.start);
};

/**
 * If there's no mismatch, just use a RegExp to search over the sequence repeatedly
 * Otherwise, use the modified hamming search in `searchWithMismatch()`
 */
const search = (query: string, subject: string, mismatch: number, fwd: boolean, seqType: SeqType, translations: TranslationProp[]) => {
  if (mismatch > 0) {
    return searchWithMismatch(query, subject, mismatch, fwd, seqType);
  }

  const seqLength = subject.length;

  // Search the main sequence
  const regex = createRegex(query, seqType);
  const mainSequenceResults = searchSequenceWithRegex(query, subject, seqLength, fwd, seqType, regex);

  // Search AA translations if the main sequence is not AA
  // (if seqType is AA, we ONLY display translations and that search is covered by searchSequenceWithRegex)
  // In Kernel we never use seqType === "aa"
  const aaRegex = createRegex(query, "aa");
  const aaResults = seqType !== "aa" ? searchTranslationsWithRegex(query, translations, aaRegex) : [];

  return [...mainSequenceResults, ...aaResults];
};

/**
 * Search the main sequence using regex
 */
const searchSequenceWithRegex = (
  query: string,
  subject: string,
  seqLength: number,
  fwd: boolean,
  seqType: SeqType,
  regex: RegExp
): SearchResult[] => {
  let match = regex.exec(subject);
  const results: SearchResult[] = [];
  while (match) {
    const start = match.index % seqLength;
    const end = (start + query.length) % seqLength || seqLength;
    results.push({
      direction: fwd ? 1 : -1,
      end: end,
      id: `${start}-${fwd ? "fwd" : "rev"}`,
      name: "",
      start: start,
      sequenceType: seqType,
    });
    match = regex.exec(subject);
  }

  return results;
};

/**
 * Search AA translations for matches
 */
const searchTranslationsWithRegex = (
  query: string,
  translations: TranslationProp[],
  regex: RegExp
): SearchResult[] => {
  return translations
    .filter(translation => translation.AAseq)
    .map(translation => searchSingleTranslationWithRegex(query, translation, regex))
    .flat();
};

/**
 * Search a single translation for AA matches
 */
const searchSingleTranslationWithRegex = (
  query: string,
  translation: TranslationProp,
  aaRegex: RegExp
): SearchResult[] => {
  const results: SearchResult[] = [];
  const aaSeq = translation.AAseq;

  if (!aaSeq) {
    return results;
  }

  let aaMatch = aaRegex.exec(aaSeq);

  while (aaMatch) {
    // Where the translation that we were searching against starts relative to
    // the start of the entire sequence, in nucleotides
    const startInNucleotides = translation.start;
    // How far into the translation the match starts, in amino acids
    const offsetInAAs = aaMatch.index;
    // Where the match starts in nucleotides relative to the start of the
    // entire sequence
    const matchStartInNucleotides = startInNucleotides + offsetInAAs * 3;
    const matchEndInNucleotides = matchStartInNucleotides + query.length * 3;

    results.push({
      direction: 1,
      end: matchEndInNucleotides,
      id: `${matchStartInNucleotides}-aa`,
      name: "",
      start: matchStartInNucleotides,
      sequenceType: "aa",
    });

    aaMatch = aaRegex.exec(aaSeq);
  }

  return results;
};

/**
 * A slightly modified Hamming Distance algorithm for approximate string Matching for patterns
 */
const searchWithMismatch = (query: string, subject: string, mismatch: number, fwd: boolean, seqType: SeqType) => {
  const alphabet = getAlphabet(seqType);

  const results: SearchResult[] = [];
  for (let i = 0; i < subject.length - query.length; i += 1) {
    let missed = 0;

    for (let j = 0; j < query.length; j += 1) {
      const targetChar = subject[i + j].toLowerCase();
      const queryChar = query[j].toLowerCase();
      if (nucleotides[queryChar as keyof typeof nucleotides]) {
        if (targetChar !== queryChar) {
          missed += 1;
        }
      } else if (alphabet[queryChar as keyof typeof alphabet]) {
        const found = alphabet[queryChar as keyof typeof alphabet];
        if (!found[targetChar as keyof typeof found]) {
          missed += 1;
        }
      }
      if (missed > mismatch) {
        break;
      }
    }

    if (missed <= mismatch) {
      const end = (i + query.length) % subject.length || subject.length;
      results.push({
        direction: fwd ? 1 : -1,
        end: end,
        id: `${i}-${fwd ? "fwd" : "rev"}`,
        name: "",
        start: i,
        sequenceType: seqType,
      });
    }
  }

  return results;
};

/**
 * Translate common symbols to their wildcards to build up a regex. The regex is case insensitive.
 *
 * Eg "N" matches [ATGCU]. So a query of "ANN" maps to "A(A|T|G|C|U)(A|T|G|C|U)"
 */
export const createRegex = (query: string, seqType: SeqType): RegExp => {
  const alphabet = getAlphabet(seqType);
  const pattern = escapeRegExp(query)
    .toLowerCase()
    .split("")
    .map(symbol => (alphabet[symbol as keyof typeof alphabet] ? `(${Object.keys(alphabet[symbol as keyof typeof alphabet]).join("|")})` : symbol))
    .join("");

  return new RegExp(pattern.trim(), "gi");
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}