import { CutSite, Enzyme } from "../elements";
import enzymes from "./enzymes";
import { reverseComplement } from "./parser";
import { createRegex } from "./search";

/**
 * Digest a sequence with the enzymes and return an array of cut-site.
 *
 * This is slow enough to impact rendering so shouldn't be ran on each prop change.
 */
export default (seq: string, enzymeList: string[] = [], enzymesCustom: { [key: string]: Enzyme } = {}): CutSite[] => {
  const seqToCut = seq + seq;

  let enzymeNames: string[] = enzymeList.filter(e => !!enzymes[e]).concat(Object.keys(enzymesCustom));
  enzymeNames = Array.from(new Set(enzymeNames));

  // find all the cut sites for the given row
  const cutSites = enzymeNames.reduce((acc: { [key: string]: CutSite }, enzymeName: string) => {
    // TODO: if name were on the enzyme this wouldn't be necessary
    const currEnzyme: Enzyme = enzymesCustom[enzymeName] || enzymes[enzymeName];

    // search for cut sites for this enzyme
    findCutSites(currEnzyme, seqToCut, enzymeName)
      // filter out cut sites that that only start/end at 0-index. I no longer remember what this was for.
      .filter(c => !(c.fcut === 0 && c.rcut === 0))
      // modulo the start/end and add an id to each cut-site
      .map(c => ({
        ...c,
        id: `${enzymeName}-${currEnzyme.rseq}-${c.fcut}-${c.direction > 0 ? "fwd" : "rev"}`,
        end: c.end % seq.length,
        fcut: c.fcut < seq.length ? c.fcut : c.fcut - seq.length,
        rcut: c.rcut < seq.length ? c.rcut : c.rcut - seq.length,
        recogEnd: c.recogEnd % seq.length,
        start: c.start % seq.length,
      }))
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
export const findCutSites = (enzyme: Enzyme, seq: string, enzymeName: string): CutSite[] => {
  // get the recognitionSite, fcut, and rcut
  let { fcut, rcut, rseq } = enzyme;
  if (!rseq) {
    ({ fcut, rcut, rseq } = enzymes[enzymeName]);
  }

  let recogSeq = rseq.toLowerCase();
  let shiftRecogStart = 0;
  let shiftRecogEnd = 0;
  let recogStart = 0;
  let recogEnd = recogSeq.length;
  while (recogSeq[recogStart] === "n") {
    shiftRecogStart += 1;
    recogStart += 1;
  }
  while (recogSeq[recogEnd - 1] === "n") {
    shiftRecogEnd += 1;
    recogEnd -= 1;
  }

  const rlen = recogSeq.length;
  const cutSiteIndices: CutSite[] = [];

  // Find matches on the top/forward sequence.
  const matcher = createRegex(rseq, "dna");
  let result = matcher.exec(seq);
  while (result) {
    // add the cut site index, after correcting for actual cut site index
    const index = result.index;
    cutSiteIndices.push({
      color: enzyme.color || "",
      direction: 1,
      end: index + rlen,
      fcut: index + fcut,
      id: "",
      name: enzymeName,
      rcut: index + rcut,
      recogEnd: index + recogEnd + shiftRecogEnd,
      recogStart: index + recogStart - shiftRecogStart,
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
    cutSiteIndices.push({
      color: enzyme.color || "",
      direction: -1,
      end: index + rlen,
      fcut: index + rlen - rcut,
      id: "",
      name: enzymeName,
      rcut: index + rlen - fcut,
      recogEnd: index + recogEnd + shiftRecogEnd,
      recogStart: index + recogStart - shiftRecogStart,
      start: index,
    });
    result = rcMatcher.exec(seq);
  }

  // reduce so there's only one enzyme per template cut index
  return cutSiteIndices.sort((a, b) => a.fcut - b.fcut);
};
