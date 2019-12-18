import * as React from "react";

export default class CircularFind extends React.PureComponent {
  createHighlight = result => {
    const {
      radius,
      selectionRows,
      lineHeight,
      seqLength,
      getRotation,
      generateArc,
      inputRef,
      search: { index }
    } = this.props;
    let { start, end } = result;
    // crosses the zero index
    if (end < start) {
      end += seqLength;
    }

    const resultLength = Math.abs(end - start);

    // const calc the size of the result radii
    let topR = radius + lineHeight; // outer radius

    // adjustment for the top/bottom of the rectangle, based on row number
    const aAdjust = result.direction > 0 ? lineHeight / 2 : lineHeight * 1.5;
    let bAdjust = result.direction > 0 ? lineHeight / 1.5 : lineHeight * 1.7;

    let bottomR = radius + bAdjust;
    if (seqLength < 200) {
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
      result.index === index
        ? "rgba(255, 165, 7, 0.5)"
        : "rgba(255, 251, 7, 0.5)";

    const resultStyle = {
      stroke: "black",
      strokeWidth: 0.8,
      fill: fill,
      shapeRendering: "auto",
      cursor: "pointer"
    };

    const id = `${start}${end}${result.direction}${result.start}`;

    return (
      <path
        d={findPath}
        key={id}
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
      seqLength,
      search: { results }
    } = this.props;
    const threshold =
      seqLength >= 200 ? results.length / seqLength <= 0.01 : true;

    let firstBase = 0;
    let lastBase = seqLength;
    return results.length ? (
      <g className="la-vz-circular-find-results">
        {results.map(s => {
          const hideRender =
            s.start < firstBase && s.start > lastBase - seqLength;
          if (hideRender) return null;
          if (!threshold) return null;
          return this.createHighlight(s, threshold);
        })}
      </g>
    ) : null;
  }
}
