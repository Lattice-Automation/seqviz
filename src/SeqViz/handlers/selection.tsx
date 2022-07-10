import * as React from "react";

import { Element } from "../../elements";
import { calcGC, calcTm } from "../../utils/sequence";
import { WithEventsProps } from "./events";

type SelectionTypeEnum = "ANNOTATION" | "PRIMER" | "FIND" | "TRANSLATION" | "ENZYME" | "SEQ" | "AMINOACID" | "";

/* SeqVizSelection is a selection holding all meta about the viewer(s) active selection. */
export interface SeqVizSelection {
  clockwise: boolean;
  color?: string;
  direction?: number;
  element?: Element;
  end: number;
  gc?: number;
  length?: number;
  name?: string;
  parent?: SeqVizSelection;
  ref?: null | string;
  seq?: string;
  start: number;
  tm?: number;
  type?: SelectionTypeEnum;
}

/** Initial/default selection */
export const defaultSelection: SeqVizSelection = {
  clockwise: true,
  end: 0,
  gc: 0,
  length: 0,
  name: "",
  ref: null,
  seq: "",
  start: 0,
  tm: 0,
  type: "",
};

/** Default context object */
export const SelectionContext = React.createContext(defaultSelection);
SelectionContext.displayName = "SelectionContext";

export type SeqVizMouseEvent = React.MouseEvent & {
  target: { id: string };
};

/* WithSelectionProps are those that the HOC injects into the wrapped component */
export interface WithSelectionProps extends WithEventsProps {
  Circular: boolean;
  Linear: boolean;
  bpsPerBlock?: number;
  centralIndex?: number;
  inputRef: (ref: string, selectRange: SeqVizSelection) => void;
  mouseEvent: (e: any) => void;
  name: string;
  onUnmount: (id: string) => void;
  selection: SeqVizSelection;
  seq: string;
  setCentralIndex?: (viewer: "linear" | "circular", index: number) => void;
  setSelection: (selection: SeqVizSelection) => void;
}

/* SelectionHandlerProps are those required by the HOC */
export interface SelectionHandlerProps {
  Circular: boolean;
  Linear: boolean;
  bpsPerBlock?: number;
  center?: { x: number; y: number };
  centralIndex?: number;
  name: string;
  selection: SeqVizSelection;
  seq: string;
  setCentralIndex?: (viewer: "linear" | "circular", index: number) => void;
  setSelection: (selection: SeqVizSelection) => void;
  size: {
    height: number;
    width: number;
  };
  yDiff?: number;
}

/**
 * The selection HOC wraps viewers with a component that handles sequence selection. Each click, drag, etc, is
 * noted and mapped to a sequence index.
 */
export default <T extends WithSelectionProps>(WrappedComp: React.ComponentType<T>) =>
  class extends React.Component<T & SelectionHandlerProps> {
    static displayName = "SelectionHandler";

    /** Only state is the selection range */
    state = { ...defaultSelection };

    previousBase: null | number = null; // previous base cursor is over, used in circular drag select

    forward: null | boolean = null; // directionality of drag (true if clockwise), used in circular drag select

    fullSelectionLength = 0; // full selection length, used in circular drag select

    dragEvent = false; // is the user currently dragging across the surface of the seqViewer? this is tracked on SeqBlocks in particular (onMouseOver), used in circular drag select

    selectionStarted = false; // is there a selection already, used for shift-click catch up

    shiftSelection = false; // was the last selection action a shift click, used for shift-click catch up

    lastClick = Date.now(); // unix time of the last click (awful attempt at detecting double clicks)

    /**
     * a map between the id of child elements and their associated SelectRanges
     */
    idToRange = new Map<string, SeqVizSelection>();

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
    inputRef = (ref: string, selectRange: SeqVizSelection) => {
      this.idToRange.set(ref, { ref, ...selectRange });
    };

    /**
     * remove the ref by ID.
     */
    removeMountedBlock = (ref: string) => {
      this.idToRange.delete(ref);
    };

    /**
     * mouseEvent
     *
     * the selected child element is something that is known by reference.
     * update its SeqBlock's range (or any others affected) with the newly
     * active range
     */
    mouseEvent = (e: SeqVizMouseEvent) => {
      const { Circular, Linear, setCentralIndex } = this.props;

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

      const { direction, element, end, start } = knownRange;
      switch (knownRange.type) {
        case "ANNOTATION":
        case "PRIMER":
        case "FIND":
        case "TRANSLATION":
        case "ENZYME": {
          if (!Linear && setCentralIndex) {
            // if an element was clicked on the circular viewer, scroll the linear
            // viewer so the element starts on the first SeqBlock
            setCentralIndex("linear", start);
          }
          // Annotation or find selection range
          const clockwise = direction ? direction === 1 : true;
          const selectionStart = clockwise ? start : end;
          const selectionEnd = clockwise ? end : start;

          this.setSelection({
            ...element,
            ...knownRange,
            clockwise: clockwise,
            end: selectionEnd,
            start: selectionStart,
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
          if (msSinceLastClick < 500 && knownRange.parent) {
            knownRange = knownRange.parent;
            selectionStart = clockwise ? knownRange.start : knownRange.end;
            selectionEnd = clockwise ? knownRange.end : knownRange.start;
          }

          this.setSelection({
            ...element,
            ...knownRange,
            clockwise: clockwise,
            end: selectionEnd,
            start: selectionStart,
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
    linearSeqEvent = (e: SeqVizMouseEvent, knownRange: { end: number; start: number }) => {
      const { selection } = this.props;

      const currBase = this.calculateBaseLinear(e, knownRange);
      const clockwiseDrag = selection.start !== null && currBase >= selection.start;

      if (e.type === "mousedown" && currBase !== null) {
        // this is the start of a drag event
        this.setSelection({
          ...defaultSelection,
          clockwise: clockwiseDrag,

          end: currBase,
          // clears other meta
          start: e.shiftKey ? selection.start : currBase,
        });
        this.dragEvent = true;
      } else if (this.dragEvent && currBase !== null) {
        // continue a drag event that's currently happening
        this.setSelection({
          ...defaultSelection,
          clockwise: clockwiseDrag,

          end: currBase,
          // clears other meta
          start: selection.start,
        });
      }
    };

    /**
     * Handle a sequence selection event on the circular viewer
     */
    circularSeqEvent = (e: SeqVizMouseEvent) => {
      const { selection, seq } = this.props;
      const { start } = selection;
      let { clockwise, end } = selection;

      const currBase = this.calculateBaseCircular(e);
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
          clockwise: clockwise,
          end: currBase,
          ref: "",
          start: selStart,
        });
      } else if (
        e.type === "mousemove" &&
        this.dragEvent &&
        currBase &&
        this.previousBase &&
        currBase !== this.previousBase
      ) {
        const increased = currBase > this.previousBase; // bases increased
        const changeThreshold = seqLength * 0.9; // threshold for unrealistic change by mouse movement
        const change = Math.abs(this.previousBase - currBase); // index change from this mouse movement
        const crossedZero = change > changeThreshold; // zero was crossed if base jumped more than changeThreshold
        this.forward = increased ? !crossedZero : crossedZero; // bases increased XOR crossed zero
        const lengthChange = crossedZero ? seqLength - change : change; // the change at the point where we cross zero has to be normalized by seqLength
        let sameDirectionMove =
          this.forward === this.props.selection.clockwise || this.props.selection.clockwise === null; // moving in same direction as start of drag or start of drag

        if (sameDirectionMove) {
          this.fullSelectionLength += lengthChange;
        } else {
          this.fullSelectionLength -= lengthChange;
        }

        this.previousBase = currBase; // done comparing with previous base, update previous base
        if (this.fullSelectionLength < seqLength * 0.01 && !this.shiftSelection) {
          clockwise = this.forward; // near selection start so selection direction is up for grabs
          const check = this.calcSelectionLength(this.props.selection.start, currBase, this.forward); // check actual current selection length
          if (this.fullSelectionLength < 0) {
            this.fullSelectionLength = check; // This is to correct for errors when dragging too fast
          }
          if (check > this.fullSelectionLength) {
            clockwise = !this.forward; // the actual selection length being greater than additive selection length means we have come back to start and want to go in opposite direction
          }
          end = currBase;
        }
        sameDirectionMove = this.forward === this.props.selection.clockwise; // recalculate this in case we've switched selection directionality

        const check = this.calcSelectionLength(this.props.selection.start, currBase, this.props.selection.clockwise); // check the selection length, this is agnostic to the ALL reference and will always calculate from where you cursor is to the start of selection

        if (this.selectionStarted && this.shiftSelection && check > this.fullSelectionLength) {
          this.fullSelectionLength = check; // shift select catch up
        }

        const sameDirectionDrag = this.dragEvent && sameDirectionMove; // there is an ongoing drag in the same direction as the direction the selection started in
        const fullSelection = false; // selection is full sequence
        // TODO: fix const fullSelection = currRef === "ALL"; // selection is full sequence
        const hitFullSelection = !fullSelection && this.fullSelectionLength >= seqLength; // selection became full sequence
        if (sameDirectionDrag && hitFullSelection) {
          end = start;
        } else if (fullSelection) {
          // this ensures that backtracking doesn't require making up to your overshoot forward circles
          this.fullSelectionLength = seqLength + (this.fullSelectionLength % seqLength);

          if (
            !sameDirectionDrag && // changed direction
            check === this.fullSelectionLength - seqLength && // back tracking
            check > seqLength * 0.9 // passed selection start
          ) {
            end = currBase; // start decreasing selection size due to backtracking
            this.fullSelectionLength = this.fullSelectionLength - seqLength; // reset calculated additive selection length to normal now that we are not at ALL length
          }
        } else {
          end = currBase; // nothing special just update the selection
        }
        this.shiftSelection = false;

        this.setSelection({
          ...defaultSelection,
          clockwise: clockwise,
          end: end,
          start: start,
        });
      }
    };

    /**
     * in a linear sequence viewer, given the bounding box of a component, the basepairs
     * by SeqBlock and the position of the mouse event, find the current base
     *
     */
    calculateBaseLinear = (e: SeqVizMouseEvent, knownRange: { end: number; start: number }) => {
      const { bpsPerBlock, size } = this.props;

      const adjustedWidth = size.width; // 28 accounts for 10px padding on linear scroller and 8px scroller gutter
      const block = e.currentTarget.getBoundingClientRect();
      const distFromLeft: number = e.clientX - block.left;
      const percFromLeft = distFromLeft / adjustedWidth;
      const bpsFromLeft = Math.round(percFromLeft * (bpsPerBlock as number));

      const currBase = Math.min(knownRange.start + bpsFromLeft, knownRange.end);

      return currBase;
    };

    /**
     * in a circular plasmid viewer, given the center of the viewer, and position of the
     * mouse event, find the currently hovered or clicked basepair
     */
    calculateBaseCircular = (e: SeqVizMouseEvent) => {
      const { center, centralIndex, seq, yDiff } = this.props;

      if (!center) return 0;

      const block = e.currentTarget.getBoundingClientRect();

      // position on the plasmid viewer
      const distFromLeft = e.clientX - block.left;
      const distFromTop = e.clientY - block.top;

      // position relative to center
      const x = distFromLeft - center.x;
      const y = distFromTop - (center.y + (yDiff as number));

      const riseToRun = y / x;
      const posInRads = Math.atan(riseToRun);
      let posInDeg = posInRads * (180 / Math.PI) + 90; // convert and shift to vertical is 0
      if (x < 0) {
        posInDeg += 180; // left half of the viewer
      }
      const posInPerc = posInDeg / 360; // position as a percentage

      let currBase = Math.round(seq.length * posInPerc); // account for rotation of the viewer
      currBase += centralIndex as number;
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
      const { setSelection } = this.props;
      if (
        newSelection.start === this.props.selection.start &&
        newSelection.end === this.props.selection.end &&
        newSelection.ref === this.props.selection.ref &&
        // to support reclicking the annotation and causing it to fire a la gh issue https://github.com/Lattice-Automation/seqviz/issues/142
        ["SEQ", "AMINOACID", ""].includes(newSelection.type || "")
      ) {
        return;
      }
      const { clockwise, element, end, name, ref, start, type }: any = {
        ...this.props.selection,
        ...newSelection,
      };

      const length = this.calcSelectionLength(start, end, clockwise);
      const seq = this.getSelectedSequence(start, end, clockwise);
      const gc = calcGC(seq);
      const tm = calcTm(seq);

      const selection = {
        clockwise,
        element,
        end,
        gc,
        length,
        name,
        ref,
        seq,
        start,
        tm,
        type,
      };

      setSelection(selection);
    };

    /**
     * Return the string subsequence from the range' start to end
     */
    getSelectedSequence = (start: number, end: number, clock: number) => {
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
      const newProps = {
        ...this.props,
        inputRef: this.inputRef,
        mouseEvent: this.mouseEvent,
        onUnmount: this.removeMountedBlock,
      };

      // @ts-expect-error
      return <WrappedComp {...(newProps as WithSelectionProps)} />;
    }
  };
