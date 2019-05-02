import * as React from "react";
import Annotations from "./Annotations/Annotations";
import IndexRow from "./Index/Index";
import LinearFind from "./LinearFind/LinearFind";
import Selection from "./Selection/Selection";

/**
 * SeqBlock
 *
 * Comprised of:
 * 	   IndexRow (the x axis basepair index)
 * 	   AnnotationRow (annotations)
 * 		 PrimerRow (primers)
 * 	   Selection (cursor selection range)
 * 	   ORFrames (open reading frames)
 * 	   CutSites
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
      seq: { length: seqLength }
    } = this.props;
    const lastBase = firstBase + seqLength;

    // find the distance from the left to start
    let x = 0;
    if (firstIndex >= firstBase) {
      x = ((firstIndex - firstBase) / seqLength) * size.width;
      x = Math.max(x, 0) || 0;
    }

    // find the width for the current annotation
    let { width } = size;
    if (firstIndex === lastIndex) {
      width = 0;
    } else if (firstIndex > firstBase || lastIndex < lastBase) {
      width =
        (Math.min(lastIndex, lastBase) - Math.max(firstIndex, firstBase)) /
        seqLength;
      width *= size.width;
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
      searchRows,
      currSearchIndex,
      blockHeight,

      Axis,

      seqFontSize,
      firstBase,
      size,
      lineHeight,
      elementHeight,
      mouseEvent,

      inputRef,
      id,
      onUnmount,
      resizing,

      zoomed,

      showSearch,
      seqSelection,
      findSelection,
      circularCentralIndex,
      linearCentralIndex,
      setPartState
    } = this.props;

    const partState = {
      showSearch,
      seqSelection,
      findSelection,
      circularCentralIndex,
      linearCentralIndex,
      setPartState
    };

    if (!size.width || !size.height) return null;

    const svgProps = {
      display: "block",
      height: blockHeight,
      width: size.width
    };
    const textProps = {
      dominantBaseline: "middle",
      fontSize: seqFontSize,
      lengthAdjust: "spacing",
      textAnchor: "start",
      textLength: size.width,
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

    // height and yDiff of the sequence strand
    const indexYDiff = 0;
    const indexHeight = zoomed ? lineHeight : 0; // bases not shown at < 10 zoom

    // height and yDiff of the complement strand
    const compYDiff = indexYDiff + indexHeight;
    const compHeight = zoomed ? lineHeight : 0;

    // height and yDiff of annotations
    const annYDiff = compYDiff + compHeight;
    const annHeight = elementHeight * annotationRows.length;

    // calc the height necessary for the sequence selection
    let selectHeight = indexHeight + compHeight + annHeight;
    let selectEdgeHeight = Axis ? selectHeight + lineHeight : selectHeight;

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
    return (
      <svg
        {...svgProps}
        className="SeqBlock"
        id={id}
        ref={inputRef(id, seqRange)}
        onMouseDown={mouseEvent}
        onMouseUp={mouseEvent}
        onMouseMove={mouseEvent}
        cursor="text"
      >
        <g transform="translate(0, 10)">
          <Selection.Block
            selectHeight={selectHeight}
            findXAndWidth={this.findXAndWidth}
            inputRef={inputRef}
            onUnmount={onUnmount}
            firstBase={firstBase}
            lastBase={lastBase}
            fullSeq={fullSeq}
            {...partState}
          />
          {zoomed ? (
            <text {...textProps} y={indexYDiff} id={id}>
              {seq}
            </text>
          ) : null}
          {compSeq && zoomed ? (
            <text {...textProps} y={compYDiff} id={id}>
              {compSeq}
            </text>
          ) : null}
          <Annotations
            {...this.props}
            findXAndWidth={this.findXAndWidth}
            lastBase={lastBase}
            yDiff={annYDiff}
            seqBlockRef={this}
            fullSeq={fullSeq}
          />
          {searchRows.length ? (
            <LinearFind
              {...this.props}
              findXAndWidth={this.findXAndWidth}
              indexYDiff={indexYDiff}
              compYDiff={compYDiff}
              currSearchIndex={currSearchIndex}
              seqBlockRef={this}
              lastBase={lastBase}
            />
          ) : null}
          <Selection.Edges
            selectEdgeHeight={selectEdgeHeight}
            findXAndWidth={this.findXAndWidth}
            inputRef={inputRef}
            onUnmount={onUnmount}
            firstBase={firstBase}
            lastBase={lastBase}
            fullSeq={fullSeq}
            {...partState}
          />
          <IndexRow
            {...this.props}
            transform={`translate(0, ${indexRowYDiff})`}
            findXAndWidth={this.findXAndWidth}
          />
        </g>
      </svg>
    );
  }
}
