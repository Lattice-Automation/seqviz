import * as React from "react";
import Annotations from "./Annotations/Annotations";
import IndexRow from "./Index/Index";
import LinearFind from "./LinearFind/LinearFind";
import Selection from "./Selection/Selection";
import CutSiteRow from "./CutSites/CutSites";

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
   * out how far from the left the element is, and how wide it should be
   *
   * @param  {Number} firstIndex [the first index of the annotation/ORF/cutSite etc]
   * @param  {Number} lastIndex  [last index/basepair of the element]
   * @return {SeqBlockPosition}  [the position information of the given element]
   */
  findXAndWidth = (firstIndex = 0, lastIndex = 0) => {
    const {
      firstBase,
      size,
      seq: { length: seqLength },
      bpsPerBlock
    } = this.props;
    const lastBase = firstBase + seqLength;
    const adjustedWidth =
      seqLength >= bpsPerBlock ? size.width - 28 : size.width; // 28 accounts for 10px padding on linear scroller and 8px scroller gutter
    // find the distance from the left to start
    let x = 0;
    if (firstIndex >= firstBase) {
      x = ((firstIndex - firstBase) / seqLength) * adjustedWidth;
      x = Math.max(x, 0) || 0;
    }

    // find the width for the current annotation
    let width = adjustedWidth;
    if (firstIndex === lastIndex) {
      width = 0;
    } else if (firstIndex > firstBase || lastIndex < lastBase) {
      const widthUnit =
        (Math.min(lastIndex, lastBase) - Math.max(firstIndex, firstBase)) /
        seqLength;
      width = adjustedWidth * widthUnit;
      width = Math.abs(width) || 0;
    }
    return { x, width };
  };

  render() {
    const {
      seq,
      compSeq,
      fullSeq,
      annotationRows,
      cutSiteRows,
      searchRows,
      currSearchIndex,
      blockHeight,

      showIndex,
      showComplement,
      showAnnotations,

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

    // height and yDiff of cut sites
    const cutSiteYDiff = zoomed && cutSiteRows.length ? elementHeight / 2 : 0; // spacing for cutSite names
    const cutSiteHeight = zoomed && cutSiteRows.length ? elementHeight : 0;

    // height and yDiff of the sequence strand
    const indexYDiff = cutSiteYDiff + cutSiteHeight;
    const indexHeight = zoomed ? lineHeight : 0; // bases not shown at < 10 zoom

    // height and yDiff of the complement strand
    const compYDiff = indexYDiff + indexHeight;
    const compHeight = zoomed && showComplement ? lineHeight : 0;

    // height and yDiff of annotations
    const annYDiff = compYDiff + compHeight;
    const annHeight = showAnnotations
      ? elementHeight * annotationRows.length
      : 0;

    // calc the height necessary for the sequence selection
    let selectHeight =
      indexHeight + compHeight + annHeight + cutSiteHeight + cutSiteYDiff;
    let selectEdgeHeight = showIndex ? selectHeight + lineHeight : selectHeight;

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
            {...this.props}
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

          <Selection.Edges
            {...this.props}
            selectEdgeHeight={selectEdgeHeight}
            findXAndWidth={this.findXAndWidth}
            inputRef={inputRef}
            onUnmount={onUnmount}
            firstBase={firstBase}
            lastBase={lastBase}
            fullSeq={fullSeq}
          />
          {showIndex && (
            <IndexRow
              {...this.props}
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
              {seq}
            </text>
          ) : null}
          {compSeq && zoomed && showComplement ? (
            <text {...textProps} y={compYDiff} id={id}>
              {compSeq}
            </text>
          ) : null}
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
