import * as React from "react";

import { Coor, InputRefFuncType } from "../../elements";
import { SelectionContext } from "../handlers/selection";

interface CircularSelectionProps {
  center: Coor;
  findCoor: (index: number, radius: number, rotate?: boolean) => Coor;
  generateArc: (args: {
    arrowFWD?: boolean;
    arrowREV?: boolean;
    innerRadius: number;
    largeArc: boolean;
    length: number;
    offset?: number;
    outerRadius: number;
    // see svg.arc large-arc-flag
    sweepFWD?: boolean;
  }) => string;
  getRotation: (index: number) => string;
  inputRef: InputRefFuncType;
  lineHeight: number;
  onUnmount: unknown;
  radius: number;
  rotateCoor: (coor: Coor, degrees: number) => Coor;
  seq: string;
  seqLength: number;
  totalRows: number;
}

/**
 * renders the selection range of the plasmid viewer
 * consists of three parts (during an active selection):
 * 		left sidebar, right sidebar and the middle selection region
 *
 * if nothing is selected, it should just be the single cursor
 * without a middle highlighted region
 */
export default class CircularSelection extends React.PureComponent<CircularSelectionProps> {
  static contextType = SelectionContext;

  render() {
    const { findCoor, generateArc, getRotation, lineHeight, radius, seq, seqLength, totalRows } = this.props;
    const { clockwise, end, ref, start } = this.context;

    // calculate the length of the current selection region
    let selLength = 0;
    // start and end is the same, and something has been selected
    if (start === end && ref === "ALL") {
      selLength = seqLength;
    } else if (start > end) {
      selLength = clockwise !== false ? Math.abs(end - start + seqLength) : -Math.abs(start - end);
    } else if (start < end) {
      selLength = clockwise !== false ? Math.abs(end - start) : -Math.abs(start - end + seqLength);
    }

    // for all cases when the entire circle is selected
    if (Math.abs(selLength) === seqLength) {
      const adjust = selLength > 0 ? -0.1 : 0.1;
      selLength += adjust; // can't make an arc from a full circle
    }

    // const calc the size of the selection radii
    let topR = radius + lineHeight; // outer radius
    if (seq.length < 200) {
      topR += 2 * lineHeight;
    }
    const bAdjust = lineHeight * totalRows; // adjust bottom radius
    let bottomR = radius - bAdjust; // inner radius

    if (bottomR < 0 || topR < 0) {
      bottomR = 0;
      topR = radius;
    }

    // find start and stop coordinates to created edges
    const lineTop = findCoor(0, topR);
    const lineBottom = findCoor(0, bottomR);
    const edgePath = `M ${lineBottom.x} ${lineBottom.y}
			L ${lineTop.x} ${lineTop.y}`;

    // !== false is needed because it can be undefined
    const sFlagF = clockwise !== false || ref === "ALL" ? true : false; // sweep flag of first arc

    let lArc = false;
    if (clockwise !== false && selLength > seqLength / 2) {
      lArc = true;
    } else if (clockwise === false && Math.abs(selLength) > seqLength / 2) {
      lArc = true;
    }

    const selectPath = generateArc({
      innerRadius: bottomR,
      largeArc: lArc,
      length: selLength,
      outerRadius: topR,
      sweepFWD: sFlagF,
    });

    // this should be very thin when the selection range starts and ends at same point
    let edgeStrokeWidth = 2;
    if (start === end) {
      edgeStrokeWidth = 1;
    }

    const edgeStyle = {
      fill: "transparent",
      shapeRendering: "auto",
      stroke: "black",
      strokeWidth: edgeStrokeWidth,
    };
    const selectStyle = {
      fill: "#DEF6FF",
      shapeRendering: "auto",
      stroke: "none",
    };

    return (
      <g className="la-vz-circular-selection">
        {selLength && <path d={selectPath} transform={getRotation(start)} {...selectStyle} />}
        <path d={edgePath} transform={getRotation(start)} {...edgeStyle} />
        {selLength && <path d={edgePath} transform={getRotation(end)} {...edgeStyle} />}
      </g>
    );
  }
}
