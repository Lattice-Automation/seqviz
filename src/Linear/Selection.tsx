import * as React from "react";

import { InputRefFunc } from "../elements";
import { Selection, SelectionContext } from "../handlers/selection";
import randomid from "../randomid";
import { FindXAndWidthType } from "./SeqBlock";

interface EdgesProps {
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  lastBase: number;
  selectEdgeHeight: number;
  zoom: number;
}

/**
 * Edges on the side of selections of the Selection Viewer
 *
 * Only shown at the selection's start and end, not intermediate blocks (if there are intermediate blocks)
 */
class Edges extends React.PureComponent<EdgesProps> {
  static contextType = SelectionContext;
  declare context: React.ContextType<typeof SelectionContext>;

  id = randomid();

  render() {
    const { findXAndWidth, firstBase, fullSeq, lastBase, selectEdgeHeight, zoom } = this.props;
    const { clockwise, end, ref, start } = this.context;

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
    let { width, x } = findXAndWidth(startEdge, lastEdge);

    // if drag event in counter clockwise direction and both of the edges are
    // within this range (if reverse but not both in one range, it'll be fine)
    if (clockwise === false && startEdge !== null && lastEdge !== null) {
      ({ width, x } = findXAndWidth(lastEdge, startEdge));
    }

    // the x position of the second edge
    let secondEdgeX = x + width;
    if (startEdge !== null && lastEdge !== null) {
      // in this scenario, the ending edge of the selection range is before the start
      if ((start > end && clockwise === true) || (end > start && clockwise === false)) {
        secondEdgeX = x - width;
      }
    }

    // for when it starts on the first bp of the next SeqBlock
    if (start === end && start === lastBase) {
      return null;
    }

    /* handling case where cursor is rendered on each line */
    if (startEdge === null && lastEdge === null) {
      return null;
    }

    // inlining style in the SVG for speed sake
    const wide = start !== end && zoom > 60;
    const rect = {
      height: selectEdgeHeight,
      shapeRendering: "crispEdges",
      style: {
        fill: "black",
        // below 40 zoom the chars are so small we may as well not widen the selection edges.
        width: wide ? 2 : 1,
      },
      y: -5,
    };

    return (
      <g className="la-vz-linear-sel-edges">
        {startEdge !== null && <rect {...rect} x={x} />}
        {lastEdge !== null && <rect {...rect} x={secondEdgeX} />}
      </g>
    );
  }
}

interface BlockProps {
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  inputRef: InputRefFunc;
  lastBase: number;
  onUnmount: (a: string) => void;
  selectHeight: number;
  selection: Selection;
}

/**
 * A Block is a single range of selected bases. Usually shown as a light blue box. Can span a single or multiple blocks.
 */
class Block extends React.PureComponent<BlockProps> {
  static contextType = SelectionContext;
  static context: React.ContextType<typeof SelectionContext>;
  declare context: React.ContextType<typeof SelectionContext>;

  id = randomid();

  render() {
    const { findXAndWidth, firstBase, fullSeq, lastBase, selectHeight } = this.props;
    const { clockwise, ref } = this.context;
    let { end, start } = this.context;

    // there's no need to render a selection block (rect) if just one point has been selected
    if (start === end && ref !== "ALL") return null;
    if (ref === "ALL" || (start === 0 && end === fullSeq.length)) {
      // it's not "ALL" or some element's id
      start = 0;
      end = 0;
    }

    // props shared between all 3 possible components.
    const blockProps = {
      className: "la-vz-selection",
      height: selectHeight,
      shapeRendering: "auto",
      y: -5,
    };

    let x: number | null = null;
    let width: number | null = null;
    let secondBlock: JSX.Element | null = null;
    if (clockwise && end > start) {
      // does not cross the zero index, FWD direction
      if (start <= lastBase && end > firstBase) {
        ({ width, x } = findXAndWidth(Math.max(firstBase, start), Math.min(lastBase, end)));
      }
    } else if (clockwise && start > end) {
      // crosses the zero index in FWD direction
      if (!(start > lastBase && end < firstBase)) {
        // is this seq block relevant
        if (start < lastBase && end > firstBase) {
          // the selection range both starts and ends in this seqblock, but wraps
          // all the way around the rest of the plasmid
          // ex: https://user-images.githubusercontent.com/13923102/34791431-f56df23a-f612-11e7-94b4-e302ede155a0.png
          const { width: secBlockWidth, x: secBlockX } = findXAndWidth(start, lastBase);
          secondBlock = <rect {...blockProps} width={secBlockWidth} x={secBlockX} />;
          ({ width, x } = findXAndWidth(firstBase, end));
        } else {
          ({ width, x } = findXAndWidth(
            start > lastBase ? firstBase : Math.max(firstBase, start),
            end < firstBase ? lastBase : Math.min(lastBase, end)
          ));
        }
      }
    } else if (!clockwise && start > end) {
      // does not cross zero index but is in reverse direction
      if (end <= lastBase && start >= firstBase) {
        ({ width, x } = findXAndWidth(Math.max(firstBase, end), Math.min(lastBase, start)));
      }
    } else if (!clockwise && end > start) {
      // crosses zero index and is in reverse direction
      if (start > firstBase || end < lastBase) {
        if (start > firstBase && start < lastBase && end > firstBase) {
          // the selection range both starts and ends in this seqblock, but wraps
          // all the way around the rest of the plasmid
          // ex: https://user-images.githubusercontent.com/13923102/34791431-f56df23a-f612-11e7-94b4-e302ede155a0.png
          const { width: secBlockWidth, x: secBlockX } = findXAndWidth(end, lastBase);
          secondBlock = <rect {...blockProps} width={secBlockWidth} x={secBlockX} />;
          ({ width, x } = findXAndWidth(firstBase, start));
        } else {
          ({ width, x } = findXAndWidth(start < firstBase ? end : firstBase, end > lastBase ? start : lastBase));
        }
      }
    }

    // sreflect
    if (ref === "ALL" || start === end) {
      ({ width, x } = findXAndWidth(Math.max(firstBase, 0), Math.min(lastBase, fullSeq.length + 1)));
    }

    // nothing was set for this selection block
    if (!x && !width) {
      return null;
    }

    return (
      <>
        <rect {...blockProps} width={width ? width + 1 : undefined} x={x || undefined} />
        {secondBlock}
      </>
    );
  }
}

export default { Block, Edges };
