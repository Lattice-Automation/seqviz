import * as React from "react";
import PropTypes from "prop-types";

import externalToPart from "../io/externalToPart";
import filesToParts from "../io/filesToParts";
import { directionality, dnaComplement } from "../utils/parser";
import { annotationFactory } from "../utils/sequence";
import SeqViewer from "./SeqViewer.jsx";

import "./SeqViz.scss";

/**
 * A container for processing part input and rendering either
 * a linear or circular viewer
 */
export default class SeqViz extends React.Component {
  static propTypes = {
    accession: PropTypes.string,
    annotations: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        direction: PropTypes.oneOf(["REVERSE", "NONE", "FORWARD", 1, 0, -1]),
        color: PropTypes.string,
        type: PropTypes.string
      })
    ),
    backbone: PropTypes.string.isRequired,
    bpColors: PropTypes.object.isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    compSeq: PropTypes.string,
    copyEvent: PropTypes.func.isRequired,
    enzymes: PropTypes.arrayOf(PropTypes.string).isRequired,
    file: PropTypes.object,
    name: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    onSelection: PropTypes.func.isRequired,
    searchEvent: PropTypes.func.isRequired,
    searchQuery: PropTypes.shape({
      query: PropTypes.string,
      mismatch: PropTypes.number
    }).isRequired,
    seq: PropTypes.string,
    showComplement: PropTypes.bool.isRequired,
    showIndex: PropTypes.bool.isRequired,
    showPrimers: PropTypes.bool.isRequired,
    style: PropTypes.object,
    translations: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        direction: PropTypes.oneOf(["REVERSE", "NONE", 1]),
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
    copyEvent: () => false,
    compSeq: "",
    enzymes: [],
    file: null,
    name: "",
    onSearch: results => results,
    onSelection: selection => selection,
    searchEvent: () => false,
    searchQuery: { query: "", mismatch: 0 },
    seq: "",
    showComplement: true,
    showIndex: true,
    showPrimers: true,
    translations: [],
    viewer: "both",
    zoom: { circular: 0, linear: 50 }
  };

  constructor(props) {
    super(props);

    this.state = {
      accession: "",
      circularCentralIndex: 0,
      findState: {
        searchResults: [],
        searchIndex: 0
      },
      linearCentralIndex: 0,
      part: {
        annotations: this.parseAnnotations(props.annotations, props.seq)
      }
    };
  }

  componentDidMount = async () => {
    this.setPart();
  };

  componentDidUpdate = async ({ accession, backbone }) => {
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
      this.setState({
        part: {
          ...part,
          annotations: this.parseAnnotations(part.annotations, part.seq)
        }
      });
    } else if (file) {
      const parts = await filesToParts(file, this.props);
      this.setState({
        part: {
          ...parts[0],
          annotations: this.parseAnnotations(parts[0].annotations, parts[0].seq)
        }
      });
    }
  };

  /**
   * Modify the annotations to add unique ids, fix directionality and
   * modulo the start and end of each to match SeqViz's API
   */
  parseAnnotations = (annotations, seq) =>
    (annotations || []).map(a => ({
      ...annotationFactory(a.name),
      ...a,
      direction: directionality(a.direction),
      start: a.start % (seq.length + 1),
      end: a.end % (seq.length + 1)
    }));

  /**
   * TODO: get rid of this
   */
  setPartState = state => {
    this.setState(state);
  };

  /**
   * Move one further through the search results
   */
  incrementSearch() {
    const {
      findState: { searchResults, searchIndex }
    } = this.state;

    if (!searchResults.length) {
      return;
    }

    const newSearchIndex = (searchIndex + 1) % searchResults.length;
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
    const {
      part,
      circularCentralIndex,
      findState,
      linearCentralIndex
    } = this.state;

    // part is either from a file/accession, or each prop was set
    seq = seq || part.seq || "";
    compSeq = compSeq || part.compSeq || dnaComplement(seq).compSeq;
    name = name || part.name;
    annotations = annotations || part.annotations;

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
              circularCentralIndex={circularCentralIndex}
              incrementSearch={this.incrementSearch}
              findState={findState}
              annotations={annotations}
              compSeq={compSeq}
              name={name}
              seq={seq}
              setPartState={this.setPartState}
              Circular
            />
          )}

          {linear && (
            <SeqViewer
              {...this.props}
              linearCentralIndex={linearCentralIndex}
              incrementSearch={this.incrementSearch}
              findState={findState}
              annotations={annotations}
              compSeq={compSeq}
              name={name}
              seq={seq}
              setPartState={this.setPartState}
              Circular={false}
            />
          )}
        </div>
      </div>
    );
  }
}
