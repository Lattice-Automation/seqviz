import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { Annotation, CutSite, Highlight, NameRange, Range, SeqType, Size, Translation } from "../elements";
import AnnotationRows from "./Annotations";
import { CutSites } from "./CutSites";
import Find from "./Find";
import Highlights from "./Highlights";
import IndexRow from "./Index";
import Selection from "./Selection";
import { TranslationRows } from "./Translations";

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
  annotationPositions: Map<string, number>;
  annotationRows: Annotation[][];
  blockHeight: number;
  blockWidth: number;
  bpColors?: { [key: number | string]: string };
  bpsPerBlock: number;
  charWidth: number;
  compSeq: string;
  cutSiteRows: CutSite[];
  elementHeight: number;
  firstBase: number;
  fullSeq: string;
  handleMouseEvent: React.MouseEventHandler<SVGSVGElement>;
  highlights: Highlight[];
  id: string;
  inputRef: InputRefFunc;
  key: string;
  lineHeight: number;
  onUnmount: (a: string) => void;
  oneRow: boolean;
  searchRows: Range[];
  seq: string;
  seqFontSize: number;
  seqType: SeqType;
  showComplement: boolean;
  showIndex: boolean;
  size: Size;
  translationPositions: Map<string, number>;
  translations: Translation[];
  x: number;
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
 *     Translations
 *
 * a single block of linear sequence. Essentially a row that holds
 * the sequence, and flair around it including the
 * complementary sequence, sequence index, and anotations *
 */
export class SeqBlock extends React.PureComponent<SeqBlockProps> {
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
      x = (firstIndex - firstBase) * charWidth;
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
      annotationPositions,
      annotationRows,
      blockHeight,
      blockWidth,
      bpsPerBlock,
      charWidth,
      compSeq,
      cutSiteRows,
      elementHeight,
      firstBase,
      fullSeq,
      handleMouseEvent,
      highlights,
      id,
      inputRef,
      lineHeight,
      onUnmount,
      oneRow,
      searchRows,
      seq,
      seqFontSize,
      seqType,
      showComplement,
      showIndex,
      size,
      translationPositions,
      translations,
      zoom,
      zoomed,
    } = this.props;

    if (!size.width || !size.height) return null;

    const textProps = {
      fontSize: seqFontSize,
      lengthAdjust: "spacing",
      textAnchor: "start",
      textLength: size.width >= 0 ? size.width : 1,
      textRendering: "optimizeLegibility",
    };

    const lastBase = firstBase + seq.length;

    // height and yDiff of cut sites
    const cutSiteYDiff = 0; // spacing for cutSite names
    const cutSiteHeight = zoomed && (cutSiteRows.length || oneRow) ? lineHeight : 0;

    // height and yDiff of the sequence strand
    const indexYDiff = cutSiteYDiff + cutSiteHeight;
    const indexHeight = seqType === "aa" ? 0 : lineHeight; // if aa, no seq row is shown

    // height and yDiff of the complement strand
    const compYDiff = indexYDiff + indexHeight;
    const compHeight = zoomed && showComplement ? lineHeight : 0;

    // height and yDiff of translations
    const translationYDiff = compYDiff + compHeight;
    const maxStackedTranslations = translationPositions.size ? Math.max(...translationPositions.values()) + 1 : 0;
    const translationHeight = elementHeight * (oneRow ? maxStackedTranslations : translations.length);

    // height and yDiff of annotations
    const annYDiff = translationYDiff + translationHeight;
    const maxStackedAnnotations = annotationPositions.size ? Math.max(...annotationPositions.values()) + 1 : 0;
    const annHeight = elementHeight * (oneRow ? maxStackedAnnotations : annotationRows.length);

    // height and ydiff of the index row.
    const elementGap = translationHeight || annHeight ? 3 : 0;
    const indexRowYDiff = annYDiff + annHeight + elementGap;

    // calc the height necessary for the sequence selection
    // it starts 5 above the top of the SeqBlock
    const selectHeight = cutSiteHeight + indexHeight + compHeight + translationHeight + annHeight + elementGap + 5;
    let selectEdgeHeight = selectHeight + 9; // +9 is the height of a tick + index row

    // needed because otherwise the selection height is very small
    if (!zoomed && selectHeight <= elementHeight) {
      selectEdgeHeight = elementHeight;
    }

    return (
      <svg
        ref={inputRef(id, {
          end: lastBase,
          ref: id,
          start: firstBase,
          type: "SEQ",
          viewer: "LINEAR",
        })}
        className={oneRow ? "la-vz-linear-one-row-seqblock" : "la-vz-seqblock"}
        cursor="text"
        data-testid="la-vz-seqblock"
        display="block"
        height={blockHeight}
        id={id}
        width={oneRow ? blockWidth : size.width}
        onMouseDown={handleMouseEvent}
        onMouseMove={handleMouseEvent}
        onMouseUp={handleMouseEvent}
      >
        {showIndex && (
          <IndexRow
            charWidth={charWidth}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            lastBase={lastBase}
            seq={seq}
            seqType={seqType}
            showIndex={showIndex}
            size={size}
            yDiff={indexRowYDiff}
            zoom={zoom}
          />
        )}
        <Selection.Block
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          fullSeq={fullSeq}
          lastBase={lastBase}
          selectHeight={selectHeight}
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
        />
        <Find
          compYDiff={compYDiff - 3}
          filteredRows={showComplement ? searchRows : searchRows.filter(r => r.direction === 1)}
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          indexYDiff={indexYDiff - 3}
          inputRef={inputRef}
          lastBase={lastBase}
          lineHeight={lineHeight}
          listenerOnly={false}
          zoomed={zoomed}
        />
        {translations.length && (
          <TranslationRows
            bpsPerBlock={bpsPerBlock}
            charWidth={charWidth}
            elementHeight={elementHeight}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            fullSeq={fullSeq}
            inputRef={inputRef}
            lastBase={lastBase}
            oneRow={oneRow}
            positions={translationPositions}
            seqType={seqType}
            translations={translations}
            yDiff={translationYDiff}
            onUnmount={onUnmount}
          />
        )}
        {annotationRows.length && (
          <AnnotationRows
            annotationRows={annotationRows}
            bpsPerBlock={bpsPerBlock}
            elementHeight={elementHeight}
            findXAndWidth={this.findXAndWidthElement}
            firstBase={firstBase}
            fullSeq={fullSeq}
            inputRef={inputRef}
            lastBase={lastBase}
            oneRow={oneRow}
            positions={annotationPositions}
            seqBlockRef={this}
            width={size.width}
            yDiff={annYDiff}
          />
        )}
        {zoomed && seqType !== "aa" ? (
          <text
            {...textProps}
            className="la-vz-seq"
            data-testid="la-vz-seq"
            id={id}
            transform={`translate(0, ${indexYDiff + lineHeight / 2})`}
          >
            {seq.split("").map(this.seqTextSpan)}
          </text>
        ) : null}
        {compSeq && zoomed && showComplement && seqType !== "aa" ? (
          <text
            {...textProps}
            className="la-vz-comp-seq"
            data-testid="la-vz-comp-seq"
            id={id}
            transform={`translate(0, ${compYDiff + lineHeight / 2})`}
          >
            {compSeq.split("").map(this.seqTextSpan)}
          </text>
        ) : null}
        {zoomed && (
          <CutSites
            cutSites={cutSiteRows}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            inputRef={inputRef}
            lastBase={lastBase}
            lineHeight={lineHeight}
            size={size}
            yDiff={cutSiteYDiff - 3}
            zoom={zoom}
          />
        )}
        <Find
          compYDiff={compYDiff - 3}
          filteredRows={showComplement ? searchRows : searchRows.filter(r => r.direction === 1)}
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          indexYDiff={indexYDiff - 3}
          inputRef={inputRef}
          lastBase={lastBase}
          lineHeight={lineHeight}
          listenerOnly={true}
          zoomed={zoomed}
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
