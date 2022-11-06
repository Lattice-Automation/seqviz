import * as React from "react";

import SeqViewer from "./SeqViewer";
import { Annotation, CutSite, Highlight, NameRange, Range } from "./elements";
import CentralIndexContext from "./handlers/centralIndex";
import { Selection, SelectionContext, defaultSelection } from "./handlers/selection";
import isEqual from "./isEqual";

interface SeqViewerContainerProps {
  annotations: Annotation[];
  bpColors: { [key: number | string]: string };
  compSeq: string;
  cutSites: CutSite[];
  highlights: Highlight[];
  name: string;
  onSelection: (selection: Selection) => void;
  search: NameRange[];
  selection?: {
    start: number;
    end: number;
    clockwise?: boolean;
  };
  seq: string;
  showComplement: boolean;
  showIndex: boolean;
  translations: Range[];
  viewer: "linear" | "circular" | "both" | "both_flip";
  zoom: { circular: number; linear: number };
}

export interface SeqViewerContainerState {
  centralIndex: {
    circular: number;
    linear: number;
    setCentralIndex: (type: "linear" | "circular", value: number) => void;
  };
  selection: Selection;
}

/**
 * a parent sequence viewer component that holds whatever is common between
 * the linear and circular sequence viewers. The Header is an example
 */
export default class SeqViewerContainer extends React.Component<SeqViewerContainerProps, SeqViewerContainerState> {
  constructor(props: SeqViewerContainerProps) {
    super(props);

    this.state = {
      centralIndex: {
        circular: 0,
        linear: 0,
        setCentralIndex: this.setCentralIndex,
      },
      selection: this.getSelection(defaultSelection, props.selection),
    };
  }

  /** this is here because the size listener is returning a new "size" prop every time */
  shouldComponentUpdate = (nextProps: SeqViewerContainerProps, nextState: any) =>
    !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);

  /**
   * Update the central index of the linear or circular viewer.
   */
  setCentralIndex = (type: "linear" | "circular", value: number) => {
    if (type !== "linear" && type !== "circular") {
      throw new Error(`Unknown central index type: ${type}`);
    }

    if (this.state.centralIndex[type] === value) {
      return; // nothing changed
    }

    this.setState({ centralIndex: { ...this.state.centralIndex, [type]: value } });
  };

  /**
   * Update selection in state. Should only be performed from handlers/selection.jsx
   */
  setSelection = (selection: Selection) => {
    // If the user passed a selection, do not update our state here
    const { element, ref, parent, ...rest } = selection;
    if (!this.props.selection) this.setState({ selection });
    if (this.props.onSelection) this.props.onSelection(rest);
  };

  /**
   * Returns the selection that was either a prop (optional) or the selection maintained in state.
   */
  getSelection = (
    state: Selection,
    prop?: {
      start: number;
      end: number;
      clockwise?: boolean;
    }
  ): Selection => {
    if (prop) {
      return { ...prop, clockwise: typeof prop.clockwise === "undefined" || !!prop.clockwise };
    }
    return state;
  };

  render() {
    const { selection: selectionProp, viewer } = this.props;
    const { centralIndex, selection } = this.state;

    // Arrange the viewers based on the viewer prop.
    const linear = (viewer === "linear" || viewer.includes("both")) && (
      <SeqViewer key="linear" Circular={false} setSelection={this.setSelection} {...this.props} />
    );
    const circular = (viewer === "circular" || viewer.includes("both")) && (
      <SeqViewer key="circular" Circular setSelection={this.setSelection} {...this.props} />
    );
    const bothFlipped = viewer === "both_flip";
    const viewers = bothFlipped ? [linear, circular] : [circular, linear];

    return (
      <div className="la-vz-viewer-container">
        <CentralIndexContext.Provider value={centralIndex}>
          <SelectionContext.Provider value={this.getSelection(selection, selectionProp)}>
            {viewers.filter(v => v)}
          </SelectionContext.Provider>
        </CentralIndexContext.Provider>
      </div>
    );
  }
}
