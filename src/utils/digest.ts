import { CutSite, Enzyme } from "../elements";
import enzymes from "./enzymes";
import { reverseComplement } from "./parser";
import { createRegex } from "./search";

/**
 * Digest a sequence with the given enzymes and return an array of cut sites along the sequence.
 *
 * This slows rendering quite a bit, so the results are memoized.
 */
export const cutSitesInRows = (
  seq: string,
  enzymeList: string[] = [],
  enzymesCustom: { [key: string]: Enzyme } = {}
): CutSite[] => {
  const seqToCut = (seq + seq).toUpperCase();

  const enzymeNames: string[] = enzymeList.filter(e => !!enzymes[e]).concat(Object.keys(enzymesCustom));
  const filteredEnzymes = Array.from(new Set(enzymeNames));

  // find all the cut sites for the given row
  const cutSites: CutSite[] = [];
  filteredEnzymes.forEach((enzymeName: string) => {
    const currEnzyme: Enzyme = enzymesCustom[enzymeName] || enzymes[enzymeName];
    const sites = findCutSites(currEnzyme, seqToCut, enzymeName);
    const filteredSites = sites.filter(c => !(c.fcut === 0 && c.rcut === 0));
    filteredSites.forEach(c =>
      cutSites.push({
        direction: c.direction,
        end: c.end % seq.length,
        fcut: c.fcut < seq.length ? c.fcut : c.fcut - seq.length,
        highlightColor: c.highlightColor,
        id: `${enzymeName}-${c.direction}-${c.start}`,
        name: enzymeName,
        rcut: c.rcut < seq.length ? c.rcut : c.rcut - seq.length,
        recogEnd: c.recogEnd % seq.length,
        recogStart: c.recogStart,
        start: c.start % seq.length,
      })
    );
  });
  return Object.values(cutSites.reduce((acc, c) => ({ [c.fcut]: c, ...acc }), {}));
};

/**
 * Search through the sequence with the given enzyme and return an array of cut
 * and hang indexes for splitting up the sequence with the passed enzymes
 */
const findCutSites = (enzyme: Enzyme, seqToSearch: string, enzymeName: string): CutSite[] => {
  // get the recognitionSite, fcut, and rcut
  let { fcut, rcut, rseq } = enzyme;
  if (!rseq) {
    ({ fcut, rcut, rseq } = enzymes[enzymeName]);
  }

  let recogSeq = rseq.toUpperCase();
  let shiftRecogStart = 0;
  let shiftRecogEnd = 0;
  let recogStart = 0;
  let recogEnd = recogSeq.length;
  while (recogSeq[recogStart] === "N") {
    shiftRecogStart += 1;
    recogStart += 1;
  }
  while (recogSeq[recogEnd - 1] === "N") {
    shiftRecogEnd += 1;
    recogEnd -= 1;
  }

  const recogLength = recogSeq.length;
  const nucAmbig = new RegExp(/[^ATGC]/, "gi");
  if (nucAmbig.test(rseq)) recogSeq = recogSeq.toUpperCase();
  const regTest = new RegExp(recogSeq, "gi");

  // this is in the forward direction, ie, when not checking the complement possibility
  // start search for cut sites
  const cutSiteIndices: any[] = [];
  let result = regTest.exec(seqToSearch); // returns null if nothing found
  // while another match is found and we haven't exceeded input sequence length
  while (result) {
    // add the cut site index, after correcting for actual cut site index
    const index = result.index;
    cutSiteIndices.push({
      cutEnzymes: enzymeName ? { end: [enzymeName], start: [enzymeName] } : null,
      end: index + recogLength,
      // enzymes that contributed to this cut site
      fcut: index + fcut,
      highlightColor: enzyme.highlightColor,
      rcut: index + rcut,
      recogEnd: index + recogEnd + shiftRecogEnd,
      recogStart: index + recogStart - shiftRecogStart,
      recogStrand: 1,
      start: index,
    });
    result = regTest.exec(seqToSearch);
  }

  let inverComp = reverseComplement(rseq);
  if (new RegExp(/[^ATGC]/, "gi").test(inverComp.toUpperCase())) {
    inverComp = createRegex(inverComp, "dna").toUpperCase();
  }
  const reqTestRC = new RegExp(inverComp, "gi");
  result = reqTestRC.exec(seqToSearch); // returns null if nothing found
  while (result) {
    // same above, except correcting for the new reverse complement indexes
    const index = result.index;
    cutSiteIndices.push({
      cutEnzymes: enzymeName ? { end: [enzymeName], start: [enzymeName] } : null,
      end: index + recogLength,
      // enzymes that contributed to this cut site
      fcut: index + recogLength - rcut,
      highlightColor: enzyme.highlightColor,
      rcut: index + recogLength - fcut,
      recogEnd: index + recogEnd + shiftRecogEnd,
      recogStart: index + recogStart - shiftRecogStart,
      recogStrand: -1,
      start: index,
    });
    result = reqTestRC.exec(seqToSearch);
  }

  // reduce so there's only one enzyme per template cut index
  const uniqueCuts: CutSite[] = Object.values(cutSiteIndices.reduce((acc, c) => ({ [c.fcut]: c, ...acc }), {}));

  // sort with increasing sequence cut index

  uniqueCuts.sort((a, b) => a.fcut - b.fcut);
  return uniqueCuts;
};
