import { dnaComplement } from "./parser";
import { nucleotideWildCards, nucleotides, reverse, translateWildNucleotides } from "./sequence";

export interface SearchResult {
  start: number;
  end: number;
  direction: number;
  index?: number;
  length?: number;
}

/**
 * Search the seq in the forward and reverse complement strands.
 * Return all matched regions. Accounts for abiguous BP encodings and allows for mismatches
 */
export default (query: string, mismatch: number, seq: string): SearchResult[] => {
  if (!query || !query.length || !seq || !seq.length) {
    return [];
  }

  // Only start searching after query is at least 3 letters, lowest meaningful length
  if (query.length - mismatch < 3) {
    console.error("search too broad, please narrow parameters.");
    return [];
  }

  const { compSeq } = dnaComplement(seq);

  const indices: SearchResult[] = search(query, seq, mismatch, true);
  const compIndices = search(reverse(query), compSeq, mismatch, false);

  if (indices.length > 4000 || compIndices.length > 4000) {
    // failing out here because rendering will be too expensive
    console.error(`Search too broad, ${indices.length + compIndices.length} matches. Please narrow parameters.`);
    return [];
  }

  const searchResults = indices.concat(compIndices).sort((a, b) => a.start - b.start);

  return searchResults;
};

/**
 * Search the sequence
 *
 * If there's no mismatch, just use a RegExp to search over the sequence repeatedly
 * Otherwise, use the modified hamming search in `searchWithMismatch()`
 */
const search = (query: string, subject: string, mismatch: number, fwd: boolean): SearchResult[] => {
  if (mismatch > 0) {
    return searchWithMismatch(query, subject, mismatch, fwd);
  }

  const seqLength = subject.length;
  const translatedQuery = translateWildNucleotides(query).trim();
  const regex = new RegExp(translatedQuery, "gi");
  let result = regex.exec(subject);
  const results: SearchResult[] = [];
  while (result) {
    const start = result.index % seqLength;
    const end = (start + query.length) % seqLength || seqLength;
    results.push({
      start: start,
      end: end,
      direction: fwd ? 1 : -1,
    });
    result = regex.exec(subject);
  }
  return results;
};

/**
 * A slightly modified Hamming Distance algorithm for approximate
 * string Matching for patterns
 */
const searchWithMismatch = (query: string, subject: string, mismatch: number, fwd: boolean): SearchResult[] => {
  const results = [];
  for (let i = 0; i < subject.length - query.length; i += 1) {
    let missed = 0;

    for (let j = 0; j < query.length; j += 1) {
      const targetChar = subject[i + j].toLowerCase();
      const queryChar = query[j].toLowerCase();
      if (nucleotides[queryChar]) {
        if (targetChar !== queryChar) {
          missed += 1;
        }
      } else if (nucleotideWildCards[queryChar]) {
        if (!nucleotideWildCards[queryChar][targetChar]) {
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
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
        start: i,
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
        end: end,
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
        direction: fwd ? 1 : -1,
      });
    }
  }

  return results;
};
