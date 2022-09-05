import { NameRange, SeqType } from "../elements";
import { complement } from "./parser";
import { getAlphabet, nucleotides, reverse } from "./sequence";

/**
 * Search the seq in the forward and reverse complement strands.
 * Return all matched regions. Accounts for abiguous BP encodings and allows for mismatches
 */
export default (query: string, mismatch = 0, seq = "", seqType: SeqType): NameRange[] => {
  if (!query || !query.length || !seq || !seq.length) {
    return [];
  }

  // Only start searching after query is at least 2 letters, lowest meaningful length
  if (query.length - mismatch < 2) {
    return [];
  }

  const indices = search(query, seq, mismatch, true, seqType);
  if (["dna", "rna"].includes(seqType)) {
    const { compSeq } = complement(seq);
    const compIndices = search(reverse(query), compSeq, mismatch, false, seqType);
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
const search = (query: string, subject: string, mismatch: number, fwd: boolean, seqType: SeqType) => {
  if (mismatch > 0) {
    return searchWithMismatch(query, subject, mismatch, fwd, seqType);
  }

  const seqLength = subject.length;
  const regex = createRegex(query, seqType);

  let match = regex.exec(subject);
  const results: NameRange[] = [];
  while (match) {
    const start = match.index % seqLength;
    const end = (start + query.length) % seqLength || seqLength;
    results.push({
      direction: fwd ? 1 : -1,
      end: end,
      id: `${start}-${fwd ? "fwd" : "rev"}`,
      name: "",
      start: start,
    });
    match = regex.exec(subject);
  }
  return results;
};

/**
 * A slightly modified Hamming Distance algorithm for approximate string Matching for patterns
 */
const searchWithMismatch = (query: string, subject: string, mismatch: number, fwd: boolean, seqType: SeqType) => {
  const alphabet = getAlphabet(seqType);

  const results: NameRange[] = [];
  for (let i = 0; i < subject.length - query.length; i += 1) {
    let missed = 0;

    for (let j = 0; j < query.length; j += 1) {
      const targetChar = subject[i + j].toLowerCase();
      const queryChar = query[j].toLowerCase();
      if (nucleotides[queryChar]) {
        if (targetChar !== queryChar) {
          missed += 1;
        }
      } else if (alphabet[queryChar]) {
        if (!alphabet[queryChar][targetChar]) {
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

  const pattern = query
    .toLowerCase()
    .split("")
    .map(symbol => (alphabet[symbol] ? `(${Object.keys(alphabet[symbol]).join("|")})` : symbol))
    .join("");

  return new RegExp(pattern.trim(), "gi");
};
