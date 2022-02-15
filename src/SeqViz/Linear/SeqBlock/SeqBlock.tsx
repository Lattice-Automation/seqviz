import * as React from "react";

import Annotations from "./Annotations";
import CutSiteRow from "./CutSites";
import Find from "./Find";
import IndexRow from "./Index";
import Primers from "./Primers";
import Selection from "./Selection";
import TranslationRows from "./Translations";

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
export default class SeqBlock extends React.PureComponent {
  static defaultProps = {};

  componentWillUnmount = () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onUnmount' does not exist on type 'Reado... Remove this comment to see the full error message
    const { onUnmount, id } = this.props;
    onUnmount(id);
  };

  /**
   * @typedef {Object} SeqBlockPosition
   * @property {Number}     x              [the x positioning, from left...]
   * @property {Number}     width          [the width of the passed element]
   * @property {Number}     charWidth      [the width of each character in the element]
   */

  /**
   * findXAndWidth
   *
   * a helper method that's used in several of the child components to figure
   * out how far from the left the element is and how wide it should be
   *
   * @param  {Number} firstIndex [the first index of the annotation/ORF/cutSite etc]
   * @param  {Number} lastIndex  [last index/basepair of the element]
   * @return {SeqBlockPosition}  [the position information of the given element]
   */
  findXAndWidth = (firstIndex = 0, lastIndex = 0) => {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fullSeq' does not exist on type 'Readonl... Remove this comment to see the full error message
      fullSeq: { length: seqLength },
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstBase' does not exist on type 'Reado... Remove this comment to see the full error message
      firstBase,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'bpsPerBlock' does not exist on type 'Rea... Remove this comment to see the full error message
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
  seqTextSpan = (bp, i) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
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
  bpColorLookup = (bp, i) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'bpColors' does not exist on type 'Readon... Remove this comment to see the full error message
    const { bpColors, firstBase } = this.props;

    const color =
      bpColors[bp] || bpColors[bp.toUpperCase()] || bpColors[bp.toLowerCase()] || bpColors[i + firstBase] || null;

    return color;
  };

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
      seq,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'compSeq' does not exist on type 'Readonl... Remove this comment to see the full error message
      compSeq,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fullSeq' does not exist on type 'Readonl... Remove this comment to see the full error message
      fullSeq,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'annotationRows' does not exist on type '... Remove this comment to see the full error message
      annotationRows,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'forwardPrimerRows' does not exist on typ... Remove this comment to see the full error message
      forwardPrimerRows,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'reversePrimerRows' does not exist on typ... Remove this comment to see the full error message
      reversePrimerRows,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'cutSiteRows' does not exist on type 'Rea... Remove this comment to see the full error message
      cutSiteRows,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'searchRows' does not exist on type 'Read... Remove this comment to see the full error message
      searchRows,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'translations' does not exist on type 'Re... Remove this comment to see the full error message
      translations,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'blockHeight' does not exist on type 'Rea... Remove this comment to see the full error message
      blockHeight,

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'showIndex' does not exist on type 'Reado... Remove this comment to see the full error message
      showIndex,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'showComplement' does not exist on type '... Remove this comment to see the full error message
      showComplement,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'showPrimers' does not exist on type 'Rea... Remove this comment to see the full error message
      showPrimers,

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
      selection,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seqFontSize' does not exist on type 'Rea... Remove this comment to see the full error message
      seqFontSize,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstBase' does not exist on type 'Reado... Remove this comment to see the full error message
      firstBase,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'lineHeight' does not exist on type 'Read... Remove this comment to see the full error message
      lineHeight,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'elementHeight' does not exist on type 'R... Remove this comment to see the full error message
      elementHeight,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mouseEvent' does not exist on type 'Read... Remove this comment to see the full error message
      mouseEvent,

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'inputRef' does not exist on type 'Readon... Remove this comment to see the full error message
      inputRef,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onUnmount' does not exist on type 'Reado... Remove this comment to see the full error message
      onUnmount,

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'charWidth' does not exist on type 'Reado... Remove this comment to see the full error message
      charWidth,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'zoomed' does not exist on type 'Readonly... Remove this comment to see the full error message
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
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            lastBase={lastBase}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            fullSeq={fullSeq}
            inputRef={inputRef}
            onUnmount={onUnmount}
            selection={selection}
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
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            findXAndWidth={this.findXAndWidth}
            lastBase={lastBase}
            yDiff={annYDiff}
            seqBlockRef={this}
            fullSeq={fullSeq}
          />
          {showPrimers && (
            <Primers
              {...this.props}
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
