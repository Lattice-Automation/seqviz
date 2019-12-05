import { isEqual } from "lodash";
import * as React from "react";

import SeqViewer from "./SeqViewer/SeqViewer";
import "./PartExplorer.scss";
import { defaultSelection } from "../utils/sequence";
import processPartInput from "../io/processPartInput";

/**
 * a container for investigating the meta and sequence information of a part
 */
export default class PartExplorer extends React.Component {
  state = {
    seqSelection: { ...defaultSelection },
    findState: {
      searchResults: [],
      searchIndex: 0
    },
    circularCentralIndex: 0,
    linearCentralIndex: 0,
    part: {}
  };

  /**
   * Convert the part input (ID, object, File, etc) to a part for the viewer
   */
  createPart = async () => {
    const { part: partInput, colors, backbone } = this.props;

    let part = await processPartInput(partInput, { colors, backbone });

    if (part) {
      // none of the feature's ends can be greater than length of the plasmid - 1
      part.annotations.forEach(a => {
        a.start %= part.seq.length;
        if (a.end >= part.seq.length) {
          console.warning(
            `Annotation ${a.name}'s end is > sequence length ${part.seq.length}:` +
              "SeqViz uses 0-based indexing and the max index for an element is N - 1 where N is the length of the sequence."
          );
          a.end %= part.seq.length;
        }
      });

      this.setState({ part });
    }
  };

  addKeyBindings = () => {
    const { searchNext, copySeq } = this.props;

    /**
     * copy the given range of the linearSequence to the users clipboard
     * more info @ https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
     */
    const clipboardCopy = () => {
      const {
        part: { seq },
        seqSelection: {
          selectionMeta: { start, end },
          ref
        }
      } = this.state;
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

    const handleKeyPress = e => {
      const input = (({ metaKey, altKey, ctrlKey, shiftKey, key }) => ({
        metaKey,
        altKey,
        ctrlKey,
        shiftKey,
        key
      }))(e);
      const next = (({ meta, alt, ctrl, shift, key }) => ({
        metaKey: meta,
        altKey: alt,
        ctrlKey: ctrl,
        shiftKey: shift,
        key
      }))(searchNext);
      if (isEqual(input, next)) {
        this.incrementSearch();
      }
      const copy = (({ meta, alt, ctrl, shift, key }) => ({
        metaKey: meta,
        altKey: alt,
        ctrlKey: ctrl,
        shiftKey: shift,
        key
      }))(copySeq);
      if (isEqual(input, copy)) {
        clipboardCopy();
      }
    };

    const takenBindings = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

    const newBindingsMap = { searchNext: searchNext, copySeq: copySeq };

    let uniqueNewBindings = {};
    for (const binding in newBindingsMap) {
      const currKey = newBindingsMap[binding].key;
      if (currKey && takenBindings.includes(currKey)) {
        console.error(
          `Up, Down, Left, and Right Arrow keys are already bound, please chose another key binding for ${binding}.`
        );
      } else if (Object.keys(uniqueNewBindings).includes(currKey)) {
        for (const ubinding of uniqueNewBindings[currKey]) {
          if (isEqual(newBindingsMap[binding], newBindingsMap[ubinding])) {
            console.error(
              `Custom key bindings must be unique. ${binding} and ${ubinding} cannot share the same key bindings.`
            );
          } else {
            uniqueNewBindings = {
              ...uniqueNewBindings,
              ...{
                [currKey]: uniqueNewBindings[currKey].concat([binding])
              }
            };
          }
        }
      } else {
        window.addEventListener("keydown", e => handleKeyPress(e));
        uniqueNewBindings = {
          ...uniqueNewBindings,
          ...{ [currKey]: [binding] }
        };
      }
    }
  };

  componentDidMount = async () => {
    this.createPart(true);
    this.addKeyBindings();
  };

  shouldComponentUpdate = (nextProps, nextState) =>
    !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);

  componentDidUpdate = async prevProps => {
    const {
      part: partInput,
      colors,
      backbone,
      zoom: { circular: czoom, linear: lzoom },
      enzymes
    } = this.props;

    const {
      part: prevPart,
      colors: prevColors,
      backbone: prevBackbone,
      zoom: { circular: prevCzoom, linear: prevLzoom },
      enzymes: prevEnzymes
    } = prevProps;

    if (
      partInput !== prevPart ||
      backbone !== prevBackbone ||
      colors !== prevColors ||
      czoom !== prevCzoom ||
      lzoom !== prevLzoom ||
      enzymes !== prevEnzymes
    ) {
      this.createPart(partInput !== prevPart);
      this.addKeyBindings();
    }
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

    this.setState({ ...this.state, ...newState });
  };

  /**
   * Traverse the search results array and return a search index via a prop callback to
   * tell the viewer what to highlight
   */
  incrementSearch = () => {
    const {
      findState: { searchResults, searchIndex }
    } = this.state;

    let newSearchIndex = searchIndex;
    if (searchResults.length) {
      const lastIndex = searchResults.length - 1;
      newSearchIndex += 1;
      if (newSearchIndex > lastIndex) newSearchIndex = 0;
      this.setState({
        findState: {
          searchResults: searchResults,
          searchIndex: newSearchIndex
        },
        circularCentralIndex: searchResults[searchIndex].start,
        linearCentralIndex: searchResults[searchIndex].start
      });
    }
  };

  render() {
    const { viewer } = this.props;
    const { part } = this.state;

    const partAvailable = part.seq || part.seq === "" || false;
    const linear = viewer === "linear" || viewer === "both";
    const circular = viewer === "circular" || viewer === "both";

    if (!partAvailable || !part.seq.length) {
      return (
        <div
          className="la-vz-part-explorer-container"
          id="la-vz-part-explorer"
        />
      );
    }

    return (
      <div className="la-vz-part-explorer-container" id="la-vz-part-explorer">
        <div className="la-vz-seq-viewers-container">
          {circular && (
            <SeqViewer
              {...this.props}
              {...this.state}
              {...part}
              setPartState={this.setPartState}
              incrementSearch={this.incrementSearch}
              Circular
            />
          )}

          {linear && (
            <SeqViewer
              {...this.props}
              {...this.state}
              {...part}
              setPartState={this.setPartState}
              incrementSearch={this.incrementSearch}
              Circular={false}
            />
          )}
        </div>
      </div>
    );
  }
}
