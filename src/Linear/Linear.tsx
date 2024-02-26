import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { Annotation, CutSite, Highlight, NameRange, Primer, SeqType, Size } from "../elements";
import { createMultiRows, createSingleRows, stackElements } from "../elementsToRows";
import { isEqual } from "../isEqual";
import { createTranslations } from "../sequence";
import { InfiniteScroll } from "./InfiniteScroll";
import { SeqBlock } from "./SeqBlock";

export interface LinearProps {
  annotations: Annotation[];
  bpColors?: { [key: number | string]: string };
  bpsPerBlock: number;
  charWidth: number;
  compSeq: string;
  cutSites: CutSite[];
  elementHeight: number;
  handleMouseEvent: React.MouseEventHandler;
  highlights: Highlight[];
  inputRef: InputRefFunc;
  lineHeight: number;
  onUnmount: (id: string) => void;
  primers: Primer[];
  search: NameRange[];
  seq: string;
  seqFontSize: number;
  seqType: SeqType;
  showComplement: boolean;
  showIndex: boolean;
  size: Size;
  translations: NameRange[];
  zoom: { linear: number };
}

/**
 * A linear sequence viewer.
 *
 * Comprised of SeqBlock(s) which are comprised of:
 * 	text (seq)
 * 	Index (axis)
 * 	Annotations
 *  Finds
 *  Translations
 *  Selections
 *  Primers
 */
export default class Linear extends React.Component<LinearProps> {
  /**
   * Deep equality comparison
   */
  shouldComponentUpdate = (nextProps: LinearProps) => !isEqual(nextProps, this.props);

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
      annotations,
      bpsPerBlock,
      compSeq,
      cutSites,
      elementHeight,
      highlights,
      lineHeight,
      onUnmount,
      primers,
      search,
      seq,
      seqType,
      showComplement,
      showIndex,
      size,
      translations,
      zoom,
    } = this.props;

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
     * Mutate elements that start or end at zero index
     */
    function vetAnnotations<T extends NameRange>(annotations: T[]): T[] {
      annotations.forEach(ann => {
        if (ann.end === 0 && ann.start > ann.end) ann.end = seqLength;
        if (ann.start === seqLength && ann.end < ann.start) ann.start = 0;
      });
      return annotations;
    }

    const primerFwdRows = createMultiRows(
      stackElements(vetAnnotations(primers.filter(p => p.direction === 1)), seq.length),
      bpsPerBlock,
      arrSize
    );
    const primerRevRows = createMultiRows(
      stackElements(vetAnnotations(primers.filter(p => p.direction === -1)), seq.length),
      bpsPerBlock,
      arrSize
    );

    const annotationRows = createMultiRows(
      stackElements(vetAnnotations(annotations), seq.length),
      bpsPerBlock,
      arrSize
    );

    const searchRows: NameRange[][] =
      search && search.length ? createSingleRows(search, bpsPerBlock, arrSize) : new Array(arrSize).fill([]);

    const highlightRows = createSingleRows(highlights, bpsPerBlock, arrSize);

    const translationRows = translations.length
      ? createMultiRows(stackElements(createTranslations(translations, seq, seqType), seq.length), bpsPerBlock, arrSize)
      : new Array(arrSize).fill([]);

    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      const lastBase = firstBase + bpsPerBlock;

      // cut the new sequence and, if also looking for complement, the complement as well
      seqs[i] = seq.substring(firstBase, lastBase);
      compSeqs[i] = compSeq.substring(firstBase, lastBase);

      // store a unique id from the block
      ids[i] = seqs[i] + String(i);

      // find the line height for the seq block based on how many rows need to be shown
      let blockHeight = lineHeight * 1.1; // this is for padding between the SeqBlocks
      if (seqType != "aa") {
        blockHeight += lineHeight; // for sequence row
      }
      if (zoomed) {
        blockHeight += showComplement ? lineHeight : 0; // double for complement + 2px margin
      }
      if (primerFwdRows[i].length) {
        blockHeight += primerFwdRows[i].length * lineHeight;
      }
      if (primerRevRows[i].length) {
        blockHeight += primerRevRows[i].length * lineHeight;
      }
      if (showIndex) {
        blockHeight += lineHeight; // another for index row
      }
      if (translationRows[i].length) {
        blockHeight += translationRows[i].length * elementHeight * 2; // * 2 to account for the translation handle
      }
      if (annotationRows[i].length) {
        blockHeight += annotationRows[i].length * elementHeight;
      }
      if (cutSiteRows[i].length) {
        blockHeight += lineHeight; // space for cutsite name
      }

      blockHeights[i] = blockHeight;
    }

    const seqBlocks: JSX.Element[] = [];
    let yDiff = 0;
    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      seqBlocks.push(
        <SeqBlock
          key={ids[i]}
          annotationRows={annotationRows[i]}
          blockHeight={blockHeights[i]}
          bpColors={this.props.bpColors}
          bpsPerBlock={bpsPerBlock}
          charWidth={this.props.charWidth}
          compSeq={compSeqs[i]}
          cutSiteRows={cutSiteRows[i]}
          elementHeight={elementHeight}
          firstBase={firstBase}
          fullSeq={seq}
          handleMouseEvent={this.props.handleMouseEvent}
          highlights={highlightRows[i]}
          id={ids[i]}
          inputRef={this.props.inputRef}
          lineHeight={lineHeight}
          primerFwdRows={primerFwdRows[i]}
          primerRevRows={primerRevRows[i]}
          searchRows={searchRows[i]}
          seq={seqs[i]}
          seqFontSize={this.props.seqFontSize}
          seqType={seqType}
          showComplement={showComplement}
          showIndex={showIndex}
          size={size}
          translationRows={translationRows[i]}
          y={yDiff}
          zoom={zoom}
          zoomed={zoomed}
          onUnmount={onUnmount}
        />
      );
      yDiff += blockHeights[i];
    }

    return (
      seqBlocks.length && (
        <InfiniteScroll
          blockHeights={blockHeights}
          bpsPerBlock={bpsPerBlock}
          seqBlocks={seqBlocks}
          size={size}
          totalHeight={blockHeights.reduce((acc, h) => acc + h, 0)}
        />
      )
    );
  }
}
