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
 * A linear sequence viewer.
 *
 * Comprised of SeqBlock(s), which are themselves comprised of:
 * 	SeqBlock:
 * 		SeqRow
 * 		IndexRow (axis)
 * 		Annotations
 *
 * the width, sequence of each seqBlock, annotations,
 * indexRow, is passed in the child component
 *
 * seq: a string of the DNA/RNA to be displayed/manipulated
 * zoom: a number (1-100) for the sizing of the sequence
 * comp: whether or not to show complement
 * compSeq: the complement sequence to the orig sequence
 * annotations: an array of annotations to show above the seq
 */
class Linear extends React.Component {
  shouldComponentUpdate = nextProps => {
    // check whether we even want to update props. Don't do anything if relevant prop
    // have not changed
    const { name, ...rest } = nextProps;
    const { name: origName, ...origRest } = this.props;
    return !isEqual(rest, origRest);
  };

  /**
   * given all the information needed to render all the seqblocks (ie, sequence, compSeq
   * list of annotations), cut up all that information into an array.
   * Each element in that array pertaining to one SeqBlock
   *
   * For example, if each seqblock has 2 bps, and the seq is "ATGCAG", this should first
   * make an array of ["AT", "GC", "AG"], and then pass "AT" to the first SeqBlock, "GC" to
   * the second seqBlock, and "AG" to the third seqBlock.
   */
  render() {
    const {
      seq,
      compSeq,
      zoom,
      showIndex,
      showComplement,
      showAnnotations,

      cutSites,
      annotations,

      lineHeight,
      elementHeight,
      bpsPerBlock,
      size,
      onUnMount,

      findState: { searchResults = [], searchIndex }
    } = this.props;

    const adjustedWidth = size.width - 28; // 28 accounts for 10px padding on linear scroller and 8px scroller gutter

    // un-official definition for being zoomed in. Being over 10 seems like a decent cut-off
    const zoomed = zoom.linear > 10;

    // the actual fragmenting of the sequence into subblocks. generates all info that will be needed
    // including sequence blocks, complement blocks, annotations, blockHeights
    const seqLength = seq.length;
    let arrSize = Math.round(Math.ceil(seqLength / bpsPerBlock));
    if (arrSize === Number.POSITIVE_INFINITY) arrSize = 1;

    const ids = new Array(arrSize); // array of SeqBlock ids
    const seqs = new Array(arrSize); // arrays for sequences...
    const compSeqs = new Array(arrSize); // complements...
    const blockHeights = new Array(arrSize); // block heights...

    const cutSiteRows = cutSites.length
      ? createSingleRows(cutSites, bpsPerBlock, arrSize)
      : new Array(arrSize).fill([]);

    const annotationRows = showAnnotations // annotations...
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

    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      const lastBase = firstBase + bpsPerBlock;
      ids[i] = shortid.generate();

      // cut the new sequence and, if also looking for complement, the complement as well
      seqs[i] = seq.substring(firstBase, lastBase);
      compSeqs[i] = compSeq.substring(firstBase, lastBase);

      const spacingHeight = 0.25 * elementHeight;
      // find the line height for the seq block based on how many rows need to be shown
      let blockHeight = lineHeight; // this is for padding between the rows
      if (zoomed) {
        blockHeight += lineHeight; // is zoomed in enough + 2px margin
        blockHeight += showComplement ? lineHeight : 0; // double for complement + 2px margin
      }
      if (showIndex) {
        blockHeight += 25; // another for index row (height is fixed right now)
      }
      if (showAnnotations && annotationRows[i].length) {
        blockHeight += annotationRows[i].length * elementHeight + spacingHeight;
      }
      if (cutSiteRows[i].length) {
        blockHeight += lineHeight + spacingHeight; // space for cutsite name
      }
      blockHeights[i] = blockHeight;
    }
    const seqBlocks = [];
    let yDiff = 0;
    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      let blockSize = { ...size };
      if (i + 1 === arrSize) {
        blockSize = {
          ...size,
          width: (seqs[i].length / bpsPerBlock) * adjustedWidth
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
          cutSiteRows={cutSiteRows[i]}
          searchRows={searchRows[i]}
          currSearchIndex={searchIndex}
          firstBase={firstBase}
          onUnmount={onUnMount}
          fullSeq={seq}
          size={blockSize}
          zoomed={zoomed}
        />
      );
      yDiff += blockHeights[i];
    }

    return (
      seqBlocks.length && (
        <InfiniteScroll
          {...this.props}
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
