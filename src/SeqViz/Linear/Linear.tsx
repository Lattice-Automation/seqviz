import * as React from "react";

import { Annotation, Primer } from "../../part";
import bindingSites from "../../utils/bindingSites";
import isEqual from "../../utils/isEqual";
import { SearchResult } from "../../utils/search";
import { createLinearTranslations } from "../../utils/sequence";
import { Coor, ICutSite, ISize, InputRefFuncType } from "../common";
import { createMultiRows, createSingleRows, stackElements } from "../elementsToRows";
import withViewerHOCs from "../handlers";
import { SeqVizSelection } from "../handlers/selection";
import InfiniteScroll from "./InfiniteScroll";
import { HighlightRegion } from "./SeqBlock/LinearFind";
import SeqBlock from "./SeqBlock/SeqBlock";
import { Translation } from "./SeqBlock/Translations";

interface LinearProps {
  annotations: Annotation[];
  bpColors: string[];
  bpsPerBlock: number;
  center: Coor;
  charWidth: number;
  compSeq: string;
  cutSites: ICutSite[];
  elementHeight: number;
  findCoor: (index: number, radius: number, rotate?: boolean) => Coor;
  generateArc: (args: {
    arrowFWD?: boolean;
    arrowREV?: boolean;
    innerRadius: number;
    largeArc: boolean;
    length: number;
    offset?: number;
    outerRadius: number;
    // see svg.arc large-arc-flag
    sweepFWD?: boolean;
  }) => string;
  getRotation: (index: number) => string;
  highlightedRegions: HighlightRegion[];
  inputRef: InputRefFuncType;
  lineHeight: number;
  mouseEvent: React.MouseEventHandler;
  onUnmount: (a: unknown) => void;
  primers: Primer[];
  radius: number;
  rotateCoor: (coor: Coor, degrees: number) => Coor;
  search: SearchResult[];
  selection: SeqVizSelection;
  seq: string;
  seqFontSize: number;
  seqLength: number;
  showComplement: boolean;
  showIndex: boolean;
  showPrimers: boolean;
  size: ISize;
  totalRows: number;
  translations: Translation[];
  zoom: { linear: number };
}

/**
 * A linear sequence viewer.
 *
 * Comprised of SeqBlock(s), which are themselves comprised of:
 * 	SeqBlock:
 * 		SeqRow
 * 		IndexRow (axis)
 * 		Annotations
 *    Primers
 *    Finds
 *    Translations
 *    Selections
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
class Linear extends React.Component<LinearProps> {
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
      lineHeight,
      onUnmount,
      search,
      seq,
      showComplement,
      showIndex,
      showPrimers,
      size,
      translations,
      zoom,
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

    const forwardPrimerRows = showPrimers // primers...
      ? createMultiRows(stackElements(forwardPrimers, seq.length), bpsPerBlock, arrSize)
      : new Array(arrSize).fill([]);

    const reversePrimerRows = showPrimers // primers...
      ? createMultiRows(stackElements(reversePrimers, seq.length), bpsPerBlock, arrSize)
      : new Array(arrSize).fill([]);

    const searchRows =
      search && search.length ? createSingleRows(search, bpsPerBlock, arrSize) : new Array(arrSize).fill([]);

    const highlightRows = createSingleRows(this.props.highlightedRegions, bpsPerBlock, arrSize);

    const translationRows = translations.length
      ? createSingleRows(createLinearTranslations(translations, seq), bpsPerBlock, arrSize)
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
      if (zoomed) {
        blockHeight += lineHeight; // is zoomed in enough
        blockHeight += showComplement ? lineHeight : 0; // double for complement + 2px margin
      }
      if (showIndex) {
        blockHeight += lineHeight; // another for index row
      }
      if (translationRows[i].length) {
        blockHeight += translationRows[i].length * elementHeight;
      }
      if (annotationRows[i].length) {
        blockHeight += annotationRows[i].length * elementHeight;
      }
      if (cutSiteRows[i].length) {
        blockHeight += lineHeight; // space for cutsite name
      }
      if (showPrimers && forwardPrimerRows[i].length) {
        blockHeight += elementHeight * 3 * forwardPrimerRows[i].length;
      }
      if (showPrimers && reversePrimerRows[i].length) {
        blockHeight += elementHeight * 3 * reversePrimerRows[i].length;
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
          forwardPrimerRows={forwardPrimerRows[i]}
          fullSeq={seq}
          highlightedRegions={highlightRows[i]}
          id={ids[i]}
          inputRef={this.props.inputRef}
          lineHeight={lineHeight}
          mouseEvent={this.props.mouseEvent}
          reversePrimerRows={reversePrimerRows[i]}
          searchRows={searchRows[i]}
          selection={this.props.selection}
          seq={seqs[i]}
          seqFontSize={this.props.seqFontSize}
          showComplement={showComplement}
          showIndex={showIndex}
          showPrimers={showPrimers}
          size={size}
          translations={translationRows[i]}
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

export default withViewerHOCs(Linear);
