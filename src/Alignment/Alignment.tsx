import { InfiniteScroll } from "./InfiniteScroll";
import { SeqBlock } from "./SeqBlock";
import { InputRefFunc } from "../SelectionHandler";
import { Annotation, CutSite, Highlight, NameRange, Range, SeqType, Size } from "../elements";
import { createMultiRows, createSingleRows, stackElements } from "../elementsToRows";
import { isEqual } from "../isEqual";
import { createTranslations } from "../sequence";
import * as React from "react";


export interface LinearProps {
  annotations: Annotation[];
  bpColors?: { [key: number | string]: string };
  bpsPerBlock: number;
  charWidth: number;
  compSeq: string;
  cutSites: CutSite[];
  viewer:string;
  elementHeight: number;
  handleMouseEvent: React.MouseEventHandler;
  highlights: Highlight[];
  inputRef: InputRefFunc;
  lineHeight: number;
  onUnmount: (id: string) => void;
  search: NameRange[];
  seq: string;
  seqToCompare: string;
  seqFontSize: number;
  seqType: SeqType;
  showComplement: boolean;
  colorized: boolean;
  aagrouping?: boolean;
  showIndex: boolean;
  size: Size;
  translations: Range[];
  zoom: { linear: number };
}

/**
 * A linear sequence viewer.
 *
 * Comprised of SeqBlock(s), which are themselves comprised of:
 * 	text (seq)
 * 	Index (axis)
 * 	Annotations
 *  Finds
 *  Translations
 *  Selections
 */
export default class Alignment extends React.Component<LinearProps> {
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
      viewer,
      highlights,
      lineHeight,
      sequenceToCompare,
      onUnmount,
      search,
      seq,
      seqType,
      // showComplement,
      showIndex,
      size,
      translations,
      zoom,
    } = this.props;

    // un-official definition for being zoomed in. Being over 10 seems like a decent cut-off
    const zoomed = zoom.linear > 10;
    const showComplement=false;

    const blossom_block = [
      ['c'],
      ['s','t','a','g','p'],
      ['d','e','q','n'],
      ['k','r','h'],
      ['m','i','l','v'],
      ['f','y','w']
    ];
    // the actual fragmenting of the sequence into subblocks. generates all info that will be needed
    // including sequence blocks, complement blocks, annotations, blockHeights
    const seqLength = seq.length;
    let arrSize = Math.round(Math.ceil(seqLength / bpsPerBlock));
    if (arrSize === Number.POSITIVE_INFINITY) arrSize = 1;
    const seqToCompareLength = sequenceToCompare.length;
    let arrCompareSize = Math.round(Math.ceil(seqToCompareLength / bpsPerBlock));
    if (arrSize === Number.POSITIVE_INFINITY) arrSize = 1;
    let seqSymbols = '';
    if (seqType === 'aa') {
      sequenceToCompare.split('').forEach((c, i) => seqSymbols += (blossom_block.find(block => block.includes(c.toLowerCase())) || []).includes(seq[i].toLowerCase()) ? (seq[i] === c )  ? '|': '.' : ' ');
    } else {
      sequenceToCompare.split('').forEach((c, i) => seqSymbols += [c ,seq[i]].includes('-') ? ' ' : c === seq[i] ? '|' : '.' );
    }
    const ids = new Array(arrSize); // array of SeqBlock ids
    const seqs = new Array(arrSize); // arrays for sequences...
    const seqsToCompare = new Array(arrCompareSize); // arrays for sequences...
    const seqsSymbols = new Array(arrCompareSize); // arrays for sequences...
    const idsCp = new Array(arrCompareSize); // array of SeqBlock ids
    const idsSy = new Array(arrCompareSize); // array of SeqBlock ids
    const compSeqs = new Array(arrSize); // complements...
    const blockHeights = new Array(arrSize); // block heights...

    const cutSiteRows = cutSites.length
      ? createSingleRows(cutSites, bpsPerBlock, arrSize)
      : new Array(arrSize).fill([]);

    /**
     * Vet the annotations for starts and ends at zero index
     */
    const vetAnnotations = (annotations: Annotation[]) => {
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

    const searchRows: NameRange[][] =
      search && search.length ? createSingleRows(search, bpsPerBlock, arrSize) : new Array(arrSize).fill([]);

    const highlightRows = createSingleRows(highlights, bpsPerBlock, arrSize);

    const translationRows = translations.length
      ? createSingleRows(createTranslations(translations, seq, seqType), bpsPerBlock, arrSize)
      : new Array(arrSize).fill([]);
    const translationRowsForSymbols = translations.length
    ? createSingleRows(createTranslations(translations, seqSymbols, seqType), bpsPerBlock, arrSize)
    : new Array(arrSize).fill([]);// seqSymbols;
    const translationRowsComparison = translations.length
    ? createSingleRows(createTranslations(translations, sequenceToCompare, seqType), bpsPerBlock, arrSize)
    : new Array(arrSize).fill([]);

    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      const lastBase = firstBase + bpsPerBlock;

      // cut the new sequence and, if also looking for complement, the complement as well
      seqs[i] = seq.substring(firstBase, lastBase);
      seqsSymbols[i] = seqSymbols.substring(firstBase, lastBase);
      seqsToCompare[i] = sequenceToCompare.substring(firstBase, lastBase);
      compSeqs[i] = compSeq.substring(firstBase, lastBase);

      // store a unique id from the block
      ids[i] = seqs[i] + String(i);
      idsCp[i] = seqsToCompare[i] + String(i);
      idsSy[i] = seqsSymbols[i] + String(i);

      // find the line height for the seq block based on how many rows need to be shown
      let blockHeight = lineHeight * 1.1; // this is for padding between the SeqBlocks
      if (seqType != "aa") {
        blockHeight += lineHeight; // for sequence row
      }
      if (zoomed) {
        blockHeight += showComplement ? lineHeight : 0; // double for complement + 2px margin
      }
      if (showIndex) {
        blockHeight += lineHeight; // another for index row
      }
      if (translationRows[i].length ) {
        blockHeight += translationRows[i].length * elementHeight;
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
    const seqBlocksCompare: JSX.Element[] = [];
    const seqBlocksSymbols: JSX.Element[] = [];
    let yDiff = 0;
    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      [
        { identifier:'seq1', translationRow:translationRows,array:seqBlocks,fullSequence:seq,sequence: seqs, id: ids, multiplyFactor: 0.3, showIndex: false },
        { identifier:'symbol', translationRow:translationRowsForSymbols,array:seqBlocksSymbols,fullSequence:seqSymbols,sequence: seqsSymbols, id: idsSy, multiplyFactor: 0.3, showIndex: false },
        { identifier:'seq2', translationRow:translationRowsComparison,array:seqBlocksCompare,fullSequence:sequenceToCompare,sequence: seqsToCompare, id: idsCp, multiplyFactor: 1, showIndex: true },
      ].forEach(({ identifier, translationRow, array, fullSequence, sequence, id, multiplyFactor, showIndex }) => {
        array.push(
          <SeqBlock
            key={`${id[i]}_${identifier}`}
            annotationRows={annotationRows[i]}
            blockHeight={blockHeights[i] * multiplyFactor}
            bpColors={this.props.bpColors}
            bpsPerBlock={bpsPerBlock}
            charWidth={this.props.charWidth}
            compSeq={sequenceToCompare}
            symbolSeq={seqSymbols}
            cutSiteRows={cutSiteRows[i]}
            elementHeight={elementHeight}
            aagrouping={this.props.aagrouping}
            firstBase={firstBase}
            fullSeq={fullSequence}
            handleMouseEvent={this.props.handleMouseEvent}
            highlights={highlightRows[i]}
            id={id[i]}
            viewer={viewer}
            inputRef={this.props.inputRef}
            lineHeight={lineHeight}
            searchRows={searchRows[i]}
            colorized={this.props.colorized}
            seq={sequence[i]}
            seqFontSize={this.props.seqFontSize}
            seqType={seqType}
            showComplement={false}
            showIndex={showIndex}
            size={size}
            translations={translationRow[i]}
            y={yDiff}
            zoom={zoom}
            zoomed={zoomed}
            onUnmount={onUnmount}
          />
        );
      });
      yDiff += blockHeights[i];
    }

    return (
      seqBlocks.length && (
        <>
        <InfiniteScroll
          alignment={true}
          blockHeights={blockHeights}
          bpsPerBlock={bpsPerBlock}
          seqBlocks={seqBlocks}
          seqBlocksCompare={seqBlocksCompare}
          seqBlocksSymbols={seqBlocksSymbols}
          size={{height: size.height, width:size.width}}
          totalHeight={blockHeights.reduce((acc, h) => acc + h, 0)}
        />
        </>
      )
    );
  }
}