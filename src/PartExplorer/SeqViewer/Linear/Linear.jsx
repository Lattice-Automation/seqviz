import { isEqual } from "lodash";
import * as React from "react";
import shortid from "shortid";
import withViewerHOCs from "../handlers";
import {
  createMultiRows,
  createSingleRows,
  stackElements
} from "../partElementsToRows";
import InfiniteScroll from "./InfiniteScroll/InfiniteScroll";
import "./Linear.scss";
import SeqBlock from "./SeqBlock/SeqBlock";

/**
 * Linear
 *
 * A linear sequence viewer. Meant to be reused in any location where
 * a sequence is viewed. May include parts, oligos, primers (oligos),
 * etc. Might need to be extendable to include annotations (tags tied
 * to particular sequences), coding regions, and RNA in addition to DNA.
 *
 *
 * Comprised of SeqBlock(s), which are themselves comprised of:
 * 	SeqBlock:
 * 		SeqRow
 * 		IndexRow (axis)
 * 		CutSites (enzyme recognition sites)
 * 		Annotations
 * 		ORFrames (open reading frames)
 *
 * the width, sequence of each seqBlock, annotations,
 * indexRow, is passed in the child component
 *
 * seq: a string of the DNA/RNA to be displayed/manipulated
 * seqChange: a function for changing the DNA/RNA. run in parent
 * Zoom: a number (1-100) for the sizing of the sequence
 * comp: whether or not to show complement
 * compSeq: the complement sequence to the orig sequence
 * annotations: an array of annotations to show above the seq
 *
 * TODO: add back shouldComponentUpdate
 *
 */
class Linear extends React.Component {
  shouldComponentUpdate = nextProps => {
    // check whether we even want to update props. Don't do anything if relevant prop
    // have not changed

    const { name, date, ...rest } = nextProps;
    const { name: origName, date: origDate, ...origRest } = this.props;

    return !isEqual(rest, origRest);
  };

  /**
   * given all the information needed to render all the seqblocks (ie, sequence, compSeq
   * list of annotations, enzymes, etc), cut up all that information into an array.
   * Each element in that array pertaining to one SeqBlock
   *
   * For example, if each seqblock has 2 bps, and the seq is "ATGCAG", this should first
   * make an array of ["AT", "GC", "AG"], and then pass "AT" to the first SeqBlock, "GC" to
   * the second seqBlock, and "AG" to the third seqBlock. While it would be simple to pass
   * bounds to each seqBlock, and have them substring the whole part's sequence, this array
   * slicing is needed for the more complex ranged elements like open reading frames. It
   * would be massively polynomial to have every seqBlock search through the array of ORFs
   * to find those that are relevant to it.
   */
  render() {
    const {
      seq,
      compSeq,
      Zoom,
      Axis,
      Annotations,
      annotations,
      lineHeight,
      elementHeight,
      bpsPerBlock,
      size,
      onUnMount,
      findSelection: { searchResults = [], searchIndex },
      showSearch,
      seqSelection,
      circularCentralIndex,
      linearCentralIndex,
      setPartState
    } = this.props;

    const partState = {
      showSearch,
      seqSelection,
      circularCentralIndex,
      linearCentralIndex,
      setPartState
    };

    // un-official definition for being Zoomed in. Being over 10 seems like a decent cut-off
    const Zoomed = Zoom > 10;

    // the actual fragmenting of the sequence into subblocks. generates all info that will be needed
    // including sequence blocks, complement blocks, annotations, blockHeights, yDifferentials,
    const seqLength = seq.length;
    let arrSize = Math.round(Math.ceil(seqLength / bpsPerBlock));
    if (arrSize === Number.POSITIVE_INFINITY) arrSize = 1;

    const ids = new Array(arrSize); // array of SeqBlock ids
    const seqs = new Array(arrSize); // arrays for sequences...
    const compSeqs = new Array(arrSize); // complements...
    const blockHeights = new Array(arrSize); // block heights...
    const yDiffs = new Array(arrSize); // y differentials...

    const annotationRows = Annotations // annotations...
      ? createMultiRows(
          stackElements(annotations, seq.length),
          bpsPerBlock,
          arrSize
        )
      : new Array(arrSize).fill([]);

    const searchRows =
      searchResults && searchResults.length
        ? createSingleRows(searchResults, bpsPerBlock, arrSize)
        : new Array(arrSize).fill([]);

    let yDiffCumm = 0; // cummulative y differential tracker
    for (let i = 0; i < arrSize; i += 1) {
      // TODO: cut down on multiplication operations here
      const firstBase = i * bpsPerBlock;
      const lastBase = firstBase + bpsPerBlock;
      ids[i] = shortid.generate();

      // cut the new sequence and, if also looking for complement, the complement as well
      seqs[i] = seq.substring(firstBase, lastBase);
      compSeqs[i] = compSeq.substring(firstBase, lastBase);

      const spacingHeight = 0.25 * elementHeight;
      // find the line height for the seq block based on how many rows need to be shown
      let blockHeight = lineHeight; // this is for padding between the rows
      if (Zoomed) {
        blockHeight += lineHeight; // is Zoomed in enough + 2px margin
        blockHeight += lineHeight; // double for complement + 2px margin
      }
      if (Axis) {
        blockHeight += 25; // another for index row (height is fixed right now)
      }
      if (Annotations && annotationRows[i].length) {
        blockHeight += annotationRows[i].length * elementHeight + spacingHeight;
      }
      blockHeights[i] = blockHeight;

      // update the yDifferentialMap for the current block
      yDiffs[i] = yDiffCumm;
      yDiffCumm += blockHeight;
    }
    const seqBlocks = [];
    let yDiff = 0;
    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      let blockSize = { ...size };
      if (i + 1 === arrSize) {
        blockSize = {
          ...size,
          width: (seqs[i].length / bpsPerBlock) * size.width
        };
      }
      seqBlocks.push(
        <SeqBlock
          {...this.props}
          key={`${ids[i]}_block`}
          id={ids[i]}
          y={yDiff}
          seq={seqs[i]}
          compSeq={compSeqs[i]}
          blockHeight={blockHeights[i]}
          annotationRows={annotationRows[i]}
          searchRows={searchRows[i]}
          currSearchIndex={searchIndex}
          firstBase={firstBase}
          onUnmount={onUnMount}
          fullSeq={seq}
          size={blockSize}
          zoomed={Zoomed}
          {...partState}
        />
      );

      yDiff += blockHeights[i];
    }

    return (
      seqBlocks.length && (
        <InfiniteScroll
          seqBlocks={seqBlocks}
          blockHeights={blockHeights}
          totalHeight={blockHeights.reduce((acc, h) => acc + h, 0)}
          size={size}
          bpsPerBlock={bpsPerBlock}
        />
      )
    );
  }
}

export default withViewerHOCs(Linear);
