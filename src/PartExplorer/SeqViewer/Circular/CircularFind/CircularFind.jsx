import { isEqual } from "lodash";
import * as React from "react";
import shortid from "shortid";

class CircularFind extends React.Component {
  shouldComponentUpdate = nextProps => {
    const { findState } = this.props;

    return !isEqual(findState, nextProps.findState);
  };

  createHighlight = result => {
    const {
      zoom,
      radius,
      selectionRows,
      lineHeight,
      seqLength,
      getRotation,
      generateArc,
      resizing,
      inputRef,
      findState: { searchIndex }
    } = this.props;
    let { start, end } = result;
    // crosses the zero index
    if (end < start) end += seqLength;

    const resultLength = Math.abs(end - start);

    // const calc the size of the result radii
    let topR = radius + lineHeight; // outer radius

    // adjustment for the top/bottom of the rectangle, based on row number
    const aAdjust = result.row > 0 ? lineHeight / 2 : lineHeight * 1.5;
    let bAdjust = result.row > 0 ? lineHeight / 1.5 : lineHeight * 1.7;

    let bottomR = radius + bAdjust;
    if (zoom.circular > 60 || seqLength < 200) {
      topR += aAdjust;
    } else {
      topR += 1.3 * lineHeight;
      bAdjust = lineHeight * selectionRows;
      bottomR = radius - bAdjust / 4;
    }

    const findPath = generateArc({
      innerRadius: bottomR,
      outerRadius: topR,
      length: resultLength,
      largeArc: resultLength > seqLength / 2,
      sweepFWD: true
    });

    const fill =
      result.index === searchIndex
        ? "rgba(255, 165, 7, 0.5)"
        : "rgba(255, 251, 7, 0.5)";

    const resultStyle = {
      stroke: "black",
      strokeWidth: 0.8,
      fill: fill,
      shapeRendering: resizing ? "optimizeSpeed" : "auto",
      cursor: "pointer"
    };

    const id = shortid.generate();

    return (
      <path
        d={findPath}
        key={shortid.generate()}
        transform={getRotation(result.start)}
        {...resultStyle}
        id={id}
        ref={inputRef(id, {
          ref: id,
          start: result.start,
          end: result.end,
          type: "FIND"
        })}
      />
    );
  };

  render() {
    const {
      zoom,
      seqLength,
      circularCentralIndex: centralIndex,
      findState: { searchResults }
    } = this.props;
    const threshold =
      seqLength >= 200 ? searchResults.length / seqLength <= 0.01 : true;

    let firstBase = 0;
    let lastBase = seqLength;
    if (zoom.circular > 60) {
      // equation of a line from (0, 4) to (100, seqLength / 10) (zoom, tickCount)
      const tickCount = ((seqLength / 10.0 - 4.0) / 100.0) * zoom.circular + 4;

      // make each increment a multiple of 10 with two sig figs
      const increments = Math.floor(seqLength / tickCount);
      let indexInc = Math.max(+increments.toPrecision(2), 10);
      while (indexInc % 10 !== 0) indexInc += 1;

      firstBase = centralIndex - indexInc * 5;
      lastBase = centralIndex + indexInc * 5;
      if (centralIndex < seqLength / 2) {
        firstBase += seqLength;
        lastBase += seqLength;
      }
    }
    return searchResults.length ? (
      <g id="circular-find-results">
        {searchResults.map(s => {
          const hideRender =
            s.start < firstBase && s.start > lastBase - seqLength;
          if (zoom.circular > 60 && hideRender) return null;
          if (zoom.circular < 60 && !threshold) return null;
          return this.createHighlight(s, threshold);
        })}
      </g>
    ) : null;
  }
}

export default CircularFind;
