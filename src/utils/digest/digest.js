import { isEqual } from "lodash";
import shortid from "shortid";

import { dnaComplement } from "../parser";
import { translateWildNucleotides } from "../sequence";
import enzymes from "./enzymes.js";

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
    _id: shortid.generate(),
    name: `${part.name}_${i}`,
    date: new Date(),
    source: [part._id]
  }));
};

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
        id: shortid.generate(),
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
 * Update the array of enzymes that contributed to start of this fragment
 * @param {Fragment} fragment see fragmentGenerator
 * @param {String[]} newEnzymes names of new new enzymes to add
 */
const addCutEnzymesStart = (fragment, newEnzymes) => {
  const newFragment = fragment;
  newFragment.cutEnzymes.start = fragment.cutEnzymes.start.concat(newEnzymes);
  return newFragment;
};

/**
 * Update the array of enzymes that contribute to end of this fragment
 * @param {Fragment} fragment see fragmentGenerator
 * @param {String[]} newEnzymes names of new new enzymes to add
 */
const addCutEnzymesEnd = (fragment, newEnzymes) => {
  const newFragment = fragment;
  newFragment.cutEnzymes.end = fragment.cutEnzymes.end.concat(newEnzymes);
  return newFragment;
};

/**
 * Creates a fragment with information relevant to digest map
 * @param {String[]} enzymesStart list of enzymes that contributed to start of fragment
 * @param {String[]} enzymesEnd list of enzymes that contributed to end of fragment
 * @param {int} fragmentStart start index of fragment
 * @param {int} fragmentEnd end index of fragment
 */
const fragmentGenerator = (
  enzymesStart,
  enzymesEnd,
  fragmentStart,
  fragmentEnd,
  meta = {}
) => {
  const fragmentLength =
    Math.max(fragmentStart, fragmentEnd) - Math.min(fragmentStart, fragmentEnd);
  return {
    cutEnzymes: { start: enzymesStart, end: enzymesEnd },
    fragmentStart: fragmentStart,
    fragmentEnd: fragmentEnd,
    fragmentLength: fragmentLength,
    meta: meta
  };
};

/**
 * Logic to add a new fragment to sequentially digested fragments list
 * Handles the effects on existing fragments with below logic
 *
 * s = start
 * start < s end + s
 * start = s start + s
 *
 * e = end
 * end = e end + e
 * end > e start + e
 *
 * e != end
 * start < e end = e
 * end > e start = e
 *
 * s != start
 * start < s end = s
 * end > s start = s
 * @param {Object(start:String[], end:String[])} cutEnzymes see addCutEnzymesStart, addCutEnzymesEnd
 * @param {int} cutSequenceStart start index on sequence strand
 * @param {int} cutSequenceEnd end index on sequence strand
 * @param {int} cutComplementStart start index on complement strand
 * @param {int} cutComplementEnd end index on complement strand
 * @param {Fragment[]} existingFragments fragments from previous digestions
 */
const addFragment = (
  cutEnzymes,
  cutSequenceStart,
  cutSequenceEnd,
  cutComplementStart,
  cutComplementEnd,
  existingFragments = []
) => {
  const newFragmentList = existingFragments;

  // current fragment's start and end adjusted for overhangs
  const fragmentStart = Math.min(cutSequenceStart, cutComplementStart);
  const fragmentEnd = Math.max(cutSequenceEnd, cutComplementEnd);

  // maps of starts and ends already in fragment list for easy comparison
  const startIdxMap = {};
  const endIdxMap = {};
  existingFragments.forEach(fragment => {
    startIdxMap[fragment.fragmentStart] = fragment.fragmentStart;
    endIdxMap[fragment.fragmentEnd] = fragment.fragmentEnd;
  });

  // get indices of all potentially affected fragments
  const fragmentBeforeStartIndex = existingFragments.findIndex(
    fragment =>
      fragment.fragmentStart < fragmentStart &&
      fragment.fragmentEnd >= fragmentStart
  );
  const fragmentSameStartIndex = existingFragments.findIndex(
    fragment => fragment.fragmentStart === fragmentStart
  );
  const fragmentSameEndIndex = existingFragments.findIndex(
    fragment => fragment.fragmentEnd === fragmentEnd
  );
  const fragmentAfterEndIndex = existingFragments.findIndex(
    fragment =>
      fragment.fragmentEnd > fragmentEnd &&
      fragment.fragmentStart <= fragmentEnd
  );
  const fragmentOverlapEndIndex = existingFragments.findIndex(
    fragment =>
      fragment.fragmentStart < fragmentEnd &&
      fragment.fragmentEnd >= fragmentEnd
  );
  const fragmentOverlapStartIndex = existingFragments.findIndex(
    fragment =>
      fragment.fragmentEnd > fragmentStart &&
      fragment.fragmentStart <= fragmentStart
  );

  // if new fragment shares start with existing fragment
  if (fragmentStart in startIdxMap) {
    // update the end enzymes of the fragment before this one
    if (fragmentBeforeStartIndex !== -1)
      addCutEnzymesEnd(
        newFragmentList[fragmentBeforeStartIndex],
        cutEnzymes.start
      );
    // update the start enzymes of the fragment that shares a start with this one
    addCutEnzymesStart(
      newFragmentList[fragmentSameStartIndex],
      cutEnzymes.start
    );
    // if new fragment shares end with existing fragment
    if (fragmentEnd in endIdxMap) {
      // update the end enzymes of the fragment that shares an end with this one
      addCutEnzymesEnd(newFragmentList[fragmentSameEndIndex], cutEnzymes.end);
      // update the start enzymes of the fragment after this one
      if (fragmentAfterEndIndex !== -1)
        addCutEnzymesStart(
          newFragmentList[fragmentAfterEndIndex],
          cutEnzymes.end
        );

      // if new fragment shares start but not end with existing fragment
    } else {
      // create a new fragment with this fragment's end
      if (fragmentOverlapEndIndex !== -1) {
        const fragmentOverlapEnd = existingFragments[fragmentOverlapEndIndex];
        newFragmentList.push(
          fragmentGenerator(
            fragmentOverlapEnd.cutEnzymes.start,
            cutEnzymes.end,
            fragmentOverlapEnd.fragmentStart,
            fragmentEnd
          )
        );
      }
      // update the start of the fragment that was after this one
      if (fragmentAfterEndIndex !== -1) {
        const fragmentAfterEnd = existingFragments[fragmentAfterEndIndex];
        newFragmentList[fragmentAfterEndIndex] = fragmentGenerator(
          cutEnzymes.end,
          fragmentAfterEnd.cutEnzymes.end,
          fragmentEnd,
          fragmentAfterEnd.fragmentEnd
        );
      }
    }

    // if new fragment shares neither start nor end with existing fragments
  } else {
    // create a new fragment with this fragment's start
    if (fragmentBeforeStartIndex !== -1) {
      const fragmentBeforeStart = existingFragments[fragmentBeforeStartIndex];
      newFragmentList.push(
        fragmentGenerator(
          fragmentBeforeStart.cutEnzymes.start,
          cutEnzymes.start,
          fragmentBeforeStart.fragmentStart,
          fragmentStart
        )
      );
    }
    // update the end of the fragment that was before this one
    if (fragmentOverlapStartIndex !== -1) {
      const fragmentOverlapStart = existingFragments[fragmentOverlapStartIndex];
      newFragmentList[fragmentOverlapStartIndex] = fragmentGenerator(
        cutEnzymes.start,
        fragmentOverlapStart.cutEnzymes.end,
        fragmentStart,
        fragmentOverlapStart.fragmentEnd
      );
    }
  }
  return newFragmentList;
};

/**
 * Add the fragments from one enzyme digest to alreadyDigested
 * @param {CutSite[]} cutSiteIndices
 * @param {boolean} circularCheck
 * @param {int} seqToCutLength
 * @param {Fragment[]} alreadyDigested see fragmentGenerator
 */
const addSingleDigestFragments = (
  cutSiteIndices,
  circularCheck,
  seqToCutLength,
  alreadyDigested
) => {
  const singleCut = cutSiteIndices.length === 1;
  let newDigestFragments = alreadyDigested;
  cutSiteIndices.forEach((cutInfo, i) => {
    const { fcut: seqCutIdx, rcut: compCutIdx, cutEnzymes } = cutInfo;
    if (seqCutIdx) {
      if (cutSiteIndices[i + 1]) {
        // not final site
        newDigestFragments = addFragment(
          cutEnzymes,
          seqCutIdx, // this site until next cut site
          cutSiteIndices[i + 1].fcut,
          compCutIdx,
          cutSiteIndices[i + 1].rcut,
          alreadyDigested
        );
      } else if (circularCheck) {
        // final cut site on plasmid
        newDigestFragments = addFragment(
          cutEnzymes,
          seqCutIdx, // this site until index of first cut site on other side of plasmid
          singleCut
            ? seqCutIdx + seqToCutLength // if it's the only one, add the full length
            : cutSiteIndices[0].fcut + seqToCutLength, // else, stop at the first one
          compCutIdx,
          singleCut
            ? compCutIdx + seqToCutLength // if it's the only one, add the full length
            : cutSiteIndices[0].rcut + seqToCutLength, // else, stop at the first one
          alreadyDigested
        );
      } else {
        // final cut site on linear piece of dna
        if (singleCut) {
          // need to push the first half as well
          newDigestFragments = addFragment(
            cutEnzymes,
            0, // this site until the end of the DNA
            seqCutIdx,
            0,
            compCutIdx,
            alreadyDigested
          );
        }
        newDigestFragments = addFragment(
          cutEnzymes,
          seqCutIdx, // this site until the end of the DNA
          seqToCutLength,
          compCutIdx,
          seqToCutLength,
          alreadyDigested
        );
      }
    }
  });
  return newDigestFragments;
};

/**
 * Digest part/fragments with one enzyme
 * @param {String} enzymeName name of enzyme used in digest
 * @param {Part} part original part
 * @param {boolean} circularCheck
 * @param {Fragment[]} alreadyDigested see fragmentGenerator
 */
const singleEnzymeDigest = (
  enzymeName,
  part,
  circularCheck,
  alreadyDigested
) => {
  // get the sequence information
  let { seq } = part;
  let seqToSearch = seq.toUpperCase();
  const seqToCutLength = seq.length;
  // if its circular, double the sequence to account for cut sites that extend over the
  // length of the whole plasmid (easier right now, change later) for issue #489
  if (circularCheck) {
    seq += seq;
    seqToSearch += seqToSearch;
  }

  // find the actual sequence cut sites
  const cutSiteIndices = findCutSites(
    enzymes[enzymeName],
    seqToSearch,
    seqToCutLength,
    enzymeName
  );

  // no cut sites were found with the given sequence
  if (cutSiteIndices.length < 1) {
    return alreadyDigested;
  }
  return addSingleDigestFragments(
    cutSiteIndices,
    circularCheck,
    seqToCutLength,
    alreadyDigested
  );
};

/**
 * Add fragments from multiple enzyme digests to fragmentList
 * @param {String[]} enzymeNames list of enzymes to use in digest
 * @param {Part} part original part
 * @param {Fragment[]} fragmentList see fragmentGenerator
 */
const addMultiDigestFragments = (enzymeNames, part, fragmentList) => {
  const { circular = true } = part;
  const filteredEnzymeNames = enzymeNames.filter(e => !!(e in enzymes));
  // if no enzymes are passed or one of the enzymes is unknown don't try to perform digests
  if (!filteredEnzymeNames.length) {
    return fragmentList;
  }
  const multiDigestFragments = filteredEnzymeNames.reduce(
    (digestFragments, enzymeName) =>
      singleEnzymeDigest(enzymeName, part, circular, digestFragments),
    fragmentList
  );

  return multiDigestFragments;
};

/**
 *
 * @param {String[]} enzymeNames list of enzymes to use in digest
 * @param {Part} part original part
 * @param {Fragment[]} startingFragmentList see fragmentGenerator
 */
const multiEnzymeDigest = (enzymeNames, part, startingFragmentList = []) => {
  const { seq, circular } = part;
  const fragmentList =
    startingFragmentList.length !== 0
      ? startingFragmentList
      : [fragmentGenerator([], [], 0, seq.length - 1)];
  const digestFragments = addMultiDigestFragments(
    enzymeNames,
    part,
    fragmentList
  ).sort((a, b) => a.fragmentStart - b.fragmentStart);

  const processedFragments = digestFragments;
  const firstFragment = digestFragments[0];
  const lastFragment = digestFragments[digestFragments.length - 1];
  if (circular) {
    processedFragments[0] = fragmentGenerator(
      lastFragment.cutEnzymes.start,
      firstFragment.cutEnzymes.end,
      lastFragment.fragmentStart,
      firstFragment.fragmentEnd
    );
    processedFragments.pop();
    if (processedFragments.length === 1) {
      processedFragments[0] = fragmentGenerator(
        processedFragments[0].cutEnzymes.start,
        [],
        0,
        seq.length,
        {
          centralIndex: processedFragments[0].fragmentStart,
          message: "Digest resulted in only one fragment"
        }
      );
    }
  } else {
    processedFragments[0] = addCutEnzymesStart(processedFragments[0], [
      "Start of sequence"
    ]);
    processedFragments[
      digestFragments.length - 1
    ] = addCutEnzymesEnd(processedFragments[digestFragments.length - 1], [
      "End of sequence"
    ]);
  }
  return processedFragments;
};

const translateToAgaroseHeight = (fragmentLength, maxLength, minLength) => {
  const maxLogHeight = Math.log(maxLength);
  const minLogHeight = Math.log(minLength);

  let fragmentLogHeight = Math.max(Math.log(fragmentLength), minLogHeight);
  if (fragmentLogHeight > maxLogHeight) fragmentLogHeight = maxLogHeight * 1.02;

  const fragmentPercentHeight =
    (fragmentLogHeight - minLogHeight) / (maxLogHeight - minLogHeight);

  const fragmentAgaroseHeight = (1 - fragmentPercentHeight) * 100;

  // scaling for top and bottom padding
  // See https://www.mathsisfun.com/temperature-conversion.html#explanation for explanation of math
  const bottomPadding = 1; // padding at bottom of gel
  const topPadding = 10; // padding at top of gel
  const conversionScale = (100 - topPadding - bottomPadding) / 100;
  // adjust by topPadding instead of bottomPadding because of our height inversion
  const paddedAgaroseHeight =
    (fragmentAgaroseHeight + topPadding) * conversionScale;

  return paddedAgaroseHeight;
};

const digestBandGenerator = (fragment, ladder) => {
  const isLadderBand = typeof fragment === "number";
  const maxBasePairs = ladder[ladder.length - 1];
  const minBasePairs = ladder[0];
  const fragmentLength = isLadderBand ? fragment : fragment.fragmentLength;
  return {
    size: `${fragmentLength}`,
    start: isLadderBand ? 0 : fragment.fragmentStart,
    end: isLadderBand ? 0 : fragment.fragmentEnd,
    top: translateToAgaroseHeight(fragmentLength, maxBasePairs, minBasePairs),
    enzymes: isLadderBand ? { start: [], end: [] } : fragment.cutEnzymes,
    meta: isLadderBand ? { message: "Ladder" } : fragment.meta
  };
};

const consolidateDigestBands = digestBands => {
  if (digestBands.length === 1) {
    return [
      {
        size: digestBands[0].size,
        start: [
          { index: digestBands[0].start, enzymes: digestBands[0].enzymes.start }
        ],
        end: [
          { index: digestBands[0].end, enzymes: digestBands[0].enzymes.end }
        ],
        top: digestBands[0].top,
        meta: digestBands[0].meta
      }
    ];
  }
  const sortedBands = digestBands.sort((a, b) => a.size - b.size);
  const uniqueBands = [];
  let i = 0;
  while (i < sortedBands.length) {
    const digestBand = sortedBands[i];
    const consolidatedBand = {
      size: digestBand.size,
      start: [{ index: digestBand.start, enzymes: digestBand.enzymes.start }],
      end: [{ index: digestBand.end, enzymes: digestBand.enzymes.end }],
      top: digestBand.top,
      meta: digestBand.meta
    };
    let n = 1;
    while (
      i + n < sortedBands.length &&
      digestBand.size === digestBands[i + n].size
    ) {
      const nextBand = digestBands[i + n];
      consolidatedBand.start.push({
        index: nextBand.start,
        enzymes: nextBand.enzymes.start
      });
      consolidatedBand.end.push({
        index: nextBand.end,
        enzymes: nextBand.enzymes.end
      });
      n += 1;
    }
    const diff = n === 0 ? 1 : n;
    uniqueBands.push(consolidatedBand);
    i += diff;
  }
  return uniqueBands;
};

export const agaroseDigest = (enzymeNames, part, ladder) => {
  const digestedFragments = multiEnzymeDigest(enzymeNames, part);
  const digestBands = digestedFragments.reduce(
    (agaroseBands, digestFragment) =>
      agaroseBands.concat([digestBandGenerator(digestFragment, ladder)]),
    []
  );
  return consolidateDigestBands(digestBands);
};

export const getAgaroseLadder = ladder =>
  ladder.reduce(
    (agaroseLadder, fragment) =>
      agaroseLadder.concat([digestBandGenerator(fragment, ladder)]),
    []
  );

/**
 * To maintain scale make sure the ladder you use for labels and
 * the ladder you use for bands have the same min and max
 */
export const DIGEST_MAP_LADDER = [
  100,
  200,
  300,
  400,
  500,
  650,
  850,
  1000,
  1500,
  2000,
  3000,
  4000,
  5000,
  6000,
  7000,
  8000,
  10000,
  15000
];

/**
 * Labels to show to show from the DIGEST_MAP_LADDER
 *
 * Not all the band sizes in the ladder will fit, so this is here
 * to subselect some of the bands to show. These have to be in the DIGEST_MAP_LADDER
 */
export const DIGEST_MAP_LABELS = [
  100,
  200,
  300,
  500,
  650,
  1000,
  1500,
  2000,
  3000,
  5000,
  7000,
  10000,
  15000
];
