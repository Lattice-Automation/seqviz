import { CutSite, Enzyme } from "../elements";
import presetEnzymes from "./enzymes";
import { reverseComplement } from "./parser";
import { createRegex } from "./search";

/**
 * Digest a sequence with the enzymes and return an array of cut-site.
 *
 * This is slow enough to impact rendering so shouldn't be ran on each prop change.
 */
export default (
  seq: string,
  enzymes: (Enzyme | string)[] = [],
  enzymesCustom: { [key: string]: Enzyme } = {}
): CutSite[] => {
  const seqToCut = seq + seq;

  // find all the cut sites, deduplicate by index+direction of each cut-site
  const cutSites = enzymes
    // if it's a string, assume it's an enzyme name in the pre-defined enzyme list
    .map(e => (typeof e === "string" ? presetEnzymes[e.toLowerCase()] : e))
    // filter out enzyme names that were wrong
    .filter(e => e)
    // add in custom enzymes
    .concat(Object.values(enzymesCustom))
    // build up cut-sites
    .reduce((acc: { [key: string]: CutSite }, enzyme: Enzyme) => {
      // search for cut sites for this enzyme
      findCutSites(enzyme, seqToCut)
        // filter out cut sites that that only start/end at 0-index. I no longer remember what this was for.
        .filter(c => !(c.fcut === 0 && c.rcut === 0))
        // modulo the start/end and add an id to each cut-site. this could/should be in `findCutSites`
        .map(c => ({
          ...c,
          end: c.end % seq.length,
          fcut: c.fcut % seq.length,
          id: `${enzyme.name}-${enzyme.rseq}-${c.fcut}-${c.direction > 0 ? "fwd" : "rev"}`,
          rcut: c.rcut % seq.length,
          start: c.start % seq.length,
        }))
        // deduplicate so there's only one enzyme per index
        .forEach(c => (acc[`${c.fcut}-${c.direction}`] = c));

      return acc;
    }, {});

  return Object.values(cutSites);
};

/**
 * Search through the sequence with the enzyme and return an array of cut and hang indexes.
 *
 * Exported for testing.
 */
export const findCutSites = (enzyme: Enzyme, seq: string): CutSite[] => {
  // get the recognitionSite, fcut, and rcut
  let { fcut, rcut, rseq } = enzyme;
  const cutSites: CutSite[] = [];

  // Find matches on the top/forward sequence.
  const matcher = createRegex(rseq, "dna");
  let result = matcher.exec(seq);
  while (result) {
    // add the cut site index, after correcting for actual cut site index
    const index = result.index;
    cutSites.push({
      color: enzyme.color || "",
      direction: 1,
      end: index + rseq.length,
      fcut: index + fcut,
      id: "",
      name: enzyme.name,
      rcut: index + rcut,
      start: index,
    });
    result = matcher.exec(seq);
  }

  // Now matches in the reverse complement direction.
  const rcMatcher = createRegex(reverseComplement(rseq), "dna");
  result = rcMatcher.exec(seq);
  while (result) {
    // same as above but correcting for the new reverse complement indexes
    const index = result.index;
    cutSites.push({
      color: enzyme.color || "",
      direction: -1,
      end: index + rseq.length,
      fcut: index + rseq.length - rcut,
      id: "",
      name: enzyme.name,
      rcut: index + rseq.length - fcut,
      start: index,
    });
    result = rcMatcher.exec(seq);
  }

  // reduce so there's only one enzyme per template cut index
  return cutSiteIndices.sort((a, b) => a.fcut - b.fcut);
};
