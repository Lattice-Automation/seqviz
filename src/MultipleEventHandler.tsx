// import FloatingMenu from "./Linear/FloatingMenu";
import CentralIndexContext from "./centralIndexContext";
import AlignmentStatistics from "./Alignment/AlignmentStatistics";
import debounce from "./debounce";
import { Selection } from "./selectionContext";
import * as React from "react";
import { guessType } from "./sequence";


export interface EventsHandlerProps {
  bpsPerBlock: number;
  children: any;
  aagrouping?: boolean;
  showDetails?: boolean;
  copyEvent: (e: React.KeyboardEvent<HTMLElement>) => boolean;
  handleMouseEvent: (e: any) => void;
  selection: Selection;
  seq: string[];
  name: string;
  nameToCompare?: string;
  setSelection: (selection: Selection) => void;
}
export interface EventsHandlerState {
  rightClickMenu: Boolean;
  xFloatingMenu: number;
  yFloatingMenu: number;
}

/**
 * EventHandler handles the routing of all events, including keypresses, mouse clicks, etc.
 */
export class MultipleEventHandler extends React.PureComponent<EventsHandlerProps> {
  static contextType = CentralIndexContext;
  static context: React.ContextType<typeof CentralIndexContext>;
  declare context: React.ContextType<typeof CentralIndexContext>;

  clickedOnce: EventTarget | null = null;
  clickedTwice: EventTarget | null = null;
  state = { rightClickMenu: false, xFloatingMenu: 0, yFloatingMenu: 0 };
  /**
   * action handler for a keyboard keypresses.
   */
  handleKeyPress = (e: React.KeyboardEvent<HTMLElement>) => {
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
  keypressMap = (e: React.KeyboardEvent<HTMLElement>) => {
    const { copyEvent } = this.props;

    if (copyEvent && copyEvent(e)) {
      return 'Copy';
    }

    const { key, shiftKey } = e;
    switch (key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown':
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
  handleSeqInteraction = async (type) => {
    const { seq } = this.props;
    const seqLength = seq.length;
    const bpsPerBlock = this.props.bpsPerBlock || 1;

    switch (type) {
      case 'SelectAll': {
        this.selectAllHotkey();
        break;
      }
      case 'Copy': {
        this.handleCopy();
        break;
      }
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ShiftArrowUp':
      case 'ShiftArrowRight':
      case 'ShiftArrowDown':
      case 'ShiftArrowLeft': {
        const { selection, setSelection } = this.props;
        const { end, start } = selection;

        if (typeof start === 'undefined' || typeof end === 'undefined') {
          return;
        }

        let { clockwise } = selection;
        let newPos = end;
        if (type === 'ArrowUp' || type === 'ShiftArrowUp') {
          // if there are multiple blocks or just one. If one, just inc by one
          if (seqLength / bpsPerBlock > 1) {
            newPos -= bpsPerBlock;
          } else {
            newPos -= 1;
          }
        } else if (type === 'ArrowRight' || type === 'ShiftArrowRight') {
          newPos += 1;
        } else if (type === 'ArrowDown' || type === 'ShiftArrowDown') {
          // if there are multiple blocks or just one. If one, just inc by one
          if (seqLength / bpsPerBlock > 1) {
            newPos += bpsPerBlock;
          } else {
            newPos += 1;
          }
        } else if (type === 'ArrowLeft' || type === 'ShiftArrowLeft') {
          newPos -= 1;
        }

        if (newPos <= -1) {
          newPos = seqLength + newPos;
        }
        if (newPos >= seqLength + 1) {
          newPos -= seqLength;
        }
        const selLength = Math.abs(start - end);
        clockwise = selLength === 0 ? type === 'ArrowRight' || type === 'ShiftArrowRight' || type === 'ArrowDown' || type === 'ShiftArrowDown' : clockwise;
        if (newPos !== start && !type.startsWith('Shift')) {
          setSelection({
            clockwise: true,
            end: newPos,
            start: newPos,
            type: 'SEQ',
          });
        } else if (type.startsWith('Shift')) {
          setSelection({
            clockwise: clockwise,
            end: newPos,
            start: start,
            type: 'SEQ',
          });
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
      selection: { end, ref, start },
      seq,
    } = this.props;
    if (!document) return;

    const formerFocus = document.activeElement;
    const tempNode = document.createElement('textarea');
    if (ref === 'ALL') {
      tempNode.innerText = seq[0];
    } else {
      tempNode.innerText = seq[0].substring(start || 0, end);
    }
    if (document.body) {
      document.body.appendChild(tempNode);
    }
    tempNode.select();
    document.execCommand('copy');
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
      selection,
      selection: { start },
      setSelection,
    } = this.props;

    const newSelection = {
      ...selection,
      clockwise: true,
      end: start,
      ref: 'ALL',
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
   */
  handleMouseEvent = (e: React.MouseEvent) => {
    const { handleMouseEvent } = this.props;
    
    // If the right click is performed
    if (e.button === 2 && e.type==="contextmenu" ) {
      e.preventDefault();
      this.setState({ rightClickMenu: true });
      // Box position (under the mouse)
      this.setState({ xFloatingMenu: e.clientX - window.pageXOffset});
      this.setState({ yFloatingMenu: e.clientY - window.pageYOffset});
      return;
    }
    // Close the context menu if a left click is performed on the screen and the target is not a button 
    if(e.button !== 2 && this.state.rightClickMenu && !(e.target instanceof HTMLButtonElement)) this.setState({ rightClickMenu: false });
    
    if (e.type === 'mouseup') {
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
    const ctxMenuClick = type === 'mousedown' && button === 0 && ctrlKey;

    if (e.button === 0 && !ctxMenuClick) {
      // it's a mouse drag event or an element was clicked
      handleMouseEvent(e);
    }
  };
  closeMenu = () => {
    this.setState({ rightClickMenu: false });
  }
  render = () => (
    <div className="la-vz-viewer-event-router" id="la-vz-event-router" role="presentation" tabIndex={-1}
    style={{display:"flex", flexDirection:"column"}}
    onContextMenu={this.handleMouseEvent}
    onKeyDown={this.handleKeyPress}
    onMouseDown={this.handleMouseEvent}
    onMouseMove={this.props.handleMouseEvent}
    onMouseUp={this.handleMouseEvent}
    >

    {this.props.showDetails && <AlignmentStatistics   name = {this.props.name}
      nameToCompare = {this.props.nameToCompare} seq={this.props.seq[0]} seqToCompare={this.props.seq[1]} seqType={guessType(this.props.seq[0])}/>}
      {this.props.children}
    </div>
  );
}