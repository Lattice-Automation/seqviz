import { dnaComplement } from "./parser";
import { nucleotides, nucleotideWildCards, reverse, translateWildNucleotides } from "./sequence";

/**
 * Search the seq in the forward and reverse complement strands.
 * Return all matched regions. Accounts for abiguous BP encodings and allows for mismatches
 *
 * @param {string} query the query string to search with
 * @param {number} mismatch the number of allowable mismatches
 * @param {string} seq the sequence being searched
 * @returns {SearchResult[]} an array of search results
 */
export default (query, mismatch, seq) => {
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
 *
 * @param {string} query the search pattern
 * @param {string} subject the sequence to search over
 * @param {number} mismatch the number of allowable mismatches
 * @param {boolean} fwd whether this is in the FWD direction
 * @returns {[SeqReturn]}
 */
const search = (query, subject, mismatch, fwd) => {
  if (mismatch > 0) {
    return searchWithMismatch(query, subject, mismatch, fwd);
  }

  const seqLength = subject.length;
  const translatedQuery = translateWildNucleotides(query).trim();
  const regex = new RegExp(translatedQuery, "gi");
  let result = regex.exec(subject);
  const results = [];
  while (result) {
    const start = result.index % seqLength;
    const end = (start + query.length) % seqLength || seqLength;
    results.push({
      start: start,
      end: end,
      direction: fwd ? 1 : -1
    });
    result = regex.exec(subject);
  }
  return results;
};

/**
 * A slightly modified Hamming Distance algorithm for approximate
 * string Matching for patterns
 *
 * @param {string} query the query pattern
 * @param {string} subject the sequence being searched
 * @param {number} mismatch the number of allowable mismatches
 * @param {boolean} fwd true if FWD, false otherwise
 * @returns {[SearchResult]}
 */
const searchWithMismatch = (query, subject, mismatch, fwd) => {
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
        start: i,
        end: end,
        direction: fwd ? 1 : -1
      });
    }
  }

  return results;
};
