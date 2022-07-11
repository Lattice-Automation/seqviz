import { Ranged } from "../elements";
import { dnaComplement } from "./parser";
import { nucleotideWildCards, nucleotides, reverse, translateWildNucleotides } from "./sequence";

/**
 * Search the seq in the forward and reverse complement strands.
 * Return all matched regions. Accounts for abiguous BP encodings and allows for mismatches
 */
export default (query: string, mismatch = 0, seq = ""): Ranged[] => {
  if (!query || !query.length || !seq || !seq.length) {
    return [];
  }

  // Only start searching after query is at least 3 letters, lowest meaningful length
  if (query.length - mismatch < 3) {
    console.error("search too broad, please narrow parameters.");
    return [];
  }

  const { compSeq } = dnaComplement(seq);

  const indices = search(query, seq, mismatch, true);
  const compIndices = search(reverse(query), compSeq, mismatch, false);

  if (indices.length > 4000 || compIndices.length > 4000) {
    // Fail out with warning. Rendering would be too expensive.
    console.error(`Search too broad, ${indices.length + compIndices.length} matches. Please narrow parameters.`);
    return [];
  }

  return indices.concat(compIndices).sort((a, b) => a.start - b.start);
};

/**
 * Search the sequence
 *
 * If there's no mismatch, just use a RegExp to search over the sequence repeatedly
 * Otherwise, use the modified hamming search in `searchWithMismatch()`
 */
const search = (query: string, subject: string, mismatch: number, fwd: boolean) => {
  if (mismatch > 0) {
    return searchWithMismatch(query, subject, mismatch, fwd);
  }

  const seqLength = subject.length;
  const translatedQuery = translateWildNucleotides(query).trim();
  const regex = new RegExp(translatedQuery, "gi");
  let result = regex.exec(subject);
  const results: Ranged[] = [];
  while (result) {
    const start = result.index % seqLength;
    const end = (start + query.length) % seqLength || seqLength;
    results.push({
      direction: fwd ? 1 : -1,
      end: end,
      start: start,
    });
    result = regex.exec(subject);
  }
  return results;
};

/**
 * A slightly modified Hamming Distance algorithm for approximate
 * string Matching for patterns
 */
const searchWithMismatch = (query: string, subject: string, mismatch: number, fwd: boolean) => {
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
        direction: fwd ? 1 : -1,
        end: end,
        start: i,
      });
    }
  }

  return results;
};
