import * as React from "react";

import debounce from "../../utils/debounce";
import CentralIndexContext from "./centralIndex";

/**
 * an HOC used one level above the Sequence viewer. It handles the routing of all
 * events, including keypresses, mouse clicks, etc.
 *
 * its other main function is to build the context menu at all times, so that
 * the options available in the context menu are all relevant to whatever has been
 * selected
 *
 */
const withEventRouter = WrappedComp =>
  class WithEventRouter extends React.PureComponent {
    static displayName = `EventRouter`;

    static contextType = CentralIndexContext;

    clickedOnce = null;

    clickedTwice = null;

    /** set the event router reference on this class */
    setEventRouter = eventRouter => {
      this.eventRouter = eventRouter;
    };

    /**
     * action handler for a keyboard keypresses.
     * Mapping logic has been abstracted to keypressMap in ./api/keypressMap.js
     *
     
     */
    handleKeyPress = e => {
      const keyType = this.keypressMap(e);
      if (!keyType) {
        return; // not recognized key
      }
      this.handleSeqInteraction(keyType);
    };

    /**
     * maps a keypress to an interaction (String)
     *
     
     
     * ["All", "Copy", "Up", "Right", "Down", "Left"]
     */
    keypressMap = e => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'copyEvent' does not exist on type 'Reado... Remove this comment to see the full error message
      const { copyEvent } = this.props;

      if (copyEvent(e)) {
        return "Copy";
      }

      const { key, shiftKey } = e;
      switch (key) {
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown":
          return shiftKey ? `Shift${key}` : key;
        default:
          return null;
      }
    };

    /**
     * Respond to any of:
     * 	All: cmd + A, select all
     * 	Copy: cmd + C, copy
     * 	Up, Right, Down, Left: some directional movement of the cursor
     */
    handleSeqInteraction = async type => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
      const { Linear, seq } = this.props;
      const seqLength = seq.length;
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'bpsPerBlock' does not exist on type 'Rea... Remove this comment to see the full error message
      const { bpsPerBlock = Math.max(Math.floor(seqLength / 20), 1) } = this.props;

      switch (type) {
        case "SelectAll": {
          this.selectAllHotkey();
          break;
        }
        case "Copy": {
          this.handleCopy();
          break;
        }
        case "ArrowUp":
        case "ArrowRight":
        case "ArrowDown":
        case "ArrowLeft":
        case "ShiftArrowUp":
        case "ShiftArrowRight":
        case "ShiftArrowDown":
        case "ShiftArrowLeft": {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
          const { selection, setSelection } = this.props;
          const { end, start } = selection;
          if (Linear) {
            let { clockwise } = selection;
            let newPos = end;
            if (type === "ArrowUp" || type === "ShiftArrowUp") {
              // if there are multiple blocks or just one. If one, just inc by one
              if (seqLength / bpsPerBlock > 1) {
                newPos -= bpsPerBlock;
              } else {
                newPos -= 1;
              }
            } else if (type === "ArrowRight" || type === "ShiftArrowRight") {
              newPos += 1;
            } else if (type === "ArrowDown" || type === "ShiftArrowDown") {
              // if there are multiple blocks or just one. If one, just inc by one
              if (seqLength / bpsPerBlock > 1) {
                newPos += bpsPerBlock;
              } else {
                newPos += 1;
              }
            } else if (type === "ArrowLeft" || type === "ShiftArrowLeft") {
              newPos -= 1;
            }

            if (newPos <= -1) {
              newPos = seqLength + newPos;
            }
            if (newPos >= seqLength + 1) {
              newPos -= seqLength;
            }
            const selLength = Math.abs(start - end);
            clockwise =
              selLength === 0
                ? type === "ArrowRight" ||
                  type === "ShiftArrowRight" ||
                  type === "ArrowDown" ||
                  type === "ShiftArrowDown"
                : clockwise;
            if (newPos !== start && !type.startsWith("Shift")) {
              setSelection({
                clockwise: true,
                end: newPos,
                ref: "",
                start: newPos,
              });
            } else if (type.startsWith("Shift")) {
              setSelection({
                clockwise: clockwise,
                end: newPos,
                ref: "",
                start: start,
              });
            }
            break;
          }
          break;
        }
        default: {
          break;
        }
      }
    };

    /**
     * Copy the current sequence selection to the user's clipboard
     */
    handleCopy = () => {
      const {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
        selection: { end, ref, start },
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        seq,
      } = this.props;

      const formerFocus = document.activeElement;
      const tempNode = document.createElement("textarea");
      if (ref === "ALL") {
        tempNode.innerText = seq;
      } else {
        tempNode.innerText = seq.substring(start, end);
      }
      if (document.body) {
        document.body.appendChild(tempNode);
      }
      tempNode.select();
      document.execCommand("copy");
      tempNode.remove();
      if (formerFocus) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'focus' does not exist on type 'Element'.
        formerFocus.focus();
      }
    };

    /**
     * select all of the sequence
     */
    selectAllHotkey = () => {
      const {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'setSelection' does not exist on type 'Re... Remove this comment to see the full error message
        selection,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        selection: { start },
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'selection' does not exist on type 'Reado... Remove this comment to see the full error message
        setSelection,
      } = this.props;

      const newSelection = {
        ...selection,
        clockwise: true,
        end: start,
        ref: "ALL",
        start: start, // ref to all means select the whole thing
      };

      setSelection(newSelection);
    };

    handleTripleClick = () => {
      this.selectAllHotkey();
    };

    resetClicked = debounce(() => {
      this.clickedOnce = null;
      this.clickedTwice = null;
    }, 250);

    /**
     * if the contextMenu button is clicked, check whether it was clicked
     * over a noteworthy element, for which db mutations have been written.
     *
     * if it is, mutate the contextMenu to account for those potential interactions
     * and pass on the click. Otherwise, do nothing
     *
     * if it is a regular click, pass on as normal
     *
     
     */
    handleMouseEvent = e => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mouseEvent' does not exist on type 'Read... Remove this comment to see the full error message
      const { mouseEvent } = this.props;

      if (e.type === "mouseup") {
        this.resetClicked();
        if (this.clickedOnce === e.target && this.clickedTwice === e.target) {
          this.handleTripleClick();
          this.resetClicked();
        } else if (this.clickedOnce === e.target && this.clickedTwice === null) {
          this.clickedOnce = e.target;
          this.clickedTwice = e.target;
          this.resetClicked();
        } else {
          this.clickedOnce = e.target;
          this.resetClicked();
        }
      }
      const { button, ctrlKey, type } = e;
      const ctxMenuClick = type === "mousedown" && button === 0 && ctrlKey;

      if (e.button === 0 && !ctxMenuClick) {
        // it's a mouse drag event or an element was clicked
        mouseEvent(e);
      }
    };

    /**
     * handle a scroll event and, if it's a CIRCULAR viewer, update the
     * current central index
     */
    handleScrollEvent = e => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'Linear' does not exist on type 'Readonly... Remove this comment to see the full error message
      const { Linear, rotateOnScroll, seq } = this.props;

      if (!Linear && rotateOnScroll) {
        // a "large scroll" (1000) should rotate through 20% of the plasmid
        let delta = seq.length * (e.deltaY / 5000);
        delta = Math.floor(delta);

        // must scroll by *some* amount (only matters for very small plasmids)
        if (delta === 0) {
          if (e.deltaY > 0) delta = 1;
          else delta = -1;
        }

        let newCentralIndex = this.context.circular + delta;
        newCentralIndex = (newCentralIndex + seq.length) % seq.length;

        this.context.setCentralIndex("circular", newCentralIndex);
      }
    };

    /** a reference used only so we can focus on the event router after mounting */
    eventRouter;

    render() {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mouseEvent' does not exist on type 'Read... Remove this comment to see the full error message
      const { centralIndex, mouseEvent, selection, setCentralIndex, setSelection, ...rest } = this.props;
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'Circular' does not exist on type 'Readon... Remove this comment to see the full error message
      const { Circular, name } = this.props;

      const type = Circular ? "circular" : "linear";
      const id = `la-vz-${type}-${name.replace(/\s/g, "")}-event-router`;

      return (
        <div
          ref={ref => {
            this.eventRouter = ref;
          }}
          className="la-vz-viewer-event-router"
          id={id}
          role="presentation"
          tabIndex={-1}
          onKeyDown={this.handleKeyPress}
          onMouseMove={mouseEvent}
          // Need tabIndex for onKeyDown to work
          onWheel={this.handleScrollEvent}
        >
          <WrappedComp {...rest} mouseEvent={this.handleMouseEvent} />
        </div>
      );
    }
  };

export default WrappedComp => withEventRouter(WrappedComp);
