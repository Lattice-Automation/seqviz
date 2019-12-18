import {
  nucleotides,
  nucleotideWildCards,
  translateWildNucleotides
} from "./sequence";
import { dnaComplement } from "./parser";

/**
 * Check that the query warrants a search
 * Also determines whether no search or invalid search
 * messages need to be displayed.
 */
export default (query, mismatch, seq) => {
  // Only start searching after query is at least 3 letters
  // which is the length of a codon, probably the lowest
  // meaningful number of letters for a search
  // this prevents initial searches with ridiculous number or
  // search results during the type ahead
  if (!query || !query.length || !seq || !seq.length)
    return {
      results: [],
      index: 0
    };
  if (query.length - mismatch < 3) {
    console.error("Search too broad, please narrow parameters.");
    return {
      results: [],
      index: 0
    };
  }
  const { compSeq } = dnaComplement(seq);
  // Only start searching if search sequence contains recognized characters
  const translatedQuery = translateWildNucleotides(query.toLowerCase()).trim();
  const regTest = new RegExp(
    `[^${Object.keys(nucleotides).join("")}()|]`,
    "gi"
  );
  if (regTest.test(translatedQuery)) {
    console.error(
      "Invalid characters found in query. Search only supports nucleotide bases and nucleotide wildcards."
    );
    return {
      results: [],
      index: 0
    };
  }
  const revValue = query
    .split("")
    .reverse()
    .join("");

  const tempSearchParams = {
    query: query,
    targetString: seq,
    mismatch: mismatch
  };
  const compSearchParams = {
    query: revValue,
    targetString: compSeq,
    mismatch: mismatch
  };

  const indices = findString(tempSearchParams, true, seq.length);
  const compIndices = findString(compSearchParams, false, seq.length);

  // If results are greater than 4000 on either strand
  // throw out the search and tell user the search was too broad
  if (indices.length > 4000 || compIndices.length > 4000) {
    console.error("Search too broad, please narrow parameters.");
    return {
      results: [],
      index: 0
    };
  }

  return searchSeq(indices, compIndices, query.length, seq.length);
};

/**
 * findString
 * create an array of locations of the found substring, given the search term
 * and the target string to search through
 * row specifies whether the search result is on the template strand or complement
 */
const findString = (params, template, seqLength) => {
  const { query, targetString, mismatch } = params;
  const indices = [];

  const translatedQuery = translateWildNucleotides(query).trim();

  if (mismatch > 0) {
    const searchParams = {
      query,
      targetString,
      mismatch,
      template
    };
    return findWithMismatch(searchParams);
  }
  const regex = new RegExp(translatedQuery, "gi");

  let result = regex.exec(targetString);
  while (result) {
    indices.push({
      loc: result.index % seqLength,
      direction: template ? 1 : -1
    });
    result = regex.exec(targetString);
  }
  return indices;
};

/**
 * findWithMismatch
 * A slightly modified Hamming Distance algorithm for approximate
 * string Matching for patterns
 */
const findWithMismatch = searchParams => {
  const { query, targetString, mismatch, template } = searchParams;
  const results = [];
  const indexMax = targetString.length - query.length;

  for (let targetIndex = 0; targetIndex < indexMax; targetIndex += 1) {
    let missed = 0;

    for (let queryIndex = 0; queryIndex < query.length; queryIndex += 1) {
      const targetChar = targetString[targetIndex + queryIndex];
      const queryChar = query[queryIndex];
      if (nucleotides[queryChar]) {
        if (targetChar !== queryChar) missed += 1;
      } else if (nucleotideWildCards[queryChar]) {
        if (!nucleotideWildCards[queryChar][targetChar]) missed += 1;
      }
      if (missed > mismatch) break;
    }
    if (missed <= mismatch) {
      results.push({ loc: targetIndex, direction: template ? 1 : -1 });
    }
  }

  return results;
};

/**
 * searchSeq
 * For the reverse compliment, the search term is reversed before being sent to the Regex
 * function above
 */
const searchSeq = (indices, compIndices, queryLength, seqLength) => {
  const fullResult = [...new Set([...indices, ...compIndices])].sort(
    (a, b) => a.loc - b.loc
  );

  const results = fullResult.map((s, i) => {
    const end = s.loc + queryLength;
    const overflowEnd = end % seqLength;
    return {
      start: s.loc,
      end: overflowEnd > 0 ? overflowEnd : seqLength,
      direction: s.direction,
      index: i
    };
  });
  return { results: results, index: 0 };
};
