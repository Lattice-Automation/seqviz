import * as React from "react";

import {
  Annotation,
  CutSite,
  Highlight,
  InputRefFuncType,
  NameRange,
  Primer,
  Range,
  Size,
  Translation,
} from "../elements";
import { Selection as SelectionType } from "../handlers/selection";
import AnnotationRows from "./Annotations";
import CutSiteRow from "./CutSites";
import Find from "./Find";
import Highlights from "./Highlights";
import IndexRow from "./Index";
import Primers from "./Primers";
import Selection from "./Selection";
import TranslationRows from "./Translations";

export type FindXAndWidthType = (
  n1?: number | null,
  n2?: number | null
) => {
  width: number;
  x: number;
};

export type FindXAndWidthElementType = (
  i: number,
  element: NameRange,
  elements: NameRange[]
) => { overflowLeft: boolean; overflowRight: boolean; width: number; x: number };

interface SeqBlockProps {
  annotationRows: Annotation[][];
  blockHeight: number;
  bpColors?: { [key: number | string]: string };
  bpsPerBlock: number;
  charWidth: number;
  compSeq: string;
  cutSiteRows: CutSite[];
  elementHeight: number;
  firstBase: number;
  forwardPrimerRows: Primer[];
  fullSeq: string;
  highlights: Highlight[];
  id: string;
  inputRef: InputRefFuncType;
  key: string;
  lineHeight: number;
  mouseEvent: React.MouseEventHandler<SVGSVGElement>;
  onUnmount: (a: string) => void;
  reversePrimerRows: Primer[];
  searchRows: Range[];
  selection: SelectionType;
  seq: string;
  seqFontSize: number;
  showComplement: boolean;
  showIndex: boolean;
  showPrimers: boolean;
  size: Size;
  translations: Translation[];
  y: number;
  zoom: { linear: number };
  zoomed: boolean;
}

/**
 * SeqBlock
 *
 * Comprised of:
 * 	   IndexRow (the x axis basepair index)
 * 	   AnnotationRows (annotations)
 * 	   Selection (cursor selection range)
 * 	   Find (regions that match the users current find search)
 *     CutSites (cut sites)
 *     Primers
 *     Translations
 *
 * a single block of linear sequence. Essentially a row that holds
 * the sequence, and flair around it including the
 * complementary sequence, sequence index, and anotations *
 */
export default class SeqBlock extends React.PureComponent<SeqBlockProps> {
  static defaultProps = {};

  componentWillUnmount = () => {
    const { id, onUnmount } = this.props;
    onUnmount(id);
  };

  /**
   * For elements in arrays, check whether it wraps around the zero index.
   */
  findXAndWidthElement = (i: number, element: NameRange, elements: NameRange[]) => {
    const { bpsPerBlock, firstBase, fullSeq, seq } = this.props;
    const lastBase = firstBase + seq.length;
    const { end, start } = element;

    let { width, x } = this.findXAndWidth(start, end);

    // does the element overflow to the left or the right of this seqBlock?
    let overflowLeft = start < firstBase;
    let overflowRight = end > lastBase || (start === end && fullSeq.length > bpsPerBlock); // start === end means covers whole plasmid

    // if the element starts and ends in a SeqBlock, by circling all the way around,
    // it will be rendered twice (once from the firstBase to start and another from end to lastBase)
    // eg: https://user-images.githubusercontent.com/13923102/35816281-54571e70-0a68-11e8-92eb-ab56884337ac.png
    const split = elements.reduce((acc, el) => (el.id === element.id ? acc + 1 : acc), 0) > 1; // is this element in two pieces?
    if (split) {
      if (elements.findIndex(el => el.id === element.id) === i) {
        // we're in the first half of the split element
        ({ width, x } = this.findXAndWidth(firstBase, end));
        overflowLeft = true;
        overflowRight = false;
      } else {
        // we're in the second half of the split element
        ({ width, x } = this.findXAndWidth(start, lastBase));
        overflowLeft = false;
        overflowRight = true;
      }
    } else if (start > end) {
      // the element crosses over the zero index and this needs to be accounted for
      // this is very similar to the Block rendering logic in ../Selection/Selection.jsx
      ({ width, x } = this.findXAndWidth(
        start > lastBase ? firstBase : Math.max(firstBase, start),
        end < firstBase ? lastBase : Math.min(lastBase, end)
      ));

      // if this is the first part of element that crosses the zero index
      if (start > firstBase) {
        overflowLeft = true;
        overflowRight = end > lastBase;
      }

      // if this is the second part of an element, check if it overflows
      if (end < firstBase) {
        overflowLeft = start < firstBase;
        overflowRight = true;
      }
    } else if (start === end) {
      // the element circles the entire plasmid and we aren't currently in a SeqBlock
      // where the element starts or ends
      ({ width, x } = this.findXAndWidth(start, end + fullSeq.length));
    }

    return { overflowLeft, overflowRight, width, x };
  };

  /**
   * A helper used in child components to position elements on rows. Given first and last base, how far from the left
   * and how wide should it be?
   *
   * If an element and elements are provided, it also factors in whether the element circles around the 0-index.
   */
  findXAndWidth = (firstIndex = 0, lastIndex = 0) => {
    const {
      bpsPerBlock,
      charWidth,
      firstBase,
      fullSeq: { length: seqLength },
      size,
    } = this.props;

    firstIndex |= 0;
    lastIndex |= 0;

    const lastBase = Math.min(firstBase + bpsPerBlock, seqLength);
    const multiBlock = seqLength >= bpsPerBlock;

    let x = 0;
    if (firstIndex >= firstBase) {
      // is the +1 weird? yes. does it slightly improve alignments? also yes.
      x = (firstIndex - firstBase) * charWidth + 1;
      x = Math.max(x, 0) || 0;
    }

    // find the width for the current element
    let width = size.width;
    if (firstIndex === lastIndex) {
      // it starts on the last bp
      width = 0;
    } else if (firstIndex >= firstBase || lastIndex < lastBase) {
      // it starts or ends in this SeqBlock
      const start = Math.max(firstIndex, firstBase);
      const end = Math.min(lastIndex, lastBase);

      width = size.width * ((end - start) / bpsPerBlock);
      width = Math.abs(width) || 0;
    } else if (firstBase + bpsPerBlock > seqLength && multiBlock) {
      // it's an element in the last SeqBlock, that doesn't span the whole width
      width = size.width * ((seqLength % bpsPerBlock) / bpsPerBlock);
    }

    return { width, x };
  };

  /**
   * Given a bp, return either the bp as was or a text span if it should have a color.
   *
   * We're looking up each bp in the props.bpColors map to see if it should be shaded and, if so,
   * wrapping it in a textSpan with that color as a fill
   */
  seqTextSpan = (bp: string, i: number) => {
    const { bpColors, charWidth, firstBase, id } = this.props;

    let color: string | undefined;
    if (bpColors) {
      color =
        bpColors[bp] ||
        bpColors[bp.toUpperCase()] ||
        bpColors[bp.toLowerCase()] ||
        bpColors[i + firstBase] ||
        undefined;
    }

    return (
      // the +0.2 here and above is to offset the characters they're not right on the left edge. When they are,
      // other elements look like they're shifted too far to the right.
      <tspan key={i + bp + id} fill={color || undefined} x={charWidth * i + charWidth * 0.2}>
        {bp}
      </tspan>
    );
  };

  render() {
    const {
      annotationRows,
      blockHeight,
      bpsPerBlock,
      charWidth,
      compSeq,
      cutSiteRows,
      elementHeight,
      firstBase,
      forwardPrimerRows,
      fullSeq,
      highlights,
      id,
      inputRef,
      lineHeight,
      mouseEvent,
      onUnmount,
      reversePrimerRows,
      searchRows,
      selection,
      seq,
      seqFontSize,
      showComplement,
      showIndex,
      showPrimers,
      size,
      translations,
      zoom,
      zoomed,
    } = this.props;

    if (!size.width || !size.height) return null;

    const textProps = {
      dominantBaseline: "hanging",
      fontSize: seqFontSize,
      lengthAdjust: "spacing",
      textAnchor: "start",
      textLength: size.width >= 0 ? size.width : 1,
      textRendering: "optimizeLegibility",
    };

    const lastBase = firstBase + seq.length;
    const seqRange = {
      element: this,
      end: lastBase,
      ref: id,
      start: firstBase,
      type: "SEQ",
    };

    // height and yDiff of forward primers (above sequence)
    const forwardPrimerYDiff = 0;
    const forwardPrimerHeight =
      showPrimers && forwardPrimerRows.length ? elementHeight * 3 * forwardPrimerRows.length : 0;

    // height and yDiff of cut sites
    const cutSiteYDiff = zoomed && cutSiteRows.length ? forwardPrimerYDiff + forwardPrimerHeight : forwardPrimerHeight; // spacing for cutSite names
    const cutSiteHeight = zoomed && cutSiteRows.length ? lineHeight : 0;

    // height and yDiff of the sequence strand
    const indexYDiff = cutSiteYDiff + cutSiteHeight;
    const indexHeight = lineHeight;

    // height and yDiff of the complement strand
    const compYDiff = indexYDiff + indexHeight;
    const compHeight = zoomed && showComplement ? lineHeight : 0;

    // height and yDiff of reverse primers (below sequence)
    const reversePrimerYDiff = compYDiff + compHeight;
    const reversePrimerHeight =
      showPrimers && reversePrimerRows.length ? elementHeight * 3 * reversePrimerRows.length : 0;

    // height and yDiff of translations
    const translationYDiff = reversePrimerYDiff + reversePrimerHeight;
    const translationHeight = elementHeight * translations.length;

    // height and yDiff of annotations
    const annYDiff = translationYDiff + translationHeight;
    const annHeight = elementHeight * annotationRows.length;

    // height and ydiff of the index row.
    const elementGap = annotationRows.length + translations.length + reversePrimerRows.length ? 3 : 0;
    const indexRowYDiff = annYDiff + annHeight + elementGap;
    // const indexRowHeight = showIndex ? elementHeight : 0;

    // calc the height necessary for the sequence selection
    const selectHeight =
      forwardPrimerHeight +
      cutSiteHeight +
      indexHeight +
      compHeight +
      reversePrimerHeight +
      translationHeight +
      annHeight +
      elementGap +
      5; // it starts 5 above the top of the SeqBlock
    let selectEdgeHeight = selectHeight + 9; // +9 is the height of a tick + index row

    // needed because otherwise the selection height is very small
    if (!zoomed && selectHeight <= elementHeight) {
      selectEdgeHeight += lineHeight;
    }

    return (
      <svg
        ref={inputRef(id, seqRange)}
        className="la-vz-seqblock"
        cursor="text"
        display="block"
        height={blockHeight}
        id={id}
        width={size.width >= 0 ? size.width : 0}
        onMouseDown={mouseEvent}
        onMouseMove={mouseEvent}
        onMouseUp={mouseEvent}
      >
        {showIndex && (
          <IndexRow
            charWidth={charWidth}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            lastBase={lastBase}
            seq={seq}
            showIndex={showIndex}
            size={size}
            transform={`translate(0, ${indexRowYDiff})`}
            zoom={zoom}
          />
        )}
        <Selection.Block
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          fullSeq={fullSeq}
          inputRef={inputRef}
          lastBase={lastBase}
          selectHeight={selectHeight}
          selection={selection}
          onUnmount={onUnmount}
        />
        <Highlights
          compYDiff={compYDiff - 3}
          findXAndWidth={this.findXAndWidthElement}
          firstBase={firstBase}
          highlights={highlights}
          indexYDiff={indexYDiff - 3}
          inputRef={inputRef}
          lastBase={lastBase}
          lineHeight={lineHeight}
          listenerOnly={false}
          seqBlockRef={this}
        />
        <Selection.Edges
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          fullSeq={fullSeq}
          lastBase={lastBase}
          selectEdgeHeight={selectEdgeHeight}
          zoom={zoom.linear}
        />
        <Find
          compYDiff={compYDiff}
          filteredRows={showComplement ? searchRows : searchRows.filter(r => r.direction === 1)}
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          indexYDiff={indexYDiff}
          inputRef={inputRef}
          lastBase={lastBase}
          listenerOnly={false}
          seqBlockRef={this}
        />
        <TranslationRows
          {...this.props}
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          lastBase={lastBase}
          seqBlockRef={this}
          yDiff={translationYDiff}
        />
        <AnnotationRows
          annotationRows={annotationRows}
          bpsPerBlock={bpsPerBlock}
          elementHeight={elementHeight}
          findXAndWidth={this.findXAndWidthElement}
          firstBase={firstBase}
          fullSeq={fullSeq}
          inputRef={inputRef}
          lastBase={lastBase}
          seqBlockRef={this}
          width={size.width}
          yDiff={annYDiff}
        />
        {showPrimers && (
          <Primers
            charWidth={charWidth}
            direction={1}
            elementHeight={elementHeight}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            fontSize={seqFontSize}
            forwardPrimerRows={forwardPrimerRows}
            fullSeq={fullSeq}
            inputRef={inputRef}
            lastBase={lastBase}
            reversePrimerRows={forwardPrimerRows}
            seqBlockRef={this}
            showPrimers={showPrimers}
            yDiff={forwardPrimerYDiff}
            zoomed={zoomed}
            onUnmount={onUnmount}
          />
        )}
        {showPrimers && (
          <Primers
            charWidth={charWidth}
            direction={-1}
            elementHeight={elementHeight}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            fontSize={seqFontSize}
            forwardPrimerRows={forwardPrimerRows}
            fullSeq={fullSeq}
            inputRef={inputRef}
            lastBase={lastBase}
            reversePrimerRows={forwardPrimerRows}
            seqBlockRef={this}
            showPrimers={showPrimers}
            yDiff={reversePrimerYDiff}
            zoomed={zoomed}
            onUnmount={onUnmount}
          />
        )}
        {zoomed && (
          <CutSiteRow
            charWidth={charWidth}
            cutSites={cutSiteRows}
            elementHeight={elementHeight}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            inputRef={inputRef}
            lastBase={lastBase}
            lineHeight={lineHeight}
            yDiff={cutSiteYDiff - 3}
            zoom={zoom}
          />
        )}
        {zoomed ? (
          <text {...textProps} id={id} y={indexYDiff}>
            {seq.split("").map((bp, i) => this.seqTextSpan(bp, i))}
          </text>
        ) : null}
        {compSeq && zoomed && showComplement ? (
          <text {...textProps} id={id} y={compYDiff}>
            {compSeq.split("").map((bp, i) => this.seqTextSpan(bp, i))}
          </text>
        ) : null}
        <Find
          compYDiff={compYDiff}
          filteredRows={showComplement ? searchRows : searchRows.filter(r => r.direction === 1)}
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          indexYDiff={indexYDiff}
          inputRef={inputRef}
          lastBase={lastBase}
          listenerOnly={true}
          seqBlockRef={this}
        />
        <Highlights
          compYDiff={compYDiff - 3}
          findXAndWidth={this.findXAndWidthElement}
          firstBase={firstBase}
          highlights={highlights}
          indexYDiff={indexYDiff - 3}
          inputRef={inputRef}
          lastBase={lastBase}
          lineHeight={lineHeight}
          listenerOnly={true}
          seqBlockRef={this}
        />
      </svg>
    );
  }
}
