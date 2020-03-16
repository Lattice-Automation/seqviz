import * as React from "react";
import PropTypes from "prop-types";

import externalToPart from "../io/externalToPart";
import filesToParts from "../io/filesToParts";
import { cutSitesInRows } from "../utils/digest";
import isEqual from "../utils/isEqual";
import { directionality, dnaComplement } from "../utils/parser";
import search from "../utils/search";
import { annotationFactory } from "../utils/sequence";
import CentralIndexContext from "./handlers/centralIndex";
import { SelectionContext, defaultSelection } from "./handlers/selection.jsx";
import SeqViewer from "./SeqViewer.jsx";

import "./style.css";

/**
 * A container for processing part input and rendering either
 * a linear or circular viewer or both
 */
export default class SeqViz extends React.Component {
  static propTypes = {
    accession: PropTypes.string,
    annotations: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        direction: PropTypes.oneOf([1, 0, -1, "REVERSE", "NONE", "FORWARD"]),
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
    file: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
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
    style: PropTypes.object.isRequired,
    translations: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        direction: PropTypes.oneOf([1, -1, "FORWARD", "REVERSE"]).isRequired
      })
    ).isRequired,
    viewer: PropTypes.oneOf(["linear", "circular", "both", "both_flip"])
      .isRequired,
    zoom: PropTypes.shape({
      circular: PropTypes.number,
      linear: PropTypes.number
    }).isRequired
  };

  static defaultProps = {
    accession: "",
    annotations: [],
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
    style: {},
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
    await this.setPart();
  };

  componentDidUpdate = async (
    { accession, backbone, enzymes, file, search },
    { part }
  ) => {
    if (
      accession !== this.props.accession ||
      backbone !== this.props.backbone ||
      file !== this.props.file
    ) {
      await this.setPart(); // new accesion/remote ID
    } else if (
      search.query !== this.props.search.query ||
      search.mismatch !== this.props.search.mismatch
    ) {
      this.search(part); // new search parameters
    } else if (!isEqual(enzymes, this.props.enzymes)) {
      this.cut(part); // new set of enzymes for digest
    }
  };

  /**
   * Set the part from a file or an accession ID
   */
  setPart = async () => {
    const { accession, file } = this.props;

    try {
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
        const parts = await filesToParts([file], this.props);
        this.setState({
          part: {
            ...parts[0],
            annotations: this.parseAnnotations(
              parts[0].annotations,
              parts[0].seq
            )
          }
        });
        this.search(parts[0]);
        this.cut(parts[0]);
      }
    } catch (err) {
      console.error(err);
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

    const results = search(query, mismatch, seq || part.seq);
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
    const { style, viewer } = this.props;
    let { annotations, compSeq, name, seq } = this.props;
    const { centralIndex, cutSites, part, search, selection } = this.state;

    // part is either from a file/accession, or each prop was set
    seq = seq || part.seq || "";
    compSeq = compSeq || part.compSeq || dnaComplement(seq).compSeq;
    name = name || part.name;
    annotations =
      annotations && annotations.length ? annotations : part.annotations || [];

    if (!seq.length) {
      return <div className="la-vz-seqviz" />;
    }

    const linear = (viewer === "linear" || viewer.includes("both")) && (
      <SeqViewer
        key="linear"
        {...this.props}
        search={search}
        selection={selection}
        setSelection={this.setSelection}
        annotations={annotations}
        compSeq={compSeq}
        name={name}
        seq={seq}
        cutSites={cutSites}
        Circular={false}
      />
    );
    const circular = (viewer === "circular" || viewer.includes("both")) && (
      <SeqViewer
        key="circular"
        {...this.props}
        search={search}
        selection={selection}
        setSelection={this.setSelection}
        annotations={annotations}
        compSeq={compSeq}
        name={name}
        seq={seq}
        cutSites={cutSites}
        Circular
      />
    );
    const bothFlipped = viewer === "both_flip";
    const viewers = bothFlipped ? [linear, circular] : [circular, linear];

    return (
      <div className="la-vz-seqviz" style={style}>
        <CentralIndexContext.Provider value={centralIndex}>
          <SelectionContext.Provider value={selection}>
            {viewers.filter(v => v).map(v => v)}
          </SelectionContext.Provider>
        </CentralIndexContext.Provider>
      </div>
    );
  }
}
