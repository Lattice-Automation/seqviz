import * as React from "react";

import Annotations from "./AnnotationRows";
import CutSiteRow from "./CutSites";
import IndexRow from "./Index";
import Find from "./Find";
import Primers from "./Primers";
import Selection from "./Selection";
import TranslationRows, { inputRefFuncType, Translation } from "./Translations";
import { CutSite, Primer, SizeType } from "../../Circular/Circular";
import { Annotation } from "../../../part";
import { SearchResult } from "../../../utils/search";
import { SeqVizSelection } from "../../SeqViz";
import { MouseEventHandler } from "react";

interface SeqBlockPosition {
  x: number; // [the x positioning, from left...]
  width: number; // [the width of the passed element]
  charWidth: number; // [the width of each character in the element]
}

interface SeqBlockProps {
  bpColors: string[];
  showIndex: boolean;
  showComplement: boolean;
  showPrimers: boolean;
  selection: SeqVizSelection;
  charWidth: number;
  seqFontSize: number;
  lineHeight: number;
  elementHeight: number;
  inputRef: inputRefFuncType;
  mouseEvent: MouseEventHandler<SVGSVGElement>;
  onUnmount: (a: string) => void;
  key: string;
  id: string;
  y: number;
  seq: string;
  compSeq: string;
  blockHeight: number;
  annotationRows: Annotation[];
  forwardPrimerRows: Primer[];
  reversePrimerRows: Primer[];
  cutSiteRows: CutSite[];
  searchRows: SearchResult[];
  translations: Translation[];
  firstBase: number;
  fullSeq: string;
  size: SizeType;
  zoomed: boolean;
  bpsPerBlock: number;
}
interface SeqBlockState {}

/**
 * SeqBlock
 *
 * Comprised of:
 * 	   IndexRow (the x axis basepair index)
 * 	   AnnotationRow (annotations)
 * 	   Selection (cursor selection range)
 * 	   Find (regions that match the users current find search)
 *
 * a single block of linear sequence. Essentially a row that holds
 * the sequence, and flair around it including the
 * complementary sequence, sequence index, and anotations *
 */
export default class SeqBlock extends React.PureComponent<SeqBlockProps, SeqBlockState> {
  static defaultProps = {};

  componentWillUnmount = () => {
    const { onUnmount, id } = this.props;
    onUnmount(id);
  };

  /**
   * @typedef {Object}
   * @property {Number}     x              [the x positioning, from left...]
   * @property {Number}     width          [the width of the passed element]
   * @property {Number}     charWidth      [the width of each character in the element]
   */

  /**
   * findXAndWidth
   *
   * a helper method that's used in several of the child components to figure
   * out how far from the left the element is and how wide it should be

   */
  findXAndWidth = (firstIndex = 0, lastIndex = 0) => {
    const {
      fullSeq: { length: seqLength },
      firstBase,
      size,
      bpsPerBlock,
    } = this.props;

    const lastBase = Math.min(firstBase + bpsPerBlock, seqLength);
    const multiBlock = seqLength >= bpsPerBlock;

    // 28 accounts for 10px padding on linear scroller and 8px scroller gutter
    // find the distance from the left to start
    let x = 0;
    if (firstIndex >= firstBase) {
      x = ((firstIndex - firstBase) / bpsPerBlock) * size.width;
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

    return { x, width };
  };

  /**
   * Given a bp, return either the bp as was, or a text span if it should have a color
   *
   * We're looking up each bp in the props.bpColors map to see if it should
   * be shadded and, if so, wrapping it in a textSpan
   */
  seqTextSpan = (bp: string, i: number) => {
    const { id, charWidth } = this.props;

    const color = this.bpColorLookup(bp, i);

    if (color) {
      return (
        <tspan key={i + bp + id} fill={color} x={charWidth * i}>
          {bp}
        </tspan>
      );
    }

    return (
      <tspan key={i + bp + id} x={charWidth * i}>
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

    const color =
      bpColors[bp] || bpColors[bp.toUpperCase()] || bpColors[bp.toLowerCase()] || bpColors[i + firstBase] || null;

    return color;
  };

  render() {
    const {
      seq,
      compSeq,
      fullSeq,
      annotationRows,
      forwardPrimerRows,
      reversePrimerRows,
      cutSiteRows,
      searchRows,
      translations,
      blockHeight,
      showIndex,
      showComplement,
      showPrimers,
      selection,
      seqFontSize,
      firstBase,
      size,
      lineHeight,
      elementHeight,
      mouseEvent,
      inputRef,
      id,
      onUnmount,
      charWidth,
      zoomed,
    } = this.props;

    if (!size.width || !size.height) return null;

    const svgProps = {
      display: "block",
      height: blockHeight,
      width: size.width,
    };
    const textProps = {
      dominantBaseline: "middle",
      fontSize: seqFontSize,
      lengthAdjust: "spacing",
      textAnchor: "start",
      textLength: size.width,
      textRendering: "optimizeLegibility",
    };

    const lastBase = firstBase + seq.length;
    const seqRange = {
      ref: id,
      start: firstBase,
      end: lastBase,
      type: "SEQ",
      element: this,
    };

    // height and yDiff of forward primers (above sequence)
    const forwardPrimerYDiff = 0;
    const forwardPrimerHeight =
      showPrimers && forwardPrimerRows.length ? elementHeight * 3 * forwardPrimerRows.length : 0;

    // height and yDiff of cut sites
    const cutSiteYDiff = zoomed && cutSiteRows.length ? elementHeight / 2 + forwardPrimerHeight : forwardPrimerHeight; // spacing for cutSite names
    const cutSiteHeight = zoomed && cutSiteRows.length ? elementHeight : 0;

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
    let translationYDiff = reversePrimerYDiff + reversePrimerHeight;
    const translationHeight = elementHeight * translations.length;
    if (translations.length) {
      translationYDiff += 0.25 * elementHeight;
    }

    // height and yDiff of annotations
    const annYDiff = translationYDiff + translationHeight;
    const annHeight = elementHeight * annotationRows.length;

    // calc the height necessary for the sequence selection
    let selectHeight =
      forwardPrimerHeight +
      indexHeight +
      compHeight +
      translationHeight +
      annHeight +
      cutSiteHeight +
      cutSiteYDiff +
      reversePrimerHeight;
    let selectEdgeHeight = showIndex ? selectHeight + 13 : selectHeight;

    // small edge-case for translation shifting downward
    if (translations.length) {
      selectHeight += 0.25 * elementHeight;
    }

    // needed because otherwise the selection height is very small
    if (!zoomed && selectHeight <= elementHeight) {
      selectHeight += lineHeight;
      selectEdgeHeight += lineHeight;
    }

    // find index row (the actual bar+ticks) Y diff
    const elementRowShown = annotationRows.length;
    let indexRowYDiff = annYDiff + annHeight;
    if (elementRowShown) {
      indexRowYDiff += 0.5 * elementHeight;
      selectHeight += 0.5 * elementHeight;
      selectEdgeHeight += 0.25 * elementHeight;
    }

    const filteredSearchRows = showComplement ? searchRows : searchRows.filter(r => r.direction === 1);

    return (
      <svg
        {...svgProps}
        className="la-vz-seqblock"
        id={id}
        ref={inputRef(id, seqRange)}
        onMouseDown={mouseEvent}
        onMouseUp={mouseEvent}
        onMouseMove={mouseEvent}
        cursor="text"
      >
        <g transform="translate(0, 10)">
          <Selection.Block
            selection={selection}
            selectHeight={selectHeight}
            findXAndWidth={this.findXAndWidth}
            inputRef={inputRef}
            onUnmount={onUnmount}
            firstBase={firstBase}
            lastBase={lastBase}
            fullSeq={fullSeq}
          />
          <Selection.Edges
            lastBase={lastBase}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            fullSeq={fullSeq}
            selectEdgeHeight={selectEdgeHeight}
          />
          <Find
            {...this.props}
            filteredRows={filteredSearchRows}
            findXAndWidth={this.findXAndWidth}
            indexYDiff={indexYDiff}
            compYDiff={compYDiff}
            seqBlockRef={this}
            lastBase={lastBase}
          />
          <Annotations
            {...this.props}
            findXAndWidth={this.findXAndWidth}
            lastBase={lastBase}
            yDiff={annYDiff}
            seqBlockRef={this}
            fullSeq={fullSeq}
          />
          {showPrimers && (
            <Primers
              {...this.props}
              findXAndWidth={this.findXAndWidth}
              firstBase={firstBase}
              lastBase={lastBase}
              yDiff={forwardPrimerYDiff}
              direction={1}
              seqBlockRef={this}
              fullSeq={fullSeq}
              charWidth={charWidth}
              fontSize={seqFontSize}
              zoomed={zoomed}
            />
          )}
          {showPrimers && (
            <Primers
              {...this.props}
              findXAndWidth={this.findXAndWidth}
              firstBase={firstBase}
              lastBase={lastBase}
              yDiff={reversePrimerYDiff}
              direction={-1}
              seqBlockRef={this}
              fullSeq={fullSeq}
              charWidth={charWidth}
              fontSize={seqFontSize}
              zoomed={zoomed}
            />
          )}
          {showIndex && (
            <IndexRow
              {...this.props}
              firstBase={firstBase}
              lastBase={lastBase}
              transform={`translate(0, ${indexRowYDiff})`}
              findXAndWidth={this.findXAndWidth}
            />
          )}
          {zoomed ? (
            <CutSiteRow {...this.props} findXAndWidth={this.findXAndWidth} lastBase={lastBase} yDiff={cutSiteYDiff} />
          ) : null}
          {zoomed ? (
            <text {...textProps} y={indexYDiff} id={id}>
              {seq.split("").map((bp, i) => this.seqTextSpan(bp, i))}
            </text>
          ) : null}
          {compSeq && zoomed && showComplement ? (
            <text {...textProps} y={compYDiff} id={id}>
              {compSeq.split("").map((bp, i) => this.seqTextSpan(bp, i))}
            </text>
          ) : null}
          <TranslationRows
            {...this.props}
            yDiff={translationYDiff}
            seqBlockRef={this}
            firstBase={firstBase}
            lastBase={lastBase}
            findXAndWidth={this.findXAndWidth}
          />
          <Find
            {...this.props}
            filteredRows={filteredSearchRows}
            findXAndWidth={this.findXAndWidth}
            indexYDiff={indexYDiff}
            compYDiff={compYDiff}
            seqBlockRef={this}
            lastBase={lastBase}
            listenerOnly
          />
        </g>
      </svg>
    );
  }
}
