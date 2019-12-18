import * as React from "react";
import { isEqual } from "lodash";

import { createLinearTranslations } from "../../utils/sequence";
import {
  createMultiRows,
  createSingleRows,
  stackElements
} from "../elementsToRows";
import withViewerHOCs from "../handlers";
import bindingSites from "../../utils/bindingSites";
import InfiniteScroll from "./InfiniteScroll/InfiniteScroll.jsx";
import SeqBlock from "./SeqBlock/SeqBlock.jsx";

import "./Linear.scss";

/**
 * A linear sequence viewer.
 *
 * Comprised of SeqBlock(s), which are themselves comprised of:
 * 	SeqBlock:
 * 		SeqRow
 * 		IndexRow (axis)
 * 		Annotations
 *      Primers
 *
 * the width, sequence of each seqBlock, annotations,
 * indexRow, is passed in the child component
 *
 * seq: a string of the DNA/RNA to be displayed/manipulated
 * zoom: a number (1-100) for the sizing of the sequence
 * comp: whether or not to show complement
 * compSeq: the complement sequence to the orig sequence
 * annotations: an array of annotations to show above the seq
 * primers: an array of primers to show above and below the seq
 */
class Linear extends React.Component {
  /**
   * Deep equality comparison
   */
  shouldComponentUpdate = nextProps => !isEqual(nextProps, this.props);

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
      showPrimers,

      cutSites,
      annotations,
      translations,

      lineHeight,
      elementHeight,
      bpsPerBlock,
      size,
      onUnmount,

      search
    } = this.props;

    let { primers } = this.props;

    primers = bindingSites(primers, seq);

    const forwardPrimers = primers.filter(primer => primer.direction === 1);
    const reversePrimers = primers.filter(primer => primer.direction === -1);

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

    /**
     * Vet the annotations for starts and ends at zero index
     * @param {*} annotations
     * @return annotations
     */
    const vetAnnotations = annotations => {
      annotations.forEach(ann => {
        if (ann.end === 0 && ann.start > ann.end) ann.end = seqLength;
        if (ann.start === seqLength && ann.end < ann.start) ann.start = 0;
      });
      return annotations;
    };

    const annotationRows = createMultiRows(
      stackElements(vetAnnotations(annotations), seq.length),
      bpsPerBlock,
      arrSize
    );

    const forwardPrimerRows = showPrimers // primers...
      ? createMultiRows(
          stackElements(forwardPrimers, seq.length),
          bpsPerBlock,
          arrSize
        )
      : new Array(arrSize).fill([]);

    const reversePrimerRows = showPrimers // primers...
      ? createMultiRows(
          stackElements(reversePrimers, seq.length),
          bpsPerBlock,
          arrSize
        )
      : new Array(arrSize).fill([]);

    const searchRows =
      search && search.length
        ? createSingleRows(search, bpsPerBlock, arrSize)
        : new Array(arrSize).fill([]);

    const translationRows = translations.length
      ? createSingleRows(
          createLinearTranslations(translations, seq),
          bpsPerBlock,
          arrSize
        )
      : new Array(arrSize).fill([]);

    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      const lastBase = firstBase + bpsPerBlock;

      // cut the new sequence and, if also looking for complement, the complement as well
      seqs[i] = seq.substring(firstBase, lastBase);
      compSeqs[i] = compSeq.substring(firstBase, lastBase);

      // store a unique id from the block
      ids[i] = seqs[i] + String(i);

      const spacingHeight = 0.25 * elementHeight;
      // find the line height for the seq block based on how many rows need to be shown
      let blockHeight = lineHeight * 1.1; // this is for padding between the rows
      if (zoomed) {
        blockHeight += lineHeight; // is zoomed in enough + 2px margin
        blockHeight += showComplement ? lineHeight : 0; // double for complement + 2px margin
      }
      if (showIndex) {
        blockHeight += 25; // another for index row (height is fixed right now)
      }
      if (annotationRows[i].length) {
        blockHeight += annotationRows[i].length * elementHeight + spacingHeight;
      }
      if (cutSiteRows[i].length) {
        blockHeight += lineHeight + spacingHeight; // space for cutsite name
      }
      if (showPrimers && forwardPrimerRows[i].length) {
        blockHeight += elementHeight * 3 * forwardPrimerRows[i].length;
      }
      if (showPrimers && reversePrimerRows[i].length) {
        blockHeight += elementHeight * 3 * reversePrimerRows[i].length;
      }
      if (translationRows[i].length) {
        blockHeight +=
          translationRows[i].length * elementHeight + spacingHeight;
      }
      blockHeights[i] = blockHeight;
    }

    const seqBlocks = [];
    let yDiff = 0;
    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      seqBlocks.push(
        <SeqBlock
          {...this.props}
          key={ids[i]}
          id={ids[i]}
          y={yDiff}
          seq={seqs[i]}
          compSeq={compSeqs[i]}
          blockHeight={blockHeights[i]}
          annotationRows={annotationRows[i]}
          forwardPrimerRows={forwardPrimerRows[i]}
          reversePrimerRows={reversePrimerRows[i]}
          cutSiteRows={cutSiteRows[i]}
          searchRows={searchRows[i]}
          translations={translationRows[i]}
          firstBase={firstBase}
          onUnmount={onUnmount}
          fullSeq={seq}
          size={{ ...size }}
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
