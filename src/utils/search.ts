import { Ranged, SeqType } from "../elements";
import { complement } from "./parser";
import { getAlphabet, nucleotides, reverse } from "./sequence";

/**
 * Search the seq in the forward and reverse complement strands.
 * Return all matched regions. Accounts for abiguous BP encodings and allows for mismatches
 */
export default (query: string, mismatch = 0, seq = "", seqType: SeqType): Ranged[] => {
  if (!query || !query.length || !seq || !seq.length) {
    return [];
  }

  // Only start searching after query is at least 3 letters, lowest meaningful length
  if (query.length - mismatch < 3) {
    console.warn(
      "Search too broad, please narrow parameters. Less than 3 symbols to match: %d",
      query.length - mismatch
    );
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
    console.error("Search too broad, %d matches. Please narrow parameters.", indices.length);
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
  const regex = new RegExp(createRegex(query, seqType).trim(), "gi");

  let match = regex.exec(subject);
  const results: Ranged[] = [];
  while (match) {
    const start = match.index % seqLength;
    const end = (start + query.length) % seqLength || seqLength;
    results.push({
      direction: fwd ? 1 : -1,
      end: end,
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

  const results: Ranged[] = [];
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
        start: i,
      });
    }
  }

  return results;
};

/**
 * Translate common symbols to their wildcards to build up a regex.
 */
export const createRegex = (query: string, seqType: SeqType): string => {
  const alphabet = getAlphabet(seqType);

  return query
    .toLowerCase()
    .split("")
    .map(symbol => (alphabet[symbol] ? `(${Object.keys(alphabet[symbol]).join("|")})` : symbol))
    .join("");
};
