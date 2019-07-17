import { debounce } from "lodash";
import * as React from "react";

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
    static displayName = `EventRouter(${WrappedComp.displayName ||
      "Component"})`;

    /**
     * Triple click event handler helpers
     */
    _delayedClick = null;

    clickedOnce = null;

    clickedTwice = null;

    constructor(props) {
      super(props);

      this.state = {
        id: `la-vz-${props.type}-${props.name.replace(/\s/g, "")}-event-router`
      };
    }

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

    suppressBrowserContextMenu = e => {
      if (!e.shiftKey) {
        e.preventDefault();
        this.handleMouseEvent(e);
      }
    };

    /**
     * select all
     */
    selectAllHotkey = () => {
      const {
        onSelection,
        setPartState,
        seqSelection,
        seqSelection: {
          selectionMeta: { start }
        }
      } = this.props;
      const newSelection = {
        ...seqSelection,
        selectionMeta: {
          start: start,
          end: start,
          clockwise: true
        },
        ref: "ALL" // ref to all means select the whole thing
      };
      setPartState({
        seqSelection: newSelection
      });
      onSelection(newSelection);
    };

    handleTripleClick = () => {
      this.selectAllHotkey();
    };

    resetClicked = () => {
      this.clickedOnce = null;
      this.clickedTwice = null;
    };

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
        if (!this._delayedClick) {
          this._delayedClick = debounce(this.resetClicked, 250);
        }
        if (this.clickedOnce === e.target && this.clickedTwice === e.target) {
          this._delayedClick.cancel();
          this.handleTripleClick();
          this._delayedClick();
        } else if (
          this.clickedOnce === e.target &&
          this.clickedTwice === null
        ) {
          this._delayedClick.cancel();
          this.clickedOnce = e.target;
          this.clickedTwice = e.target;
          this._delayedClick();
        } else {
          this._delayedClick.cancel();
          this.clickedOnce = e.target;
          this._delayedClick();
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
      const { Linear, circularCentralIndex, seq, setPartState } = this.props;

      if (!Linear) {
        // a "large scroll" (1000) should rotate through 20% of the plasmid
        let delta = seq.length * (e.deltaY / 5000);
        delta = Math.floor(delta);

        // must scroll by *some* amount (only matters for very small plasmids)
        if (delta === 0) {
          if (e.deltaY > 0) delta = 1;
          else delta = -1;
        }

        let newCentralIndex = circularCentralIndex + delta;
        newCentralIndex = (newCentralIndex + seq.length) % seq.length;

        setPartState({
          circularCentralIndex: newCentralIndex
        });
      }
    };

    /**
     * maps a keypress to an interaction (String)
     *
     * @param {React.SyntheticEvent} e   synthetic event input
     * @return {String} 			     the action performed, one of:
     * ["All", "Copy", "Up", "Right", "Down", "Left"]
     */
    keypressMap = e => {
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
          this.clipboardCopy();
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
          const {
            seqSelection: { selectionMeta: selection },
            setPartState
          } = this.props;
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
            const selectionLength = Math.abs(start - end);
            clockwise =
              selectionLength === 0
                ? type === "ArrowRight" ||
                  type === "ShiftArrowRight" ||
                  type === "ArrowDown" ||
                  type === "ShiftArrowDown"
                : clockwise;
            if (newPos !== start && !type.startsWith("Shift")) {
              setPartState({
                seqSelection: {
                  selectionMeta: {
                    start: newPos,
                    end: newPos,
                    clockwise: true
                  },
                  ref: ""
                }
              });
            } else if (type.startsWith("Shift")) {
              setPartState({
                seqSelection: {
                  selectionMeta: {
                    start: start,
                    end: newPos,
                    clockwise: clockwise
                  },
                  ref: ""
                }
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

    /** a reference used only so we can focus on the event router after mounting */
    eventRouter;

    render() {
      const { id } = this.state;

      return (
        <div
          id={id}
          className="la-vz-viewer-event-router"
          onMouseMove={this.handleMouseEvent}
          onKeyDown={this.handleKeyPress}
          onWheel={this.handleScrollEvent}
          role="presentation"
          ref={ref => {
            this.eventRouter = ref;
          }}
        >
          <WrappedComp {...this.props} mouseEvent={this.handleMouseEvent} />
        </div>
      );
    }
  };

export default WrappedComp => withEventRouter(WrappedComp);
