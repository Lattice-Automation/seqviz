import * as React from "react";
import { isEqual } from "lodash";
import PropTypes from "prop-types";

import externalToPart from "../io/externalToPart";
import filesToParts from "../io/filesToParts";
import { cutSitesInRows } from "../utils/digest/digest";
import { directionality, dnaComplement } from "../utils/parser";
import search from "../utils/search";
import { annotationFactory } from "../utils/sequence";
import CentralIndexContext from "./handlers/centralIndex";
import { SelectionContext, defaultSelection } from "./handlers/selection.jsx";
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
    search: PropTypes.shape({
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
        direction: PropTypes.oneOf(["FORWARD", "REVERSE", 1, -1]).isRequired
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
    compSeq: "",
    copyEvent: () => false,
    enzymes: [],
    file: null,
    name: "",
    onSearch: results => results,
    onSelection: selection => selection,
    search: { query: "", mismatch: 0 },
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
      centralIndex: {
        circular: 0,
        linear: 0,
        setCentralIndex: this.setCentralIndex
      },
      cutSites: [],
      selection: { ...defaultSelection },
      search: [],
      annotations: this.parseAnnotations(props.annotations, props.seq),
      part: {}
    };
  }

  componentDidMount = async () => {
    this.setPart();
  };

  componentDidUpdate = async (
    { accession, backbone, enzymes, search },
    { part }
  ) => {
    if (
      accession !== this.props.accession ||
      backbone !== this.props.backbone
    ) {
      this.setPart();
    } else if (
      search.query !== this.props.search.query ||
      search.mismatch !== this.props.search.mismatch
    ) {
      this.search(part);
    } else if (!isEqual(enzymes, this.props.enzymes)) {
      this.cut(part);
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
      this.search(part);
      this.cut(part);
    } else if (file) {
      const parts = await filesToParts(file, this.props);
      this.setState({
        part: {
          ...parts[0],
          annotations: this.parseAnnotations(parts[0].annotations, parts[0].seq)
        }
      });
      this.search(parts[0]);
      this.cut(parts[0]);
    }
  };

  /**
   * Search for the query sequence in the part sequence, set in state
   */
  search = (part = null) => {
    const {
      onSearch,
      search: { query, mismatch },
      seq
    } = this.props;

    if (!(seq || (part && part.seq))) {
      return;
    }

    const { results } = search(query, mismatch, seq || part.seq);
    if (isEqual(results, this.state.search)) {
      return;
    }

    this.setState({ search: results });
    onSearch(results);
  };

  /**
   * Find and save enzymes' cutsite locations
   */
  cut = (part = null) => {
    const { enzymes, seq } = this.props;

    const cutSites = enzymes.length
      ? cutSitesInRows(seq || (part && part.seq) || "", enzymes)
      : [];

    this.setState({ cutSites });
  };

  /**
   * Modify the annotations to add unique ids, fix directionality and
   * modulo the start and end of each to match SeqViz's API
   */
  parseAnnotations = (annotations, seq) =>
    (annotations || []).map((a, i) => ({
      ...annotationFactory(a.name, i),
      ...a,
      direction: directionality(a.direction),
      start: a.start % (seq.length + 1),
      end: a.end % (seq.length + 1)
    }));

  /**
   * Update the central index of the linear or circular viewer
   */
  setCentralIndex = (type, value) => {
    if (type !== "linear" && type !== "circular") {
      throw new Error(`Unknown central index type: ${type}`);
    }

    if (this.state.centralIndex[type] === value) {
      return; // nothing changed
    }

    this.setState({
      centralIndex: { ...this.state.centralIndex, [type]: value }
    });
  };

  /**
   * Update selection in state. Should only be performed from handlers/selection.jsx
   */
  setSelection = selection => {
    const { onSelection } = this.props;

    this.setState({ selection });

    onSelection(selection);
  };

  render() {
    const { viewer } = this.props;
    let { annotations, compSeq, name, seq } = this.props;
    const { part } = this.state;

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
          <CentralIndexContext.Provider value={this.state.centralIndex}>
            <SelectionContext.Provider value={this.state.selection}>
              {circular && (
                <SeqViewer
                  {...this.props}
                  search={this.state.search}
                  selection={this.state.selection}
                  setSelection={this.setSelection}
                  annotations={annotations}
                  compSeq={compSeq}
                  name={name}
                  seq={seq}
                  cutSites={this.state.cutSites}
                  Circular
                />
              )}

              {linear && (
                <SeqViewer
                  {...this.props}
                  search={this.state.search}
                  selection={this.state.selection}
                  setSelection={this.setSelection}
                  annotations={annotations}
                  compSeq={compSeq}
                  name={name}
                  seq={seq}
                  cutSites={this.state.cutSites}
                  Circular={false}
                />
              )}
            </SelectionContext.Provider>
          </CentralIndexContext.Provider>
        </div>
      </div>
    );
  }
}
