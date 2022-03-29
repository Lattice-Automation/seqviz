import * as React from "react";
import { calcGC, calcTm } from "../../utils/sequence";

export interface SeqVizSelection {
  name: string;
  type: string;
  seq: string;
  gc: number;
  tm: number;
  start: number;
  end: number;
  length: number;
  clockwise: boolean;
  direction?: number;
  color?: string;
  ref: null | string;
}

/** Initial/default selection */
export const defaultSelection = {
  ref: null,
  name: "",
  seq: "",
  gc: 0,
  tm: 0,
  type: "",
  start: 0,
  end: 0,
  length: 0,
  clockwise: true,
};

/** Default context object */
export const SelectionContext = React.createContext(defaultSelection);
SelectionContext.displayName = "SelectionContext";

interface MouseEventType {
  type: string;
  clientX: number;
  clientY: number;
  currentTarget: {
    id: string;
    getBoundingClientRect: () => {
      left: number;
      top: number;
      bottom: number;
      right: number;
    };
  };
  target: {
    id: string;
  };
  shiftKey: unknown;
}

/**
 * an HOC dedicated to handling range selection for the viewer
 *
 * since range selection is needed for the eventRouter, this is
 * the higher of the two HOCs
 *
 */
const withSelectionHandler = (WrappedComp: React.ComponentType<any>) =>
  class extends React.Component {
    static displayName = `SelectionHandler`;

    /** Only state is the selection range */
    state = { ...defaultSelection };

    previousBase: null | number = null; // previous base cursor is over, used in circular drag select

    forward = null; // directionality of drag (true if clockwise), used in circular drag select

    fullSelectionLength = 0; // full selection length, used in circular drag select

    dragEvent = false; // is the user currently dragging across the surface of the seqViewer? this is tracked on SeqBlocks in particular (onMouseOver), used in circular drag select

    selectionStarted = false; // is there a selection already, used for shift-click catch up

    shiftSelection = false; // was the last selection action a shift click, used for shift-click catch up

    lastClick = Date.now(); // unix time of the last click (awful attempt at detecting double clicks)

    /**
     * a map between the id of child elements and their associated SelectRanges
     */
    idToRange = new Map();

    componentDidMount = () => {
      document.addEventListener("mouseup", this.stopDrag);
    };

    componentWillUnmount = () => {
      document.removeEventListener("mouseup", this.stopDrag);
    };

    /** Stop the current drag event from happening */
    stopDrag = () => {
      this.dragEvent = false;
    };

    /**
     * Called at start of drag to make sure checkers are reset to default state
     */
    resetCircleDragVars = (start: null | number) => {
      this.previousBase = start;
      this.forward = null;
      this.fullSelectionLength = 0;
      this.dragEvent = true; // start a drag event
    };

    /**
     * a ref callback for mapping the id of child to its SelectRange
     * it stores the id of all elements
     **/
    inputRef = (ref: unknown, selectRange: object) => {
      this.idToRange.set(ref, { ref, ...selectRange });
    };

    /**
     * remove the id of the passed element from the list of tracked refs
     
     */
    removeMountedBlock = (ref: unknown) => {
      this.idToRange.delete(ref);
    };

    /**
     * mouseEvent
     *
     * the selected child element is something that is known by reference.
     * update its SeqBlock's range (or any others affected) with the newly
     * active range
     *
     */
    mouseEvent = (e: MouseEventType) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'Circular' does not exist on type 'Readon... Remove this comment to see the full error message
      const { Circular, Linear } = this.props;

      // should not be updating selection since it's not a drag event time
      if ((e.type === "mousemove" || e.type === "mouseup") && !this.dragEvent) {
        return;
      }

      // storing this to figure out if it was a double click
      const msSinceLastClick = Date.now() - this.lastClick;

      let knownRange = this.dragEvent
        ? this.idToRange.get(e.currentTarget.id) // only look for SeqBlocks
        : this.idToRange.get(e.target.id) || this.idToRange.get(e.currentTarget.id); // elements and SeqBlocks
      if (!knownRange) {
        return; // there isn't a known range with the id of the element
      }

      const { start, end, direction, element } = knownRange;
      switch (knownRange.type) {
        case "ANNOTATION":
        case "PRIMER":
        case "FIND":
        case "TRANSLATION":
        case "ENZYME": {
          if (!Linear) {
            // if an element was clicked on the circular viewer, scroll the linear
            // viewer so the element starts on the first SeqBlock
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'setCentralIndex' does not exist on type ... Remove this comment to see the full error message
            this.props.setCentralIndex("linear", start);
          }

          // Annotation or find selection range
          const clockwise = direction ? direction === 1 : true;
          const selectionStart = clockwise ? start : end;
          const selectionEnd = clockwise ? end : start;

          this.setSelection({
            ...element,
            ...knownRange,
            start: selectionStart,
            end: selectionEnd,
            clockwise: clockwise,
          });

          this.dragEvent = false;
          this.lastClick = Date.now();
          break;
        }
        case "AMINOACID": {
          // Annotation or find selection range
          const clockwise = direction ? direction === 1 : true;
          let selectionStart = clockwise ? start : end;
          let selectionEnd = clockwise ? end : start;

          // if they double clicked, select the whole translation
          // https://en.wikipedia.org/wiki/Double-click#Speed_and_timing
          if (msSinceLastClick < 500) {
            knownRange = knownRange.parent;
            selectionStart = clockwise ? knownRange.start : knownRange.end;
            selectionEnd = clockwise ? knownRange.end : knownRange.start;
          }

          this.setSelection({
            ...element,
            ...knownRange,
            start: selectionStart,
            end: selectionEnd,
            clockwise: clockwise,
          });

          this.dragEvent = false;
          this.lastClick = Date.now();
          break;
        }
        case "SEQ": {
          if (Linear) {
            this.linearSeqEvent(e, knownRange);
          } else if (Circular) {
            this.circularSeqEvent(e);
          }
          break;
        }
        default:
      }
    };

    /**
     * Handle a sequence selection on a linear viewer
     */
    linearSeqEvent = (e: MouseEventType, knownRange: { start: number; end: number }) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
      const { selection } = this.props;

      const currBase = this.calculateBaseLinear(e, knownRange);
      const clockwiseDrag = selection.start !== null && currBase >= selection.start;

      if (e.type === "mousedown" && currBase !== null) {
        // this is the start of a drag event
        this.setSelection({
          ...defaultSelection, // clears other meta
          start: e.shiftKey ? selection.start : currBase,
          end: currBase,
          clockwise: clockwiseDrag,
        });
        this.dragEvent = true;
      } else if (this.dragEvent && currBase !== null) {
        // continue a drag event that's currently happening
        this.setSelection({
          ...defaultSelection, // clears other meta
          start: selection.start,
          end: currBase,
          clockwise: clockwiseDrag,
        });
      }
    };

    /**
     * Handle a sequence selection event on the circular viewer
     */
    circularSeqEvent = (e: MouseEventType) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
      const { seq, selection, start, currRef } = this.props;
      let { end, clockwise } = selection;

      const currBase = this.calculateBaseCircular(e);
      let ref = currRef;
      const seqLength = seq.length;

      if (e.type === "mousedown") {
        const selStart = e.shiftKey ? start : currBase;
        const lookahead = e.shiftKey
          ? this.calcSelectionLength(selStart, currBase, false)
          : this.calcSelectionLength(selStart, currBase, true); // check clockwise selection length
        this.selectionStarted = lookahead > 0; // update check for whether there is a prior selection
        this.resetCircleDragVars(selStart); // begin drag event

        this.setSelection({
          ...defaultSelection,
          start: selStart,
          end: currBase,
          ref: "",
          clockwise: clockwise,
        });
      } else if (e.type === "mousemove" && this.dragEvent && currBase && currBase !== this.previousBase) {
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        const increased = currBase > this.previousBase; // bases increased
        const changeThreshold = seqLength * 0.9; // threshold for unrealistic change by mouse movement
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        const change = Math.abs(this.previousBase - currBase); // index change from this mouse movement
        const crossedZero = change > changeThreshold; // zero was crossed if base jumped more than changeThreshold
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'boolean' is not assignable to type 'null'.
        this.forward = increased ? !crossedZero : crossedZero; // bases increased XOR crossed zero
        const lengthChange = crossedZero ? seqLength - change : change; // the change at the point where we cross zero has to be normalized by seqLength
        let sameDirectionMove =
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
          this.forward === this.props.selection.clockwise || this.props.selection.clockwise === null; // moving in same direction as start of drag or start of drag

        if (sameDirectionMove) {
          this.fullSelectionLength += lengthChange;
        } else {
          this.fullSelectionLength -= lengthChange;
        }

        this.previousBase = currBase; // done comparing with previous base, update previous base
        if (this.fullSelectionLength < seqLength * 0.01 && !this.shiftSelection) {
          clockwise = this.forward; // near selection start so selection direction is up for grabs
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
          const check = this.calcSelectionLength(this.props.selection.start, currBase, this.forward); // check actual current selection length
          if (this.fullSelectionLength < 0) {
            this.fullSelectionLength = check; // This is to correct for errors when dragging too fast
          }
          if (check > this.fullSelectionLength) {
            clockwise = !this.forward; // the actual selection length being greater than additive selection length means we have come back to start and want to go in opposite direction
          }
          end = currBase;
          ref = "";
        }
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        sameDirectionMove = this.forward === this.props.selection.clockwise; // recalculate this in case we've switched selection directionality

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        const check = this.calcSelectionLength(this.props.selection.start, currBase, this.props.selection.clockwise); // check the selection length, this is agnostic to the ALL reference and will always calculate from where you cursor is to the start of selection

        if (this.selectionStarted && this.shiftSelection && check > this.fullSelectionLength) {
          this.fullSelectionLength = check; // shift select catch up
        }

        const sameDirectionDrag = this.dragEvent && sameDirectionMove; // there is an ongoing drag in the same direction as the direction the selection started in
        const fullSelection = currRef === "ALL"; // selection is full sequence
        const hitFullSelection = !fullSelection && this.fullSelectionLength >= seqLength; // selection became full sequence
        if (sameDirectionDrag && hitFullSelection) {
          ref = "ALL"; // intial set of ALL selection on selection full sequence
          end = start;
        } else if (fullSelection) {
          // this ensures that backtracking doesn't require making up to your overshoot forward circles
          this.fullSelectionLength = seqLength + (this.fullSelectionLength % seqLength);
          ref = "ALL";

          if (
            !sameDirectionDrag && // changed direction
            check === this.fullSelectionLength - seqLength && // back tracking
            check > seqLength * 0.9 // passed selection start
          ) {
            end = currBase; // start decreasing selection size due to backtracking
            ref = "";
            this.fullSelectionLength = this.fullSelectionLength - seqLength; // reset calculated additive selection length to normal now that we are not at ALL length
          }
        } else {
          end = currBase; // nothing special just update the selection
          ref = "";
        }
        this.shiftSelection = false;

        this.setSelection({
          ...defaultSelection,
          start: start,
          end: end,
          ref: ref,
          clockwise: clockwise,
        });
      }
    };

    /**
     * in a linear sequence viewer, given the bounding box of a component, the basepairs
     * by SeqBlock and the position of the mouse event, find the current base
     *
     
     
     
     */
    calculateBaseLinear = (e: MouseEventType, knownRange: { start: number; end: number }) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      const { size, bpsPerBlock } = this.props;

      const adjustedWidth = size.width; // 28 accounts for 10px padding on linear scroller and 8px scroller gutter
      const block = e.currentTarget.getBoundingClientRect();
      const distFromLeft: number = e.clientX - block.left;
      const percFromLeft = distFromLeft / adjustedWidth;
      const bpsFromLeft = Math.round(percFromLeft * bpsPerBlock);

      const currBase = Math.min(knownRange.start + bpsFromLeft, knownRange.end);

      return currBase;
    };

    /**
     * in a circular plasmid viewer, given the center of the viewer, and position of the
     * mouse event, find the currently hovered or clicked basepair
     *
       
       
     */
    calculateBaseCircular = (e: MouseEventType) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'center' does not exist on type 'Readonly... Remove this comment to see the full error message
      const { center, centralIndex, seq, yDiff } = this.props;

      if (!center) return 0;

      const block = e.currentTarget.getBoundingClientRect();

      // position on the plasmid viewer
      const distFromLeft = e.clientX - block.left;
      const distFromTop = e.clientY - block.top;

      // position relative to center
      const x = distFromLeft - center.x;
      const y = distFromTop - (center.y + yDiff);

      const riseToRun = y / x;
      const posInRads = Math.atan(riseToRun);
      let posInDeg = posInRads * (180 / Math.PI) + 90; // convert and shift to vertical is 0
      if (x < 0) {
        posInDeg += 180; // left half of the viewer
      }
      const posInPerc = posInDeg / 360; // position as a percentage

      let currBase = Math.round(seq.length * posInPerc); // account for rotation of the viewer
      currBase += centralIndex;
      if (currBase > seq.length) {
        currBase -= seq.length;
      }
      return currBase;
    };

    /**
     * Update the selection in state. Only update the specified
     * properties of the selection that should be updated.
     */
    setSelection = (newSelection: SeqVizSelection) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'setSelection' does not exist on type 'Re... Remove this comment to see the full error message
      const { setSelection } = this.props;

      if (
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        newSelection.start === this.props.selection.start &&
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        newSelection.end === this.props.selection.end &&
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        newSelection.ref === this.props.selection.ref
      ) {
        debugger;
      }

      const { clockwise, start, end, ref, type, element, name }: any = {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        ...this.props.selection,
        ...newSelection,
      };

      const length = this.calcSelectionLength(start, end, clockwise);
      const seq = this.getSelectedSequence(start, end, clockwise);
      const gc = calcGC(seq);
      const tm = calcTm(seq);

      const selection = {
        name,
        ref,
        seq,
        gc,
        tm,
        type,
        start,
        end,
        length,
        clockwise,
        element,
      };

      setSelection(selection);
    };

    /**
     * Return the string subsequence from the range' start to end
     */
    getSelectedSequence = (start: number, end: number, clock: number) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
      const { seq } = this.props;
      if (end < start && !clock) {
        return seq.substring(end, start);
      }
      if (end > start && !clock) {
        return seq.substring(end, seq.length) + seq.substring(0, start);
      }
      if (end > start && clock) {
        return seq.substring(start, end);
      }
      if (end < start && clock) {
        return seq.substring(start, seq.length) + seq.substring(0, end);
      }
      return "";
    };

    /**
     * Check what the length of the selection is in circle drag select
     */
    calcSelectionLength = (start: number, base: number, clock: boolean | null) => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
      const { seq } = this.props;
      if (base < start && !clock) {
        return start - base;
      }
      if (base > start && !clock) {
        return start + (seq.length - base);
      }
      if (base > start && clock) {
        return base - start;
      }
      if (base < start && clock) {
        return seq.length - start + base;
      }
      return 0;
    };

    render() {
      return (
        <WrappedComp
          {...this.props}
          inputRef={this.inputRef}
          mouseEvent={this.mouseEvent}
          onUnmount={this.removeMountedBlock}
        />
      );
    }
  };

export default (WrappedComp: React.ComponentType<any>) => withSelectionHandler(WrappedComp);
