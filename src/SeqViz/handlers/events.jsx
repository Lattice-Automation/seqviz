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
 * @param  {React.Component} WrappedComp
 * @return {React.Component}
 */
const withEventRouter = WrappedComp =>
  class WithEventRouter extends React.PureComponent {
    // eslint-disable-next-line
    static displayName = `EventRouter`;

    static contextType = CentralIndexContext;

    clickedOnce = null;

    clickedTwice = null;

    componentDidMount = () => {
      window.addEventListener("keydown", this.handleKeyPress);
    };

    componentWillUnmount = () => {
      window.removeEventListener("keydown", this.handleKeyPress);
    };

    /** set the event router reference on this class */
    setEventRouter = eventRouter => {
      this.eventRouter = eventRouter;
    };

    /**
     * action handler for a keyboard keypresses.
     * Mapping logic has been abstracted to keypressMap in ./api/keypressMap.js
     *
     * @param  {React.SyntheticEvent} e   keypress
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
     * @param {React.SyntheticEvent} e   synthetic event input
     * @return {String} 			     the action performed, one of:
     * ["All", "Copy", "Up", "Right", "Down", "Left"]
     */
    keypressMap = e => {
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
     *
     * @param {String} i  		  one of the commands listed above
     */
    handleSeqInteraction = async type => {
      const { seq, Linear } = this.props;
      const seqLength = seq.length;
      const {
        bpsPerBlock = Math.max(Math.floor(seqLength / 20), 1)
      } = this.props;

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
          const { selection, setSelection } = this.props;
          const { start, end } = selection;
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
                start: newPos,
                end: newPos,
                clockwise: true,
                ref: ""
              });
            } else if (type.startsWith("Shift")) {
              setSelection({
                start: start,
                end: newPos,
                clockwise: clockwise,
                ref: ""
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
        seq,
        selection: { start, end, ref }
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
        formerFocus.focus();
      }
    };

    /**
     * select all of the sequence
     */
    selectAllHotkey = () => {
      const {
        setSelection,
        selection,
        selection: { start }
      } = this.props;

      const newSelection = {
        ...selection,
        start: start,
        end: start,
        clockwise: true,
        ref: "ALL" // ref to all means select the whole thing
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
     * @param  {React.SyntheticEvent} e   the mouse event
     */
    handleMouseEvent = e => {
      const { mouseEvent } = this.props;

      if (e.type === "mouseup") {
        this.resetClicked();
        if (this.clickedOnce === e.target && this.clickedTwice === e.target) {
          this.handleTripleClick();
          this.resetClicked();
        } else if (
          this.clickedOnce === e.target &&
          this.clickedTwice === null
        ) {
          this.clickedOnce = e.target;
          this.clickedTwice = e.target;
          this.resetClicked();
        } else {
          this.clickedOnce = e.target;
          this.resetClicked();
        }
      }
      const { type, button, ctrlKey } = e;
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
      const { Linear, seq } = this.props;

      if (!Linear) {
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
      const {
        mouseEvent,
        selection,
        setSelection,
        centralIndex,
        setCentralIndex,
        ...rest
      } = this.props;
      const { Circular, name } = this.props;

      const type = Circular ? "circular" : "linear";
      const id = `la-vz-${type}-${name.replace(/\s/g, "")}-event-router`;

      return (
        <div
          id={id}
          className="la-vz-viewer-event-router"
          onKeyDown={this.handleKeyPress}
          onMouseMove={mouseEvent}
          onWheel={this.handleScrollEvent}
          role="presentation"
          ref={ref => {
            this.eventRouter = ref;
          }}
        >
          <WrappedComp {...rest} mouseEvent={this.handleMouseEvent} />
        </div>
      );
    }
  };

export default WrappedComp => withEventRouter(WrappedComp);
