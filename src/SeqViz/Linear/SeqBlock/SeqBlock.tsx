import * as React from "react";

import { Annotation, ColorRange, CutSite, InputRefFuncType, Primer, Ranged, Size } from "../../../elements";
import { Selection as SelectionType } from "../../handlers/selection";
import { AnnotationRows } from "./AnnotationRows";
import CutSiteRow from "./CutSites";
import Find from "./Find";
import IndexRow from "./Index";
import Primers from "./Primers";
import Selection from "./Selection";
import TranslationRows, { Translation } from "./Translations";

export type FindXAndWidthType = (
  n1?: number | null,
  n2?: number | null
) => {
  width: number;
  x: number;
};

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
  highlightedRegions: ColorRange[];
  id: string;
  inputRef: InputRefFuncType;
  key: string;
  lineHeight: number;
  mouseEvent: React.MouseEventHandler<SVGSVGElement>;
  onUnmount: (a: string) => void;
  reversePrimerRows: Primer[];
  searchRows: Ranged[];
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
   * A helper used in child components to position elements on rows. Given first and last base, how far from the left
   * and how wide should it be?
   */
  findXAndWidth = (firstIndex = 0, lastIndex = 0) => {
    firstIndex |= 0;
    lastIndex |= 0;

    const {
      bpsPerBlock,
      charWidth,
      firstBase,
      fullSeq: { length: seqLength },
      size,
    } = this.props;

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
   * We're looking up each bp in the props.bpColors map to see if it should be shaded and, if so, wrapping it in a textSpan
   */
  seqTextSpan = (bp: string, i: number) => {
    const { charWidth, id } = this.props;

    const color = this.bpColorLookup(bp, i);
    if (color) {
      return (
        <tspan key={i + bp + id} fill={color} x={charWidth * i + charWidth * 0.2}>
          {bp}
        </tspan>
      );
    }

    return (
      // the +0.2 here and above is to offset the characters they're not right on the left edge. When they are,
      // other elements look like they're shifted too far to the right.
      <tspan key={i + bp + id} x={charWidth * i + charWidth * 0.2}>
        {bp}
      </tspan>
    );
  };

  /**
   * Lookup a bp in the bpColors prop and return the color
   * associated with the character, if one exists. Store the results
   */
  bpColorLookup = (bp: string, i: number) => {
    const { bpColors, firstBase } = this.props;

    if (!bpColors) {
      return;
    }

    const color =
      bpColors[bp] || bpColors[bp.toUpperCase()] || bpColors[bp.toLowerCase()] || bpColors[i + firstBase] || null;

    return color;
  };

  render() {
    const {
      annotationRows,
      blockHeight,
      charWidth,
      compSeq,
      cutSiteRows,
      elementHeight,
      firstBase,
      forwardPrimerRows,
      fullSeq,
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

    const svgProps = {
      display: "block",
      height: blockHeight,
      width: size.width,
    };
    const textProps = {
      dominantBaseline: "hanging",
      fontSize: seqFontSize,
      lengthAdjust: "spacing",
      textAnchor: "start",
      textLength: size.width,
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
    const indexHeight = zoomed ? lineHeight : 0; // bases not shown at < 10 zoom

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
    let selectHeight =
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
      selectHeight += lineHeight;
      selectEdgeHeight += lineHeight;
    }

    const filteredSearchRows = showComplement ? searchRows : searchRows.filter(r => r.direction === 1);

    return (
      <svg
        {...svgProps}
        ref={inputRef(id, seqRange)}
        className="la-vz-seqblock"
        cursor="text"
        id={id}
        onMouseDown={mouseEvent}
        onMouseMove={mouseEvent}
        onMouseUp={mouseEvent}
      >
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
          filteredRows={filteredSearchRows}
          findXAndWidth={this.findXAndWidth}
          firstBase={firstBase}
          highlightedRegions={this.props.highlightedRegions}
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
          bpsPerBlock={this.props.bpsPerBlock}
          elementHeight={elementHeight}
          findXAndWidth={this.findXAndWidth}
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
            zoom={this.props.zoom}
          />
        )}
        {zoomed ? (
          <CutSiteRow
            charWidth={charWidth}
            cutSiteRows={cutSiteRows}
            elementHeight={elementHeight}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            inputRef={inputRef}
            lastBase={lastBase}
            lineHeight={lineHeight}
            yDiff={cutSiteYDiff}
            zoom={this.props.zoom}
          />
        ) : null}
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
          {...this.props}
          compYDiff={compYDiff}
          filteredRows={filteredSearchRows}
          findXAndWidth={this.findXAndWidth}
          indexYDiff={indexYDiff}
          lastBase={lastBase}
          listenerOnly={true}
          seqBlockRef={this}
        />
      </svg>
    );
  }
}
