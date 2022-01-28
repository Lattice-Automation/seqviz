import * as React from "react";
import externalToPart from "../io/externalToPart";
import filesToParts from "../io/filesToParts";
import { cutSitesInRows } from "../utils/digest";
import isEqual from "../utils/isEqual";
import { directionality, dnaComplement } from "../utils/parser";
import search, { SearchResult } from "../utils/search";
import { annotationFactory, getSeqType } from "../utils/sequence";
import CentralIndexContext from "./handlers/centralIndex";
import { SelectionContext, defaultSelection } from "./handlers/selection";
import SeqViewer from "./SeqViewer";
import { Annotation, Element, Part } from "../part";

import "./style.css";

export interface SeqVizSelection {
  name: string;
  type: string;
  seq: string;
  gc: string;
  tm: number;
  start: number;
  end: number;
  length: number;
  direction: number;
  clockwise: boolean;
  color: string;
}

export interface SeqVizProps {
  accession?: string;
  name?: string;
  seq?: string;
  compSeq?: string;
  annotations?: Annotation[];
  file?: string | File;

  backbone: string;
  bpColors: { [key: string]: string };
  colors?: string[];
  copyEvent: (event: KeyboardEvent) => void;
  enzymes: string[];
  enzymesCustom: {
    [key: string]: {
      rseq: string;
      fcut: number;
      rcut: number;
    };
  };
  onSearch: (search: SearchResult[]) => void;
  onSelection: (selection: SeqVizSelection) => void;
  rotateOnScroll: boolean;
  search: {
    query: string;
    mismatch: number;
  };
  showComplement: boolean;
  showIndex: boolean;
  showPrimers: boolean;
  style: object;
  translations: Element[];
  viewer: "linear" | "circular" | "both" | "both_flip";
  zoom: {
    circular: number;
    linear: number;
  };
}

/**
 * A container for processing part input and rendering either
 * a linear or circular viewer or both
 */
export default class SeqViz extends React.Component<SeqVizProps, any> {
  static defaultProps = {
    accession: "",
    annotations: [],
    backbone: "",
    bpColors: {},
    colors: [],
    compSeq: "",
    copyEvent: () => false,
    enzymes: [],
    enzymesCustom: {},
    name: "",
    onSearch: (results: SearchResult[]) => results,
    onSelection: (selection: SeqVizSelection) => selection,
    rotateOnScroll: true,
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

  constructor(props: SeqVizProps) {
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
    { accession = "", annotations, backbone, enzymes, enzymesCustom, file, search }: SeqVizProps,
    { part }
  ) => {
    if (accession !== this.props.accession || backbone !== this.props.backbone || file !== this.props.file) {
      await this.setPart(); // new accession/remote ID
    }
    if (search.query !== this.props.search.query || search.mismatch !== this.props.search.mismatch) {
      this._search(part); // new search parameters
    }
    if (!isEqual(enzymes, this.props.enzymes)) {
      this.cut(part); // new set of enzymes for digest
    }
    if (!isEqual(enzymesCustom, this.props.enzymesCustom)) {
      this.cut(part);
    }
    if (!isEqual(annotations, this.props.annotations)) {
      this.setState({ annotations: this.parseAnnotations(this.props.annotations, this.props.seq) });
    }
  };

  /**
   * Set the part from a file or an accession ID
   */
  setPart = async () => {
    const { accession, file, seq } = this.props;

    try {
      if (accession) {
        const part = await externalToPart(accession, this.props);
        this.setState({
          part: {
            ...part,
            annotations: this.parseAnnotations(part.annotations, part.seq)
          }
        });
        this._search(part);
        this.cut(part);
      } else if (file) {
        const parts = await filesToParts(file, this.props);

        this.setState({
          part: {
            ...parts[0],
            annotations: this.parseAnnotations(parts[0].annotations, parts[0].seq)
          }
        });
        this._search(parts[0]);
        this.cut(parts[0]);
      } else if (seq) {
        this.cut({ seq });
      } else {
        console.warn("No 'seq', 'file', or 'accession' provided to SeqViz... Nothing to render");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Search for the query sequence in the part sequence, set in state
   */
  _search = (part: Part | null = null) => {
    const {
      onSearch,
      search: { query, mismatch },
      seq
    } = this.props;

    if (!(seq || (part && part.seq))) {
      return;
    }

    const results = search(query, mismatch, seq || (part && part.seq) || "");
    if (isEqual(results, this.state.search)) {
      return;
    }

    this.setState({ search: results });

    onSearch(results);
  };

  /**
   * Find and save enzymes' cutsite locations
   */
  cut = (part: { seq: string } | null = null) => {
    const { enzymes, seq, enzymesCustom } = this.props;

    let cutSites: Element[] = [];
    if (enzymes.length || (enzymesCustom && Object.keys(enzymesCustom).length)) {
      cutSites = cutSitesInRows(seq || (part && part.seq) || "", enzymes, enzymesCustom);
    }

    this.setState({ cutSites });
  };

  /**
   * Modify the annotations to add unique ids, fix directionality and
   * modulo the start and end of each to match SeqViz's API
   */
  parseAnnotations = (annotations: Annotation[] | null = null, seq: string = "") =>
    (annotations || []).map((a, i) => ({
      ...annotationFactory(i, this.props.colors),
      ...a,
      direction: directionality(a.direction),
      start: a.start % (seq.length + 1),
      end: a.end % (seq.length + 1)
    }));

  /**
   * Update the central index of the linear or circular viewer
   */
  setCentralIndex = (type: "linear" | "circular", value: number) => {
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
  setSelection = (selection: SeqVizSelection) => {
    const { onSelection } = this.props;

    this.setState({ selection });

    onSelection(selection);
  };

  render() {
    const { style, viewer } = this.props;
    let { compSeq, name, seq, showComplement } = this.props;
    const { centralIndex, cutSites, part, search, selection } = this.state;
    let { annotations } = this.state;

    // part is either from a file/accession, or each prop was set
    const _seq: string = seq || part.seq || "";
    if (getSeqType(_seq) === "dna") {
      compSeq = compSeq || part.compSeq || dnaComplement(_seq).compSeq;
    } else {
      compSeq = "";
    }
    showComplement = !!compSeq && showComplement;

    name = name || part.name || "";
    annotations = annotations && annotations.length ? annotations : part.annotations || [];

    if (!_seq.length) {
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
        showComplement={showComplement}
        compSeq={compSeq}
        name={name}
        seq={_seq}
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
        showComplement={showComplement}
        name={name}
        seq={_seq}
        cutSites={cutSites}
        Circular
      />
    );
    const bothFlipped = viewer === "both_flip";
    const viewers = bothFlipped ? [linear, circular] : [circular, linear];

    return (
      <div className="la-vz-seqviz" style={style}>
        <CentralIndexContext.Provider value={centralIndex}>
          <SelectionContext.Provider value={selection}>{viewers.filter(v => v).map(v => v)}</SelectionContext.Provider>
        </CentralIndexContext.Provider>
      </div>
    );
  }
}
