import * as React from "react";
import SeqViewer from "./SeqViewer/SeqViewer";
import "./PartExplorer.scss";
import SelectionMetaInfo from "./SelectionMetaInfo/SelectionMetaInfo";
import BlankPage from "../BlankPage/BlankPage";

/**
 * a container for investigating the meta and sequence information of a part
 */
class PartExplorer extends React.PureComponent {
  state = {
    showSearch: false,
    seqSelection: { ref: null, start: 0, end: 0, clockwise: true },
    findSelection: {
      searchResults: [],
      searchIndex: 0
    },
    circularCentralIndex: 0,
    linearCentralIndex: 0
  };

  setPartState = state => {
    let newState = Object.keys(state).reduce((newState, key) => {
      if (typeof state[key] === "object") {
        newState[key] = { ...this.state[key], ...state[key] };
      } else {
        newState[key] = state[key];
      }
      return newState;
    }, {});
    const { ...rest } = this.state;
    this.setState({ ...rest, ...newState });
  };

  render() {
    const { circular, part } = this.props;
    const partState = this.state;
    return (
      <div className="part-explorer-container" id="part-explorer">
        <div className="seq-viewers-container">
          {circular
            ? part.seq.length > 0 && (
                <SeqViewer
                  part={part}
                  {...partState}
                  setPartState={this.setPartState}
                  Circular
                />
              )
            : part.seq.length > 0 && (
                <SeqViewer
                  part={part}
                  {...partState}
                  setPartState={this.setPartState}
                  Circular={false}
                />
              )}
          {part.seq.length < 1 && <BlankPage />}
        </div>
        <SelectionMetaInfo
          part={part}
          {...partState}
          setPartState={this.setPartState}
        />
      </div>
    );
  }
}

export default PartExplorer;
