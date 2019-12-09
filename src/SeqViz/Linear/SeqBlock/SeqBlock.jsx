import * as React from "react";

import Annotations from "./Annotations/Annotations";
import IndexRow from "./Index/Index";
import LinearFind from "./LinearFind/LinearFind";
import Selection from "./Selection/Selection";
import CutSiteRow from "./CutSites/CutSites";
import Primers from "./Primers/Primers";
import TranslationRows from "./Translations/Translations";

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
      fullSeq: { length: seqLength },
      firstBase,
      size,
      bpsPerBlock
    } = this.props;

    const lastBase = Math.min(firstBase + bpsPerBlock, seqLength);
    const multiBlock = seqLength >= bpsPerBlock;
    // 28 accounts for 10px padding on linear scroller and 8px scroller gutter
    let widthMinusPadding = multiBlock ? size.width - 28 : size.width;

    // find the distance from the left to start
    let x = 0;
    if (firstIndex >= firstBase) {
      x = ((firstIndex - firstBase) / bpsPerBlock) * widthMinusPadding;
      x = Math.max(x, 0) || 0;
    }

    // find the width for the current element
    let width = widthMinusPadding;
    if (firstIndex === lastIndex) {
      // it starts on the last bp
      width = 0;
    } else if (firstIndex >= firstBase || lastIndex < lastBase) {
      // it starts or ends in this SeqBlock
      const start = Math.max(firstIndex, firstBase);
      const end = Math.min(lastIndex, lastBase);

      width = widthMinusPadding * ((end - start) / bpsPerBlock);
      width = Math.abs(width) || 0;
    } else if (firstBase + bpsPerBlock > seqLength && multiBlock) {
      // it's an element in the last SeqBlock, that doesn't span the whole width
      width = widthMinusPadding * ((seqLength % bpsPerBlock) / bpsPerBlock);
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
    const { id, charWidth } = this.props;

    const color = this.bpColorLookup(bp);

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
  bpColorLookup = bp => {
    const { bpColors } = this.props;

    const color =
      bpColors[bp] ||
      bpColors[bp.toUpperCase()] ||
      bpColors[bp.toLowerCase()] ||
      null;

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
      currSearchIndex,
      blockHeight,

      showIndex,
      showComplement,
      showAnnotations,
      showPrimers,

      seqSelection,
      seqFontSize,
      firstBase,
      bpsPerBlock,
      size,
      lineHeight,
      elementHeight,
      mouseEvent,

      inputRef,
      id,
      onUnmount,
      resizing,

      charWidth,
      zoomed
    } = this.props;

    const adjustedWidth =
      seq.length >= bpsPerBlock ? size.width - 28 : size.width; // 28 accounts for 10px padding on linear scroller and 8px scroller gutter
    if (!size.width || !size.height) return null;

    const svgProps = {
      display: "block",
      height: blockHeight,
      width: adjustedWidth
    };
    const textProps = {
      dominantBaseline: "middle",
      fontSize: seqFontSize,
      lengthAdjust: "spacing",
      textAnchor: "start",
      textLength: adjustedWidth,
      textRendering: resizing ? "optimizeSpeed" : "optimizeLegibility"
    };

    const lastBase = firstBase + seq.length;
    const seqRange = {
      ref: id,
      start: firstBase,
      end: lastBase,
      type: "SEQ",
      element: this
    };

    // height and yDiff of forward primers (above sequence)
    const forwardPrimerYDiff = 0;
    const forwardPrimerHeight =
      showPrimers && forwardPrimerRows.length
        ? elementHeight * 3 * forwardPrimerRows.length
        : 0;

    // height and yDiff of cut sites
    const cutSiteYDiff =
      zoomed && cutSiteRows.length
        ? elementHeight / 2 + forwardPrimerHeight
        : forwardPrimerHeight; // spacing for cutSite names
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
      showPrimers && reversePrimerRows.length
        ? elementHeight * 3 * reversePrimerRows.length
        : 0;

    // height and yDiff of translations
    let translationYDiff = reversePrimerYDiff + reversePrimerHeight;
    const translationHeight = elementHeight * translations.length;
    if (translations.length) {
      translationYDiff += 0.25 * elementHeight;
    }

    // height and yDiff of annotations
    const annYDiff = translationYDiff + translationHeight;
    const annHeight = showAnnotations
      ? elementHeight * annotationRows.length
      : 0;

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
    let selectEdgeHeight = showIndex ? selectHeight + lineHeight : selectHeight;

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

    const filteredSearchRows = showComplement
      ? searchRows
      : searchRows.filter(search => search.row === 0);

    return (
      <svg
        {...svgProps}
        className="la-vz-seq-block"
        id={id}
        ref={inputRef(id, seqRange)}
        onMouseDown={mouseEvent}
        onMouseUp={mouseEvent}
        onMouseMove={mouseEvent}
        cursor="text"
      >
        <g transform="translate(0, 10)">
          <Selection.Block
            seqSelection={seqSelection}
            selectHeight={selectHeight}
            findXAndWidth={this.findXAndWidth}
            inputRef={inputRef}
            onUnmount={onUnmount}
            firstBase={firstBase}
            lastBase={lastBase}
            fullSeq={fullSeq}
          />
          {searchRows.length > 0 && (
            <LinearFind
              {...this.props}
              filteredRows={filteredSearchRows}
              findXAndWidth={this.findXAndWidth}
              indexYDiff={indexYDiff}
              compYDiff={compYDiff}
              currSearchIndex={currSearchIndex}
              seqBlockRef={this}
              lastBase={lastBase}
            />
          )}
          {showAnnotations && (
            <Annotations
              {...this.props}
              findXAndWidth={this.findXAndWidth}
              lastBase={lastBase}
              yDiff={annYDiff}
              seqBlockRef={this}
              fullSeq={fullSeq}
            />
          )}
          {showPrimers && (
            <Primers
              {...this.props}
              findXAndWidth={this.findXAndWidth}
              firstBase={firstBase}
              lastBase={lastBase}
              yDiff={forwardPrimerYDiff}
              direction="FORWARD"
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
              direction="REVERSE"
              seqBlockRef={this}
              fullSeq={fullSeq}
              charWidth={charWidth}
              fontSize={seqFontSize}
              zoomed={zoomed}
            />
          )}
          <Selection.Edges
            lastBase={lastBase}
            findXAndWidth={this.findXAndWidth}
            firstBase={firstBase}
            fullSeq={fullSeq}
            inputRef={inputRef}
            onUnmount={onUnmount}
            seqSelection={seqSelection}
            selectEdgeHeight={selectEdgeHeight}
          />
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
            <CutSiteRow
              {...this.props}
              findXAndWidth={this.findXAndWidth}
              lastBase={lastBase}
              yDiff={cutSiteYDiff}
            />
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
          {filteredSearchRows.length ? (
            <LinearFind
              {...this.props}
              filteredRows={filteredSearchRows}
              findXAndWidth={this.findXAndWidth}
              indexYDiff={indexYDiff}
              compYDiff={compYDiff}
              currSearchIndex={currSearchIndex}
              seqBlockRef={this}
              lastBase={lastBase}
              listenerOnly
            />
          ) : null}
        </g>
      </svg>
    );
  }
}
