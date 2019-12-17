import * as React from "react";

import { calcGC, calcTm } from "../../utils/sequence";

/** Initial/default selection */
const defaultSelection = {
  ref: null,
  seq: "",
  gc: 0,
  tm: 0,
  type: "",
  start: 0,
  end: 0,
  length: 0,
  clockwise: true,
  element: null
};

/** Default context object */
export const SelectionContext = React.createContext(defaultSelection);

/**
 * an HOC dedicated to handling range selection for the viewer
 *
 * since range selection is needed for the eventRouter, this is
 * the higher of the two HOCs
 *
 * @param  {React.Component} WrappedComp
 */
const withSelectionHandler = WrappedComp =>
  class extends React.Component {
    static displayName = `SelectionHandler`;

    /** Only state is the selection range */
    state = { ...defaultSelection };

    previousBase = null; // previous base cursor is over, used in circular drag select

    forward = null; // directionality of drag (true if clockwise), used in circular drag select

    fullSelectionLength = 0; // full selection length, used in circular drag select

    dragEvent = false; // is the user currently dragging across the surface of the seqViewer? this is tracked on SeqBlocks in particular (onMouseOver), used in circular drag select

    selectionStarted = false; // is there a selection already, used for shift-click catch up

    shiftSelection = false; // was the last selection action a shift click, used for shift-click catch up

    /**
     * a map between the id of child elements and their associated SelectRanges
     * @type {Object.<string, SelectRange>}
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
    resetCircleDragVars = start => {
      this.previousBase = start;
      this.forward = null;
      this.fullSelectionLength = 0;
      this.dragEvent = true; // start a drag event
    };

    /**
     * in a linear sequence viewer, given the bounding box of a component, the basepairs
     * by SeqBlock and the position of the mouse event, find the current base
     *
     * @param {SyntheticMouseEvent} e      the click of onMouseOver event
     * @param {SelectRange} knownRange     a range of a known element
     * @return {Number}		   the current base being clicked or hovered
     */
    calculateBaseLinear = (e, knownRange) => {
      const { size, bpsPerBlock } = this.props;

      const adjustedWidth = size.width; // 28 accounts for 10px padding on linear scroller and 8px scroller gutter
      const block = e.currentTarget.getBoundingClientRect();
      const distFromLeft = e.clientX - block.left;
      const percFromLeft = distFromLeft / adjustedWidth;
      const bpsFromLeft = Math.round(percFromLeft * bpsPerBlock);

      const currBase = knownRange.start + bpsFromLeft;

      return currBase;
    };

    /**
     * in a circular plasmid viewer, given the center of the viewer, and position of the
     * mouse event, find the currently hovered or clicked basepair
     *
     * @param {SyntheticMouseEvent} e    the click of onMouseMove event
     * @return {Number}   				 the current base being clicked or hovered
     */
    calculateBaseCircular = e => {
      const {
        center,
        seq,
        yDiff,
        circularCentralIndex: centralIndex
      } = this.props;
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
      if (x < 0) posInDeg += 180; // left half of the viewer
      const posInPerc = posInDeg / 360; // position as a percentage

      let currBase = Math.round(seq.length * posInPerc); // account for rotation of the viewer
      currBase += centralIndex;
      if (currBase > seq.length) currBase -= seq.length;
      return currBase;
    };

    /**
     * a ref callback for mapping the id of child to its SelectRange
     * it stores the id of all elements
     * @param  {string} ref element's id, as it appears in DOM
     * @param  {SelectRange} selectRange
     */
    inputRef = (ref, selectRange) => {
      this.idToRange.set(ref, { ref, ...selectRange });
    };

    /**
     * remove the id of the passed element from the list of tracked refs
     * @param  {string} ref  if of the element to drop from list
     */
    removeMountedBlock = ref => {
      this.idToRange.delete(ref);
    };

    /**
     * mouseEvent
     *
     * the selected child element is something that is known by reference.
     * update its SeqBlock's range (or any others affected) with the newly
     * active range
     *
     * @param {React.SyntheticEvent} e  		the mouseEvent
     */
    mouseEvent = e => {
      const {
        seq,
        annotations,
        Linear,
        findState: { searchResults },
        setPartState
      } = this.props;

      // should not be updating selection since it's not a drag event time
      if ((e.type === "mousemove" || e.type === "mouseup") && !this.dragEvent) {
        return;
      }

      const knownRange = this.dragEvent
        ? this.idToRange.get(e.currentTarget.id) // only look for SeqBlocks
        : this.idToRange.get(e.target.id) || // elements and SeqBlocks
          this.idToRange.get(e.currentTarget.id);
      if (!knownRange) return; // there isn't a known range with the id of the element
      const { start, end, direction } = knownRange;
      switch (knownRange.type) {
        case "ANNOTATION":
        case "PRIMER":
        case "FIND":
        case "TRANSLATION":
        case "ENZYME": {
          // Annotation or find selection range
          const clockwise = !(knownRange.direction && direction === -1);
          const selectionStart = clockwise ? start : end;
          const selectionEnd = clockwise ? end : start;
          const newSearchIndex = searchResults.findIndex(
            res => res.start === selectionStart
          );

          const element = knownRange.ref
            ? annotations.find(annotation => annotation.id === knownRange.ref)
            : null;

          if (!Linear) {
            // if an element was clicked on the circular viewer, scroll the linear
            // viewer so the element starts on the first SeqBlock
            setPartState({
              linearCentralIndex: selectionStart
            });
          }

          this.setSelection({
            ...knownRange,
            start: selectionStart,
            end: selectionEnd,
            clockwise: clockwise,
            searchIndex: newSearchIndex,
            element: element
          });
          this.dragEvent = false;
          break;
        }
        case "SEQ": {
          // SeqBlock or anything on Circular (not already described above)
          let currBase = null;
          const { ref: currRef } = this.state;

          if (Linear) {
            currBase = this.calculateBaseLinear(e, knownRange);
            const clockwiseDrag =
              this.state.start !== null && currBase >= this.state.start;

            if (e.type === "mousedown" && currBase !== null) {
              // this is the start of a drag event
              this.setSelection({
                start: e.shiftKey ? this.state.start : currBase,
                end: currBase,
                clockwise: clockwiseDrag
              });
              this.dragEvent = true;
            } else if (this.dragEvent && currBase !== null) {
              // continue a drag event that's currently happening
              this.setSelection({
                start: this.state.start,
                end: currBase,
                clockwise: clockwiseDrag
              });
            }
          } else if (!Linear) {
            let {
              start: newStart,
              end: newEnd,
              clockwise: newClockwise
            } = this.state;
            let newRef = currRef;
            const seqLength = seq.length;
            currBase = this.calculateBaseCircular(e); // get the base currently hovered over

            if (e.type === "mousedown") {
              if (e.shiftKey) {
                this.shiftSelection = true;
              }
              const selStart = e.shiftKey ? this.state.start : currBase;
              let forward = this.state.clockwise;
              const lookaheadc = this.calcSelectionLength(
                selStart,
                currBase,
                true
              ); // check clockwise selection length
              if (!this.selectionStarted) {
                const lookaheadcc = this.calcSelectionLength(
                  selStart,
                  currBase,
                  false
                ); // check counterclockwise selection length
                forward = lookaheadc < lookaheadcc; // initial selection direction is whichever creates the smaller selection
              }
              this.selectionStarted = lookaheadc > 0; // update check for whether there is a prior selection
              this.resetCircleDragVars(selStart); // begin drag event
              newStart = selStart;
              newEnd = currBase;
              newClockwise = forward; // default to whatever would create the smaller selection
              newRef = ""; // this is needed to reset selection refs we have from previous selections
            } else if (
              e.type === "mousemove" &&
              this.dragEvent &&
              currBase > 0 &&
              currBase !== this.previousBase
            ) {
              const increased = currBase > this.previousBase; // bases increased
              const changeThreshold = seqLength * 0.9; // threshold for unrealistic change by mouse movement
              const change = Math.abs(this.previousBase - currBase); // index change from this mouse movement
              const crossedZero = change > changeThreshold; // zero was crossed if base jumped more than changeThreshold
              this.forward = increased ? !crossedZero : crossedZero; // bases increased XOR crossed zero
              const lengthChange = crossedZero ? seqLength - change : change; // the change at the point where we cross zero has to be normalized by seqLength
              let sameDirectionMove =
                this.forward === this.state.clockwise ||
                this.state.clockwise === null; // moving in same direction as start of drag or start of drag
              this.fullSelectionLength = sameDirectionMove
                ? this.fullSelectionLength + lengthChange
                : this.fullSelectionLength - lengthChange; // cumulatively keep track of selection length
              this.previousBase = currBase; // done comparing with previous base, update previous base
              if (
                this.fullSelectionLength < seqLength * 0.01 &&
                !this.shiftSelection
              ) {
                let clockwise = this.forward; // near selection start so selection direction is up for grabs
                const check = this.calcSelectionLength(
                  this.state.start,
                  currBase,
                  this.forward
                ); // check actual current selection length
                if (this.fullSelectionLength < 0) {
                  this.fullSelectionLength = check; // This is to correct for errors when dragging too fast
                }
                if (check > this.fullSelectionLength) {
                  clockwise = !this.forward; // the actual selection length being greater than additive selection length means we have come back to start and want to go in opposite direction
                }
                newEnd = currBase;
                newClockwise = clockwise; // this should be the only time we set the selection direction, all other changes in directionality are change in drag direction
                newRef = "";
              }
              sameDirectionMove = this.forward === this.state.clockwise; // recalculate this in case we've switched selection directionality
              const check = this.calcSelectionLength(
                this.state.start,
                currBase,
                this.state.clockwise
              ); // check the selection length, this is agnostic to the ALL reference and will always calculate from where you cursor is to the start of selection
              if (
                this.selectionStarted &&
                this.shiftSelection &&
                check > this.fullSelectionLength
              ) {
                this.fullSelectionLength = check; // shift select catch up
              }
              const sameDirectionDrag = this.dragEvent && sameDirectionMove; // there is an ongoing drag in the same direction as the direction the selection started in
              const alreadyFullSelection = currRef === "ALL"; // selection is full sequence
              const hitFullSelection =
                !alreadyFullSelection && this.fullSelectionLength >= seqLength; // selection became full sequence
              if (sameDirectionDrag && hitFullSelection) {
                newRef = "ALL"; // intial set of ALL selection on selection full sequence
                newEnd = this.state.start;
              } else if (alreadyFullSelection) {
                this.fullSelectionLength =
                  seqLength + (this.fullSelectionLength % seqLength); // this ensures that backtracking doesn't require making up to your overshoot forward circles
                newRef = "ALL";
                if (
                  !sameDirectionDrag && // changed direction
                  check === this.fullSelectionLength - seqLength && // back tracking
                  check > seqLength * 0.9 // passed selection start
                ) {
                  newEnd = currBase; // start decreasing selection size due to backtracking
                  newRef = "";
                  this.fullSelectionLength =
                    this.fullSelectionLength - seqLength; // reset calculated additive selection length to normal now that we are not at ALL length
                }
              } else {
                newEnd = currBase; // nothing special just update the selection
                newRef = "";
              }
              this.shiftSelection = false;
            }

            this.setSelection({
              start: newStart,
              end: newEnd,
              ref: newRef,
              clockwise: newClockwise
            });
          }
          break;
        }
        default:
      }
    };

    /**
     * Update the selection in state. Only update the specifid
     * properties of the selection that should be updated.
     */
    setSelection = newSelection => {
      const { onSelection } = this.props;

      if (
        newSelection.start === this.state.start &&
        newSelection.end === this.state.end &&
        newSelection.ref === this.state.ref
      ) {
        return;
      }

      const { clockwise, start, end, ref, type, element } = {
        ...this.state,
        ...newSelection
      };

      const length = this.calcSelectionLength(start, end, clockwise);
      const seq = this.getSelectedSequence(start, end, clockwise);
      const gc = calcGC(seq);
      const tm = calcTm(seq);

      const selection = {
        ref,
        seq,
        gc,
        tm,
        type,
        start,
        end,
        length,
        clockwise,
        element
      };

      this.setState(selection);
      onSelection(selection);
    };

    /**
     * Return the string subsequence from the range' start to end
     */
    getSelectedSequence = (start, end, clock) => {
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
    calcSelectionLength = (start, base, clock) => {
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
        <SelectionContext.Provider value={this.state}>
          <WrappedComp
            {...this.props}
            inputRef={this.inputRef}
            mouseEvent={this.mouseEvent}
            onUnmount={this.removeMountedBlock}
            selection={this.state}
            setSelection={this.setSelection}
          />
        </SelectionContext.Provider>
      );
    }
  };

export default WrappedComp => withSelectionHandler(WrappedComp);
