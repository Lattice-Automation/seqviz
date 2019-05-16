import * as React from "react";
import shortid from "shortid";

/**
 * renders the selection range of the plasmid viewer
 * consists of three parts (during an active selection):
 * 		left sidebar, right sidebar and the middle selection region
 *
 * if nothing is selected, it should just be the single cursor
 * without a middle highlighted region
 */
class CircularSelection extends React.PureComponent {
  render() {
    const {
      seq,
      zoom,
      radius,
      lineHeight,
      seqLength,
      getRotation,
      findCoor,
      generateArc,
      totalRows,
      seqSelection: { ref, start, end, clockwise }
    } = this.props;

    // calculate the length of the current selection region
    let selLength = 0;
    // start and end is the same, and something has been selected
    if (start === end && ref === "ALL") {
      selLength = seqLength;
    } else if (start > end) {
      selLength =
        clockwise !== false
          ? Math.abs(end - start + seqLength)
          : -Math.abs(start - end);
    } else if (start < end) {
      selLength =
        clockwise !== false
          ? Math.abs(end - start)
          : -Math.abs(start - end + seqLength);
    }

    // for all cases when the entire circle is selected
    if (Math.abs(selLength) === seqLength) {
      const adjust = selLength > 0 ? -0.1 : 0.1;
      selLength += adjust; // can't make an arc from a full circle
    }

    // const calc the size of the selection radii
    let topR = radius + lineHeight; // outer radius
    if (zoom.circular > 60 || seq.length < 200) {
      // at above 60 zoom, two rows of basepairs will be rendered
      topR += 2 * lineHeight;
    }
    const bAdjust = lineHeight * totalRows; // adjust bottom radius
    const bottomR = radius - bAdjust; // inner radius

    // find start and stop coordinates to created edges
    const lineTop = findCoor(0, topR);
    const lineBottom = findCoor(0, bottomR);
    const edgePath = `M ${lineBottom.x} ${lineBottom.y}
			L ${lineTop.x} ${lineTop.y}`;

    // !== false is needed because it can be undefined
    const sFlagF = clockwise !== false || ref === "ALL" ? 1 : 0; // sweep flag of first arc

    let lArc = false;
    if (clockwise !== false && selLength > seqLength / 2) {
      lArc = true;
    } else if (clockwise === false && Math.abs(selLength) > seqLength / 2) {
      lArc = true;
    }

    const selectPath = generateArc({
      innerRadius: bottomR,
      outerRadius: topR,
      length: selLength,
      largeArc: lArc,
      sweepFWD: sFlagF
    });

    // this should be very thin when the selection range starts and ends at same point
    let edgeStrokeWidth = 3;
    if (zoom.circular > 30) {
      edgeStrokeWidth = 4;
    }
    if (start === end) {
      edgeStrokeWidth = 1.5;
    }

    const edgeStyle = {
      fill: "transparent",
      stroke: "black",
      strokeWidth: edgeStrokeWidth,
      shapeRendering: "auto"
    };
    const selectStyle = {
      stroke: "none",
      fill: "#DEF6FF",
      shapeRendering: "auto"
    };

    const firstId = shortid.generate();
    const secondId = shortid.generate();
    const thirdId = shortid.generate();

    return (
      <g id="circular-selection">
        {selLength && (
          <path
            d={selectPath}
            id={secondId}
            transform={getRotation(start)}
            {...selectStyle}
          />
        )}
        <path
          d={edgePath}
          id={firstId}
          transform={getRotation(start)}
          {...edgeStyle}
        />
        {selLength && (
          <path
            d={edgePath}
            id={thirdId}
            transform={getRotation(end)}
            {...edgeStyle}
          />
        )}
      </g>
    );
  }
}

export default CircularSelection;
