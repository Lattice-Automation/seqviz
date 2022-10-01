import * as React from "react";

import { Coor, InputRefFunc } from "../elements";
import { SelectionContext } from "../handlers/selection";
import { GenArcFunc, RENDER_SEQ_LENGTH_CUTOFF } from "./Circular";

interface CircularSelectionProps {
  center: Coor;
  findCoor: (index: number, radius: number, rotate?: boolean) => Coor;
  genArc: GenArcFunc;
  getRotation: (index: number) => string;
  inputRef: InputRefFunc;
  lineHeight: number;
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
export default class Selection extends React.PureComponent<CircularSelectionProps> {
  static contextType = SelectionContext;
  declare context: React.ContextType<typeof SelectionContext>;

  render() {
    const { findCoor, genArc, getRotation, lineHeight, radius, seq, seqLength, totalRows } = this.props;
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
    if (seq.length <= RENDER_SEQ_LENGTH_CUTOFF) {
      topR += 2 * lineHeight + 3;
    }
    const bAdjust = lineHeight * (totalRows - 1); // adjust bottom radius
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

    return (
      <g>
        {selLength && (
          <path
            className="la-vz-selection"
            d={genArc({
              innerRadius: bottomR,
              largeArc: lArc,
              length: selLength,
              outerRadius: topR,
              sweepFWD: sFlagF,
            })}
            shapeRendering="auto"
            stroke="none"
            transform={getRotation(start)}
          />
        )}
        <path className="la-vz-selection-edge" d={edgePath} strokeWidth={1} transform={getRotation(start)} />
        {selLength && (
          <path className="la-vz-selection-edge" d={edgePath} strokeWidth={1} transform={getRotation(end)} />
        )}
      </g>
    );
  }
}
