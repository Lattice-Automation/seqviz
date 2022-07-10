import { dnaComplement } from "./parser";
import { calcTm, getMismatchIndices, returnRanges, reverse } from "./sequence";

/**
 * Gives primers meta information needed by sequence viewers
 
 
 
 */
export default (primers, vector) => {
  const { compSeq: vectorComp, seq: vectorSeq } = dnaComplement(vector);
  return findBindingSites(primers, vectorSeq, 1).concat(findBindingSites(primers, vectorComp, -1));
};

/**
 * Given a list of primer mismatches and the primer's annealing sequence
 * Returns the mismatch indices and the part of primer sequence that actually anneals
 
 
 
 
 */
const findMismatches = (sequence, subVector) => {
  let annealSequence = sequence;
  let mismatches = returnRanges(getMismatchIndices(sequence, subVector));

  // Logic for when to combine mismatches into an overhang tail
  // If the remaining sequence after a mismatch is more than 25% mismatch a tail is formed
  if (mismatches.length > 0) {
    let index = 0;
    while (index < mismatches.length) {
      const remainingMismatches = mismatches.slice(0, mismatches.length - index);
      if (remainingMismatches.length < 2) {
        break;
      }
      const mismatchTotalLength = remainingMismatches.reduce(
        (acc, mismatch) => acc + (mismatch[1] + 1 - mismatch[0]),
        0
      );
      const mismatchAreaLength = sequence.slice(0, remainingMismatches[remainingMismatches.length - 1][1] + 1).length;

      if (mismatchTotalLength / mismatchAreaLength > 0.25) {
        mismatches = mismatches
          .slice(mismatches.length - index, mismatches.length)
          .concat([[0, mismatches[mismatches.length - 1 - index][1]]]);

        annealSequence = sequence.slice(mismatches[mismatches.length - 1][1] + 1);
        break;
      }
      index += 1;
    }
    annealSequence = sequence.slice(mismatches[mismatches.length - 1][1] + 1);
  }
  // @ts-expect-error ts-migrate(2322) FIXME: Type '{ start: number; end: number; }[]' is not as... Remove this comment to see the full error message
  mismatches = mismatches.map(mismatch => ({
    end: mismatch[1] + 1,
    start: mismatch[0], // because mismatches return indices of mismatch and we want to bound to end after the last index
  }));

  return { annealSequence, mismatches };
};

/**
 * Find binding sites on one strand of DNA
 
 
 
 
 */
const findBindingSites = (primers = [], vectorSeq, direction) => {
  const matchLength = 10;
  const minTm = 40;

  const primerBindingSites = [];
  const forward = direction === 1;

  primers.forEach(primer => {
    const { overhang = "" } = primer;
    let { seq, strict } = primer;
    strict = strict || false;
    if (seq === "") {
      return;
    }
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
    seq = seq.toLowerCase();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'never'.
    const sequenceLength = seq.length;

    const vectorSequence = vectorSeq.toLowerCase();
    const vectorLength = vectorSequence.length;

    const expandedVectorSequence = vectorSequence + vectorSequence.substring(0, sequenceLength); // Used for looking for binding sites that cross 0 index

    let annealSequence = seq;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mismatches' does not exist on type 'neve... Remove this comment to see the full error message
    let { matchSeq, mismatches } = [];

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'substring' does not exist on type 'never... Remove this comment to see the full error message
    matchSeq = sequenceLength < matchLength ? seq : seq.substring(sequenceLength - matchLength, sequenceLength);

    matchSeq = forward ? matchSeq : reverse(matchSeq);

    const regex = new RegExp(matchSeq, "gi");
    let result = regex.exec(expandedVectorSequence);
    const combinedSequence = (overhang || "").concat(seq);
    while (result) {
      if (result.index < vectorLength) {
        const tailCrossZero = forward
          ? result.index + matchSeq.length - sequenceLength < 0
          : result.index + sequenceLength > vectorLength;
        const headCrossZero = forward
          ? vectorLength - (result.index + matchSeq.length) < 0
          : result.index + matchSeq.length > vectorLength;
        const crossZero = tailCrossZero || headCrossZero;

        let startIndex = forward ? result.index - sequenceLength + matchSeq.length : result.index;
        let endIndex = startIndex + sequenceLength;
        let subVector = vectorSequence.substring(startIndex, endIndex);

        if (crossZero) {
          if (forward) {
            startIndex = tailCrossZero
              ? vectorLength - (sequenceLength - result.index - matchSeq.length)
              : result.index - sequenceLength + matchSeq.length;
          }
          endIndex = sequenceLength - (vectorLength - startIndex);
          subVector = vectorSequence.substring(startIndex, vectorLength) + vectorSequence.substring(0, endIndex);
        }

        subVector = forward ? subVector : reverse(subVector);

        const matchTm = calcTm(seq, subVector);

        if (
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'tm' does not exist on type 'never'.
          (matchTm >= primer.tm || matchTm > minTm) &&
          ((forward && endIndex < vectorLength) || startIndex < vectorLength) &&
          result.index < vectorLength
        ) {
          if (overhang) {
            if (forward) {
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'never'.
              startIndex -= overhang.length;
              if (startIndex < 0) startIndex = vectorLength + startIndex;
            }
            if (!forward) {
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'never'.
              endIndex += overhang.length;
              if (endIndex > vectorLength) endIndex -= vectorLength;
            }
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
            ({ mismatches = [], annealSequence = "" } = findMismatches(
              combinedSequence,
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'never'.
              "X".repeat(overhang.length).concat(subVector)
            ));
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'never'.
            if (mismatches[0] && mismatches[0].start - overhang.length === 0) {
              mismatches[0].start = 0;
            } else {
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'never'.
              mismatches.push({ end: overhang.length, start: 0 });
            }
          } else {
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
            ({ mismatches = [], annealSequence = "" } = findMismatches(seq, subVector));
          }

          const uniqMismatch = {};
          mismatches = mismatches
            .sort((a, b) => a.start < b.start)
            .map(m => ({
              end: m.end,
              id: `${m.start}-${m.end}`,
              start: m.start,
            }))
            .filter(m => {
              if (uniqMismatch[m.id]) {
                return false;
              }
              uniqMismatch[m.id] = true;
              return true;
            })
            .map(m => ({ end: m.end, start: m.start }));

          if ((strict && mismatches.length < 1) || !strict) {
            primerBindingSites.push({
              // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
              ...primer,

              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              annealSequence: annealSequence,

              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              direction: direction,

              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              end: endIndex,

              // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
              id: `${primer.id}-${startIndex}`,

              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              mismatches: mismatches,

              // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
              seq: combinedSequence,

              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              start: startIndex,
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              strict: strict,
            });
          }
        }
      }
      result = regex.exec(expandedVectorSequence);
    }
  });
  return primerBindingSites;
};
