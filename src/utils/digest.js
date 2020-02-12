import enzymes from "./enzymes";
import isEqual from "./isEqual";
import { dnaComplement } from "./parser";
import randomid from "./randomid";
import { translateWildNucleotides } from "./sequence";

/**
 * cutSitesInRows
 *
 * for the list of the enzymes, find their cut sites and split them into rows compatible
 * with the sequence viewer
 *
 * @param  {String} seq            [the input seq to be cut]
 * @param  {[String]} enzymeList   [the list of enzymes to find indexes for]
 * @param  {Number} bpsPerRow      [the length of each row]
 * @return {[{
 *         {String}  name          [the name of the enzyme at this site]
 *         {Number}  index         [index of the enzyme cutsite]
 * }]}  [the cutSites in a format compatible with the SeqBlocks/CutSites]
 */
export const cutSitesInRows = (seq, enzymeList) => {
  const seqToCut = (seq + seq).toUpperCase();
  const filteredEnzymes = enzymeList.filter(e => !!enzymes[e]);

  // find all the cut sites for the given row
  const cutSites = filteredEnzymes.reduce((acc, e) => {
    const cuts = findCutSites(enzymes[e], seqToCut, seq.length)
      .filter(c => !(c.fcut === 0 && c.rcut === 0))
      .map(c => ({
        id: randomid(),
        name: e,
        start: c.start,
        end: c.end % seq.length,
        fcut: c.fcut < seq.length ? c.fcut : c.fcut - seq.length,
        rcut: c.rcut < seq.length ? c.rcut : c.rcut - seq.length,
        recogStrand: c.recogStrand,
        recogStart: c.recogStart,
        recogEnd: c.recogEnd % seq.length
      }));
    return acc.concat(cuts);
  }, []);

  return cutSites;
};

/**
 * findCutSites
 *
 * Search through the sequence with the given enzyme and return an array of cut
 * and hang indexes for splitting up the sequence with the passed enzymes
 *
 * @param  {String}  enzyme         [enzyme object, from enzymes.js]
 * @param  {String}  seqToSearch    [string of the sequence to be searched]
 * @param  {Number}  seqToCutLength [length of the sequence to be cut]
 * @return {[CutSite]} [the list of resulting cut and hang indexes]
 */
const findCutSites = (
  enzyme,
  seqToSearch,
  seqToCutLength,
  enzymeName = null
) => {
  // get the recognitionSite, fcut, and rcut
  let { fcut, rcut, rseq } = enzyme;
  if (!rseq) {
    ({ fcut, rcut, rseq } = enzymes[enzyme]);
  }

  const recogSeq = rseq.toUpperCase();
  let recogStart = 0;
  let recogEnd = recogSeq.length;
  while (recogSeq[recogStart] === "N") {
    recogStart += 1;
  }
  while (recogSeq[recogEnd - 1] === "N") {
    recogEnd -= 1;
  }

  const recogLength = rseq.length;
  const nucAmbig = new RegExp(/[^ATGC]/, "gi");
  if (nucAmbig.test(rseq)) rseq = translateWildNucleotides(rseq);
  const regTest = new RegExp(rseq, "gi");

  // this is in the forward direction, ie, when not checking the complement possibility
  // start search for cut sites
  const cutSiteIndices = [];
  let startIndex = 0;
  let result = regTest.exec(seqToSearch); // returns null if nothing found
  let index = result ? result.index : -1;

  // while another match is found and we haven't exceeded input sequence length
  while (index > -1 && index < seqToCutLength) {
    // add the cut site index, after correcting for actual cut site index
    cutSiteIndices.push({
      cutEnzymes: enzymeName
        ? { start: [enzymeName], end: [enzymeName] }
        : null, // enzymes that contributed to this cut site
      fcut: index + fcut,
      rcut: index + rcut,
      start: index,
      end: index + recogLength,
      recogStrand: 1,
      recogStart: index + recogStart,
      recogEnd: index + recogEnd
    });
    startIndex = index + 1;
    index = seqToSearch.indexOf(rseq, startIndex);
  }

  // this is in the reverse direction, ie, when checking the complement
  const recogComp = rseq
    .split("")
    .reverse()
    .join("");

  let { compSeq: inverComp } = dnaComplement(recogComp);
  if (nucAmbig.test(inverComp)) inverComp = translateWildNucleotides(inverComp);

  const fcutComp = recogLength - fcut; // flip the cut and hang indices
  const rcutComp = recogLength - rcut;

  startIndex = 0; // restart the search, again over the template sequence
  result = regTest.exec(seqToSearch); // returns null if nothing found
  index = result ? result.index : -1;

  while (index > -1 && index < seqToCutLength) {
    // same above, except correcting for the new reverse complement indexes
    cutSiteIndices.push({
      cutEnzymes: enzymeName
        ? { start: [enzymeName], end: [enzymeName] }
        : null, // enzymes that contributed to this cut site
      fcut: index + recogLength - fcutComp,
      rcut: index + recogLength - rcutComp,
      start: index,
      end: index + recogLength,
      recogStrand: -1,
      recogStart: index + recogStart,
      recogEnd: index + recogEnd
    });
    startIndex = index + 1;
    index = seqToSearch.indexOf(inverComp, startIndex);
  }

  // reduce so there's only one enzyme per template cut index
  const uniqueCuts = Object.values(
    cutSiteIndices.reduce((acc, c) => ({ [c.fcut]: c, ...acc }), {})
  );

  // sort with increasing sequence cut index
  uniqueCuts.sort((a, b) => a.fcut - b.fcut);

  return uniqueCuts;
};

/**
 * digestPart
 *
 * if the seqToCut or the compSeqToCut are padded with stars, ie they have overhangs, shorten the
 * searchable index range, since those parts of the sequence should not be searchable and re-cut
 *
 * @param  {String} enzymeName [name of the enzyme to cut the sequence]
 * @param  {Part} part [the part to be cut]
 * @param  {Boolean} circularCheck [whether it's a plasmid]
 * @return {[Part]}  [the list of cut parts]
 */
const digestPart = (enzymeName, part, circularCheck) => {
  // get the sequence information
  let { seq, compSeq, annotations } = part;

  let seqToSearch = seq.toUpperCase();
  const seqToCutLength = seq.length;

  // if its circular, double the sequence to account for cut sites that extend over the
  // length of the whole plasmid (easier right now, change later) for issue #489
  if (circularCheck) {
    seq += seq;
    compSeq += compSeq;
    seqToSearch += seqToSearch;
    // ugly but needed defensive programming to make sure all annotations that
    // wrap around the 0 index are accounted for
    annotations = annotations
      .map(a => ({
        ...a,
        end: a.end < a.start ? a.end + seqToCutLength : a.end
      }))
      .reduce(
        (acc, a) =>
          acc.concat(a, {
            ...a,
            start: a.start + seqToCutLength,
            end: a.end + seqToCutLength
          }),
        []
      );
  }

  // find the actual sequence cut sites
  const cutSiteIndices = findCutSites(
    enzymes[enzymeName],
    seqToSearch,
    seqToCutLength
  );

  // no cut sites were found with the given sequence
  if (cutSiteIndices.length < 1) {
    return part;
  }

  // small utility function that 1) cuts up seqToCut and compSeqToCut
  // 2) pads the overhang site with stars and 3) adds them to the
  // list of cuts pieces of dna
  const fragmentedSequences = [];
  const cutSeqsGenerator = (
    cutSequenceStart,
    cutSequenceEnd,
    cutComplementStart,
    cutComplementEnd
  ) => {
    // cut the dna
    let cutSeq = seq.substring(cutSequenceStart, cutSequenceEnd);
    let cutCompSeq = compSeq.substring(cutComplementStart, cutComplementEnd);

    // generate an overhang by checking for differences in the start index of the template strand
    // versus the start index of the complement strand
    const startDiff = Math.abs(cutSequenceStart - cutComplementStart);
    if (cutSequenceStart < cutComplementStart) {
      cutCompSeq = cutCompSeq.padStart(cutCompSeq.length + startDiff, "*");
    } else if (cutSequenceStart > cutComplementStart) {
      cutSeq = cutSeq.padStart(cutSeq.length + startDiff, "*");
    }

    // and now for differences in last indices at the end of the sequences
    const endDiff = Math.abs(cutSequenceEnd - cutComplementEnd);
    if (cutSequenceEnd > cutComplementEnd) {
      cutCompSeq = cutCompSeq.padEnd(cutCompSeq.length + endDiff, "*");
    } else if (cutSequenceEnd < cutComplementEnd) {
      cutSeq = cutSeq.padEnd(cutSeq.length + endDiff, "*");
    }

    // adjust the locations of all annotations to match their new locations
    const newSeqLength = cutSequenceEnd - cutSequenceStart;
    const adjustedAnnotations = annotations
      .map(a => ({
        ...a,
        start: a.start - cutSequenceStart,
        end: a.end - cutSequenceStart
      }))
      .filter(
        a =>
          (a.start >= 0 && a.start < newSeqLength) ||
          (a.end > 0 && a.end <= newSeqLength) ||
          (a.start < 0 && a.end > newSeqLength)
      )
      .map(a => ({
        ...a,
        start: Math.max(a.start, 0),
        end: Math.min(a.end, newSeqLength + endDiff)
      }));

    // push the newly fragmented sequences to the list
    if (!(cutSeq.startsWith("*") && cutCompSeq.startsWith("*"))) {
      fragmentedSequences.push({
        seq: cutSeq,
        compSeq: cutCompSeq,
        annotations: adjustedAnnotations
      });
    }
  };

  const singleCut = cutSiteIndices.length === 1;
  cutSiteIndices.forEach((cutInfo, i) => {
    const { fcut: seqCutIdx, rcut: compCutIdx } = cutInfo;
    if (cutSiteIndices[i + 1]) {
      // not final site
      cutSeqsGenerator(
        seqCutIdx, // this site until next cut site
        cutSiteIndices[i + 1].fcut,
        compCutIdx,
        cutSiteIndices[i + 1].rcut
      );
    } else if (circularCheck) {
      // final cut site on plasmid
      cutSeqsGenerator(
        seqCutIdx, // this site until index of first cut site on other side of plasmid
        singleCut
          ? seqCutIdx + seqToCutLength // if it's the only one, add the full length
          : cutSiteIndices[0].fcut + seqToCutLength, // else, stop at the first one
        compCutIdx,
        singleCut
          ? compCutIdx + seqToCutLength // if it's the only one, add the full length
          : cutSiteIndices[0].rcut + seqToCutLength // else, stop at the first one
      );
    } else {
      // final cut site on linear piece of dna
      if (singleCut) {
        // need to push the first half as well
        cutSeqsGenerator(
          0, // this site until the end of the DNA
          seqCutIdx,
          0,
          compCutIdx
        );
      }

      cutSeqsGenerator(
        seqCutIdx, // this site until the end of the DNA
        seqToCutLength,
        compCutIdx,
        seqToCutLength
      );
    }
  });

  return fragmentedSequences;
};

/**
 * needed because Mongo is storing annotation positions as strings,
 * and I need them as ints. This hack could be avoided if everything
 * involving data manipulation is kept client side
 * @param {[Annotation]} anns   the annotations to be casted
 */
const annPosToInts = anns =>
  anns.map(a => ({
    ...a,
    start: +a.start,
    end: +a.end
  }));

/**
 * digest
 *
 * Cuts a part with the list of enzymes, and returns a new list of
 * parts after digestion
 *
 * @param  {[String]} enzymeNames [the name of the enzymes to cut with]
 * @param  {Part} part [the part to cut]
 * @return {[Part]}             [the resulting cut parts]
 */
export const digest = (enzymeNames, part) => {
  const { circular = true } = part;
  // if no enzymes are passed or one of the enzymes is unknown
  const filteredEnzymes = enzymeNames.filter(e => !!enzymes[e]);
  if (!filteredEnzymes.length) {
    return [part];
  }

  // cleaning part (mongo int cast problem)
  const inputPart = {
    ...part,
    annotations: annPosToInts(part.annotations || [])
  };

  // loop through every enzyme and recut the sequence with that enzyme
  const newParts = filteredEnzymes.reduce(
    (accParts, enzyme) => {
      // expensive, but checks whether part has been cut (TODO optimize w/ return)
      const circularCheck = circular && isEqual(accParts[0], inputPart);
      return accParts.reduce(
        (acc, p) =>
          // cut the sequence with the current enzyme into new sequences
          acc.concat(digestPart(enzyme, p, circularCheck)),
        []
      );
    },
    [inputPart]
  );

  // add the rest of their fields
  return newParts.map((p, i) => ({
    ...p,
    _id: randomid(),
    name: `${part.name}_${i}`,
    date: new Date(),
    source: [part._id]
  }));
};
