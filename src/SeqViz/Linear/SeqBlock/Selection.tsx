import * as React from "react";

import randomid from "../../../utils/randomid";
import { InputRefFuncType } from "../../common";
import { SelectionContext, SeqVizSelection } from "../../handlers/selection";
import { FindXAndWidthType } from "./SeqBlock";

interface EdgesProps {
  findXAndWidth: FindXAndWidthType;
  selectEdgeHeight: number;
  firstBase: number;
  lastBase: number;
  fullSeq: string;
}

/**
 * Edges on the side of selections of the Selection Viewer
 *
 * Only shown at the selection's start and end, not intermediate blocks
 * (if there are intermediate blocks)
 */
class Edges extends React.PureComponent<EdgesProps> {
  static contextType = SelectionContext;

  id = randomid();

  render() {
    const { findXAndWidth, selectEdgeHeight, firstBase, lastBase, fullSeq } = this.props;
    const { ref, start, end, clockwise } = this.context;

    let startEdge: number | null = null;
    let lastEdge: number | null = null;

    if (clockwise) {
      // clockwise, ie forward drag event
      // the start or end edges are within this block
      if (start >= firstBase && start < lastBase) startEdge = start;
      if (end > firstBase && end <= lastBase) lastEdge = end;
    } else {
      // counterclockwise, ie reverse drag event
      if (start > firstBase && start <= lastBase) startEdge = start;
      if (end >= firstBase && end < lastBase) lastEdge = end;
    }

    // for cmd-a case
    if (ref === "ALL" || (start === 0 && end === fullSeq.length - 1)) {
      startEdge = null;
      lastEdge = null;
    }

    // the end of the selection edges are not in this SeqBlock and do not need to be rendered
    if (startEdge === null && lastEdge === null) {
      return null;
    }
    if (startEdge === null) {
      startEdge = lastEdge;
      lastEdge = null;
    }
    let { x, width } = findXAndWidth(startEdge, lastEdge);

    // if drag event in counter clockwise direction and both of the edges are
    // within this range (if reverse but not both in one range, it'll be fine)
    if (clockwise === false && startEdge !== null && lastEdge !== null) {
      ({ x, width } = findXAndWidth(lastEdge, startEdge));
    }

    // the x position of the second edge
    let secondEdgeX = x + width;
    if (startEdge !== null && lastEdge !== null) {
      if ((start > end && clockwise === true) || (end > start && clockwise === false)) {
        secondEdgeX = x - width;
      } // in this scenario, the ending edge of the selection range is before the start
    }

    // for when it starts on the first bp of the next SeqBlock
    if (start === end && start === lastBase) {
      return null;
    }

    /* handling case where cursor is rendered on each line */
    if (!startEdge && !lastEdge) {
      return null;
    }

    // inlining style in the SVG for speed sake
    const rect = {
      y: "-10",
      style: {
        fill: "black",
        width: start === end ? 1 : 2,
      },
      shapeRendering: "crispEdges",
      height: selectEdgeHeight,
    };

    return (
      <g className="la-vz-linear-sel-edges">
        {startEdge ? <rect {...rect} x={start === end ? x - 1 : x - 2} /> : null}
        {lastEdge ? <rect {...rect} x={start === end ? secondEdgeX - 1 : secondEdgeX - 2} /> : null}
      </g>
    );
  }
}

interface BlockProps {
  findXAndWidth: FindXAndWidthType;
  selectHeight: number;
  firstBase: number;
  lastBase: number;
  fullSeq: string;
  selection: SeqVizSelection;
  inputRef: InputRefFuncType;
  onUnmount: (a: string) => void;
}

class Block extends React.PureComponent<BlockProps> {
  static contextType = SelectionContext;

  id = randomid();

  render() {
    const { findXAndWidth, selectHeight, firstBase, lastBase, fullSeq } = this.props;
    const { clockwise, ref } = this.context;
    let { start, end } = this.context;

    // there's no need to render a selection block (rect) if just one point has been selected
    if (start === end && ref !== "ALL") return null;
    if (ref === "ALL" || (start === 0 && end === fullSeq.length)) {
      // it's not "ALL" or some element's id
      start = 0;
      end = 0;
    }

    let x: number | null = null;
    let width: number | null = null;
    let secondBlock: JSX.Element | null = null;
    if (clockwise && end > start) {
      // does not cross the zero index, FWD direction
      if (start <= lastBase && end > firstBase) {
        ({ x, width } = findXAndWidth(Math.max(firstBase, start), Math.min(lastBase, end)));
      }
    } else if (clockwise && start > end) {
      // crosses the zero index in FWD direction
      if (!(start > lastBase && end < firstBase)) {
        // is this seq block relevant
        if (start < lastBase && end > firstBase) {
          // the selection range both starts and ends in this seqblock, but wraps
          // all the way around the rest of the plasmid
          // ex: https://user-images.githubusercontent.com/13923102/34791431-f56df23a-f612-11e7-94b4-e302ede155a0.png
          const { x: secBlockX, width: secBlockWidth } = findXAndWidth(start, lastBase);
          secondBlock = (
            <rect
              x={secBlockX}
              y={-10}
              height={selectHeight + 5}
              width={secBlockWidth}
              className="la-vz-linear-sel-block"
            />
          );
          ({ x, width } = findXAndWidth(firstBase, end));
        } else {
          ({ x, width } = findXAndWidth(
            start > lastBase ? firstBase : Math.max(firstBase, start),
            end < firstBase ? lastBase : Math.min(lastBase, end)
          ));
        }
      }
    } else if (!clockwise && start > end) {
      // does not cross zero index but is in reverse direction
      if (end <= lastBase && start >= firstBase) {
        ({ x, width } = findXAndWidth(Math.max(firstBase, end), Math.min(lastBase, start)));
      }
    } else if (!clockwise && end > start) {
      // crosses zero index and is in reverse direction
      if (start > firstBase || end < lastBase) {
        if (start > firstBase && start < lastBase && end > firstBase) {
          // the selection range both starts and ends in this seqblock, but wraps
          // all the way around the rest of the plasmid
          // ex: https://user-images.githubusercontent.com/13923102/34791431-f56df23a-f612-11e7-94b4-e302ede155a0.png
          const { x: secBlockX, width: secBlockWidth } = findXAndWidth(end, lastBase);
          secondBlock = (
            <rect
              x={secBlockX}
              y={-10}
              height={selectHeight + 5}
              width={secBlockWidth}
              className="la-vz-linear-sel-block"
              shapeRendering="auto"
            />
          );
          ({ x, width } = findXAndWidth(firstBase, start));
        } else {
          ({ x, width } = findXAndWidth(start < firstBase ? end : firstBase, end > lastBase ? start : lastBase));
        }
      }
    }

    // sreflect
    if (ref === "ALL" || start === end) {
      ({ x, width } = findXAndWidth(Math.max(firstBase, 0), Math.min(lastBase, fullSeq.length + 1)));
    }

    // nothing was set for this selection block
    if (!x && !width) {
      return null;
    }

    return (
      <>
        <rect
          className="la-vz-linear-sel-block"
          x={x || undefined}
          y={-10}
          height={selectHeight + 5}
          width={width || undefined}
          shapeRendering="auto"
        />
        {secondBlock}
      </>
    );
  }
}

export default { Edges, Block };
