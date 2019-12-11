import { isEqual } from "lodash";
import PropTypes from "prop-types";
import * as React from "react";

import externalToPart from "../io/externalToPart";
import filesToParts from "../io/filesToParts";
import { dnaComplement } from "../utils/parser";
import { defaultSelection, annotationFactory } from "../utils/sequence";
import SeqViewer from "./SeqViewer";

import "./SeqViz.scss";

/**
 * A container for processing part input and rendering either
 * a linear or circular viewer
 */
export default class SeqViz extends React.Component {
  state = {
    accession: "",
    circularCentralIndex: 0,
    findState: {
      searchResults: [],
      searchIndex: 0
    },
    linearCentralIndex: 0,
    part: {},
    seqSelection: { ...defaultSelection }
  };

  static propTypes = {
    accession: PropTypes.string,
    annotations: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        direction: PropTypes.oneOf(["REVERSE", "NONE", "FORWARD"]),
        color: PropTypes.string,
        type: PropTypes.string
      })
    ),
    backbone: PropTypes.string.isRequired,
    bpColors: PropTypes.object.isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    compSeq: PropTypes.string,
    copySeq: PropTypes.object.isRequired,
    enzymes: PropTypes.arrayOf(PropTypes.string).isRequired,
    file: PropTypes.object,
    name: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    onSelection: PropTypes.func.isRequired,
    searchNext: PropTypes.shape({
      key: PropTypes.string,
      meta: PropTypes.bool,
      ctrl: PropTypes.bool,
      shift: PropTypes.bool,
      alt: PropTypes.bool
    }).isRequired,
    searchQuery: PropTypes.shape({
      query: PropTypes.string,
      mismatch: PropTypes.number
    }).isRequired,
    seq: PropTypes.string,
    showAnnotations: PropTypes.bool.isRequired,
    showComplement: PropTypes.bool.isRequired,
    showIndex: PropTypes.bool.isRequired,
    showPrimers: PropTypes.bool.isRequired,
    style: PropTypes.object,
    translations: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        direction: PropTypes.oneOf(["REVERSE", "NONE", "FORWARD"]),
        name: PropTypes.string,
        color: PropTypes.string,
        type: PropTypes.string
      })
    ).isRequired,
    viewer: PropTypes.oneOf(["linear", "circular", "both"]).isRequired,
    zoom: PropTypes.shape({
      circular: PropTypes.number,
      linear: PropTypes.number
    }).isRequired
  };

  static defaultProps = {
    accession: "",
    annotations: null,
    backbone: "",
    bpColors: {},
    colors: [],
    copySeq: {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    compSeq: "",
    enzymes: [],
    file: null,
    name: "",
    onSearch: results => results,
    onSelection: selection => selection,
    searchNext: {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    searchQuery: { query: "", mismatch: 0 },
    seq: "",
    showAnnotations: true,
    showComplement: true,
    showIndex: true,
    showPrimers: true,
    translations: [],
    viewer: "both",
    zoom: { circular: 0, linear: 50 }
  };

  componentDidMount = async () => {
    this.addKeyBindings();
    this.setPart();
  };

  componentDidUpdate = async ({ accession, backbone }) => {
    this.addKeyBindings();
    if (
      accession !== this.props.accession ||
      backbone !== this.props.backbone
    ) {
      this.setPart();
    }
  };

  /**
   * Set the part from a file or an accession ID
   */
  setPart = async () => {
    const { accession, file } = this.props;

    if (accession) {
      const part = await externalToPart(accession, this.props);
      this.setState({ part });
    } else if (file) {
      const parts = await filesToParts(file, this.props);
      this.setState({ part: parts[0] });
    }
  };

  addKeyBindings() {
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

    const newBindingsMap = { searchNext, copySeq };

    let uniqueNewBindings = {};
    for (const binding in newBindingsMap) {
      const currKey = newBindingsMap[binding].key;

      if (!currKey) {
        continue;
      }

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
              [currKey]: uniqueNewBindings[currKey].concat([binding])
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
  }

  setPartState = state => {
    let newState = Object.keys(state).reduce((newState, key) => {
      if (typeof state[key] === "object") {
        newState[key] = { ...this.state[key], ...state[key] };
      } else {
        newState[key] = state[key];
      }
      return newState;
    }, {});

    this.setState({ ...newState });
  };

  /**
   * Traverse the search results array and return a search index via a prop callback to
   * tell the viewer what to highlight
   */
  incrementSearch() {
    const {
      findState: { searchResults, searchIndex }
    } = this.state;

    if (!searchResults.length) {
      return;
    }

    let newSearchIndex = searchIndex + 1;
    const lastIndex = searchResults.length - 1;
    if (newSearchIndex > lastIndex) {
      newSearchIndex = 0;
    }

    this.setState({
      findState: {
        searchResults: searchResults,
        searchIndex: newSearchIndex
      },
      circularCentralIndex: searchResults[searchIndex].start,
      linearCentralIndex: searchResults[searchIndex].start
    });
  }

  render() {
    const { viewer } = this.props;
    let { annotations, compSeq, name, seq } = this.props;
    const { part } = this.state;

    // part is either from a file/accession, or each prop was set
    seq = seq || part.seq || "";
    compSeq = compSeq || part.compSeq || dnaComplement(seq).compSeq;
    annotations = (annotations || part.annotations || []).map(a => ({
      ...annotationFactory(a.name),
      ...a,
      start: a.start % (seq.length + 1),
      end: a.end % (seq.length + 1)
    }));
    name = name || part.name;

    const linear = viewer === "linear" || viewer === "both";
    const circular = viewer === "circular" || viewer === "both";

    if (!seq.length) {
      return <div className="la-vz-seqviz" />;
    }

    return (
      <div className="la-vz-seqviz">
        <div className="la-vz-seqviz-container">
          {circular && (
            <SeqViewer
              {...this.props}
              {...this.state}
              annotations={annotations}
              compSeq={compSeq}
              name={name}
              seq={seq}
              setPartState={this.setPartState}
              incrementSearch={this.incrementSearch}
              Circular
            />
          )}

          {linear && (
            <SeqViewer
              {...this.props}
              {...this.state}
              annotations={annotations}
              compSeq={compSeq}
              name={name}
              seq={seq}
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
