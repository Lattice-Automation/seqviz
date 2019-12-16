import { isEqual } from "lodash";
import * as React from "react";

import { calcGC, calcTm } from "../../utils/sequence";

/**
 * an HOC dedicated to handling range selection for the LinearSeq viewer
 *
 * since range selection is needed for all other functions that affect the
 * underlying sequence data, this is a highest level HOC
 *
 * @param  {React.Component} WrappedComp
 */
const withSelectionHandler = WrappedComp =>
  class extends React.Component {
    previousBase = null; // previous base cursor is over, used in circular drag select

    forward = null; // directionality of drag (true if clockwise), used in circular drag select

    fullSelectionLength = 0; // full selection length, used in circular drag select

    dragEvent = false; // is the user currently dragging across the surface of the seqViewer? this is tracked on SeqBlocks in particular (onMouseOver), used in circular drag select

    selectionStarted = false; // is there a selection already, used for shift-click catch up

    shiftSelection = false; // was the last selection action a shift click, used for shift-click catch up

    static displayName = `SelectionHandler(${WrappedComp.displayName ||
      "Component"})`;

    /**
     * used to handle situations where the mouse movement is too fast to register
     * correct discrete values
     */
    timestamp = null;

    lastMouseX = null;

    lastMouseY = null;

    workspace = document.getElementById("la-vz-part-explorer");
    /**
     * an attempt an event rate limiter, since setting the selection range
     * in the cache is async (was having a problem getting two sets before the first was complete)
     */
    allowSetSelection = true;

    /**
     * a map between the id of child elements and their associated SelectRanges
     * @type {Object.<string, SelectRange>}
     */
    elementIdsToRanges = new Map();

    /**
     * an array of the elements that currently have a noted selection
     * @type {Array.string}
     */
    mountedBlocks = new Set();

    /**
     * Double click event handler helpers
     * Required because React's onDoubleClick hook doesn't work in conjunction
     * with other mouse event handlers on the same component
     */
    _delayedClick = null;

    clickedOnce = null;

    componentDidMount = () => {
      document.addEventListener("mouseup", this.stopDrag);
    };

    componentWillUnmount = () => {
      document.removeEventListener("mouseup", this.stopDrag);
    };

    /**
     * return the SelectRange, defined above, of the id of the element
     * whos id is passed. This was written for a function in the event router
     * so it would be able to tell what type of context menu to build
     *
     * @param {string} elemId   the id of the element being queried against
     * @return {SelectRange}   the seelction range of the element selected against
     */
    getElement = elemId => this.elementIdsToRanges.get(elemId);

    // stop the current drag event from happening
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
     * Called to check what the length of the selection is in circle drag select
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

    getSelectionSequence = (start, end, clock) => {
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
     * add the newly mounted block, by id, to the list
     * @param  {string} ref  id of the newly mounted SeqBlock
     */
    addMountedBlock = ref => {
      this.mountedBlocks.add(ref);
    };

    /**
     * remove the id of the passed element from the list of tracked refs
     * @param  {string} ref  if of the element to drop from list
     */
    removeMountedBlock = ref => {
      this.mountedBlocks.delete(ref);
      this.elementIdsToRanges.delete(ref);
    };

    /**
     * a ref callback for setting adding the id of child to its SelectRange
     * it stores the id of all select elements, which will be updated when the select range
     * changes (as opposed to updating the whole tree)
     * @param  {string} ref          		element id, as it appears in DOM
     * @param  {SelectRange} selectRange   	def above
     */
    mapIdToRange = (ref, selectRange) => {
      if (selectRange.type === "SELECT") {
        this.mountedBlocks.add(ref);
      }
      this.elementIdsToRanges.set(ref, { ref, ...selectRange });
    };

    /** set the selection for the current part */
    setSequenceSelection = selectRange => {
      const {
        seqSelection,
        setPartState,
        onSelection,
        findState: { searchIndex }
      } = this.props;

      const {
        clockwise = true,
        start = 0,
        end = 0,
        ref = "",
        type = "",
        searchIndex: newSearchIndex = null,
        feature
      } = selectRange;

      const selectionLength = this.calcSelectionLength(start, end, clockwise);
      const selectionSequence = this.getSelectionSequence(
        start,
        end,
        clockwise
      );
      const sequence = selectionSequence;
      const GC = calcGC(selectionSequence);
      const Tm = calcTm(selectionSequence);
      const sequenceMeta = { sequence, GC, Tm };
      const selectionMeta = { type, start, end, selectionLength, clockwise };
      const newSelection = {
        ref,
        sequenceMeta,
        selectionMeta,
        feature
      };
      const findStateIndex =
        newSearchIndex === null ? searchIndex : newSearchIndex;
      if (!isEqual(seqSelection, newSelection)) {
        setPartState({
          seqSelection: newSelection,
          findState: { searchIndex: findStateIndex }
        });

        if (this.workspace) {
          this.workspace.focus();
        }
      }

      onSelection(newSelection);
    };

    /**
     * updateSelectionWithknownRange
     *
     * the selected child element is something that is known by reference.
     * update its SeqBlock's range (or any others affected) with the newly
     * active range
     *
     * @param {React.SyntheticEvent} e  		the mouseEvent
     */
    updateSelectionWithknownRange = e => {
      const {
        seq,
        annotations,
        Linear,
        findState: { searchResults },
        setPartState
      } = this.props;
      if (!this.allowSetSelection) return;
      // should not be updating selection since it's not a drag event time
      if ((e.type === "mousemove" || e.type === "mouseup") && !this.dragEvent) {
        return;
      }

      const knownRange = this.dragEvent
        ? this.elementIdsToRanges.get(e.currentTarget.id) // only look for SeqBlocks
        : this.elementIdsToRanges.get(e.target.id) || // elements and SeqBlocks
          this.elementIdsToRanges.get(e.currentTarget.id);
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
          const feature = knownRange.ref
            ? annotations.find(annotation => annotation.id === knownRange.ref)
            : null;
          if (!Linear) {
            setPartState({
              linearCentralIndex: selectionStart
            });
          }
          this.setSequenceSelection({
            ...knownRange,
            start: selectionStart,
            end: selectionEnd,
            clockwise: clockwise,
            searchIndex: newSearchIndex,
            feature: feature
          });
          this.dragEvent = false;
          break;
        }
        case "SEQ": {
          // SeqBlock or anything on Circular (not already described above)
          let currBase = null;
          const {
            seqSelection: { ref: currRef, selectionMeta: currSelection }
          } = this.props;
          if (Linear) {
            currBase = this.calculateBaseLinear(e, knownRange);
            const clockwiseDrag =
              currSelection &&
              currSelection.start !== null &&
              currBase >= currSelection.start;
            if (e.type === "mousedown" && currBase !== null) {
              // this is the start of a drag event
              this.setSequenceSelection({
                start: e.shiftKey ? currSelection.start : currBase,
                end: currBase,
                clockwise: clockwiseDrag
              });
              this.dragEvent = true;
            } else if (this.dragEvent && currBase !== null) {
              // continue a drag event that's currently happening
              this.setSequenceSelection({
                start: currSelection.start,
                end: currBase,
                clockwise: clockwiseDrag
              });
            }
          } else if (!Linear) {
            let {
              start: newStart,
              end: newEnd,
              clockwise: newClockwise
            } = currSelection;
            let newRef = currRef;
            const seqLength = seq.length;
            currBase = this.calculateBaseCircular(e); // get the base currently hovered over
            if (e.type === "mousedown") {
              if (e.shiftKey) {
                this.shiftSelection = true;
              }
              const selStart = e.shiftKey ? currSelection.start : currBase;
              let forward = currSelection.clockwise;
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
              typeof currBase === "number" // this is necessary because 0 is falsey
            ) {
              if (currBase !== this.previousBase) {
                const increased = currBase > this.previousBase; // bases increased
                const changeThreshold = seqLength * 0.9; // threshold for unrealistic change by mouse movement
                const change = Math.abs(this.previousBase - currBase); // index change from this mouse movement
                const crossedZero = change > changeThreshold; // zero was crossed if base jumped more than changeThreshold
                this.forward = increased ? !crossedZero : crossedZero; // bases increased XOR crossed zero
                const lengthChange = crossedZero ? seqLength - change : change; // the change at the point where we cross zero has to be normalized by seqLength
                let sameDirectionMove =
                  this.forward === currSelection.clockwise ||
                  currSelection.clockwise === null; // moving in same direction as start of drag or start of drag
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
                    currSelection.start,
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
                sameDirectionMove = this.forward === currSelection.clockwise; // recalculate this in case we've switched selection directionality
                const check = this.calcSelectionLength(
                  currSelection.start,
                  currBase,
                  currSelection.clockwise
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
                  !alreadyFullSelection &&
                  this.fullSelectionLength >= seqLength; // selection became full sequence
                if (sameDirectionDrag && hitFullSelection) {
                  newRef = "ALL"; // intial set of ALL selection on selection full sequence
                  newEnd = currSelection.start;
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
            }
            this.setSequenceSelection({
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

    resetClicked = () => {
      this.clickedOnce = null;
    };

    render() {
      return (
        <WrappedComp
          {...this.props}
          getElement={this.getElement}
          mouseEvent={this.updateSelectionWithknownRange}
          inputRef={this.mapIdToRange}
          onUnmount={this.removeMountedBlock}
        />
      );
    }
  };

export default WrappedComp => withSelectionHandler(WrappedComp);
