import * as React from "react";

import { Annotation, AnnotationProp, Element, ICutSite, IEnzyme, Part } from "../elements";
import externalToPart from "../io/externalToPart";
import filesToParts from "../io/filesToParts";
import { cutSitesInRows } from "../utils/digest";
import isEqual from "../utils/isEqual";
import { directionality, dnaComplement } from "../utils/parser";
import search, { SearchResult } from "../utils/search";
import { annotationFactory, getSeqType } from "../utils/sequence";
import { HighlightRegion } from "./Linear/SeqBlock/LinearFind";
import SeqViewer from "./SeqViewer";
import CentralIndexContext from "./handlers/centralIndex";
import { SelectionContext, SeqVizSelection, defaultSelection } from "./handlers/selection";
import "./style.css";

export interface SeqVizProps {
  accession?: string;
  annotations?: AnnotationProp[];
  backbone?: string;
  bpColors?: { [key: number | string]: string };
  colors?: string[];
  compSeq?: string;
  copyEvent?: (event: React.KeyboardEvent<HTMLElement>) => boolean;
  enzymes?: string[];
  enzymesCustom?: {
    [key: string]: IEnzyme;
  };
  file?: string | File;
  highlightedRegions?: HighlightRegion[];
  name?: string;
  onSearch?: (search: SearchResult[]) => void;
  onSelection?: (selection: SeqVizSelection) => void;
  rotateOnScroll?: boolean;
  search?: {
    mismatch: number;
    query: string;
  };
  seq?: string;
  showAnnotations?: boolean;
  showComplement?: boolean;
  showIndex?: boolean;
  showPrimers?: boolean;
  style?: Record<string, unknown>;
  translations?: Element[];
  viewer?: "linear" | "circular" | "both" | "both_flip";
  zoom?: {
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
    search: { mismatch: 0, query: "" },
    seq: "",
    showComplement: true,
    showIndex: true,
    showPrimers: true,
    style: {},
    translations: [],
    viewer: "both",
    zoom: { circular: 0, linear: 50 },
  };

  constructor(props: SeqVizProps) {
    super(props);

    this.state = {
      accession: "",
      annotations: this.parseAnnotations(props.annotations, props.seq),
      centralIndex: {
        circular: 0,
        linear: 0,
        setCentralIndex: this.setCentralIndex,
      },
      cutSites: [],
      part: {},
      search: [],
      selection: { ...defaultSelection },
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
    if (
      search &&
      (!this.props.search || search.query !== this.props.search.query || search.mismatch !== this.props.search.mismatch)
    ) {
      this.search(part); // new search parameters
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
            annotations: this.parseAnnotations(part.annotations, part.seq),
          },
        });
        this.search(part);
        this.cut(part);
      } else if (file) {
        const parts = await filesToParts(file, this.props);

        this.setState({
          part: {
            ...parts[0],
            annotations: this.parseAnnotations(parts[0].annotations, parts[0].seq),
          },
        });
        this.search(parts[0]);
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
  search = (part: Part | null = null) => {
    const { onSearch, search: searchProp, seq } = this.props;

    if (!searchProp) {
      return;
    }

    if (!(seq || (part && part.seq))) {
      return;
    }

    const results = search(searchProp.query, searchProp.mismatch, seq || (part && part.seq) || "");
    if (isEqual(results, this.state.search)) {
      return;
    }

    this.setState({ search: results });

    if (onSearch) {
      onSearch(results);
    }
  };

  /**
   * Find and save enzymes' cutsite locations
   */
  cut = (part: { seq: string } | null = null) => {
    const { enzymes, enzymesCustom, seq } = this.props;

    let cutSites: ICutSite[] = [];
    if ((enzymes && enzymes.length) || (enzymesCustom && Object.keys(enzymesCustom).length)) {
      cutSites = cutSitesInRows(seq || (part && part.seq) || "", enzymes || [], enzymesCustom || {});
    }

    this.setState({ cutSites });
  };

  /**
   * Fix annotations to add unique ids, fix directionality, and modulo the start and end of each.
   */
  parseAnnotations = (annotations: AnnotationProp[] | null = null, seq = ""): Annotation[] =>
    (annotations || []).map((a, i) => ({
      ...annotationFactory(i, this.props.colors),
      ...a,
      direction: directionality(a.direction),
      end: a.end % (seq.length + 1),
      start: a.start % (seq.length + 1),
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
      centralIndex: { ...this.state.centralIndex, [type]: value },
    });
  };

  /**
   * Update selection in state. Should only be performed from handlers/selection.jsx
   */
  setSelection = (selection: SeqVizSelection) => {
    const { onSelection } = this.props;
    this.setState({ selection });
    if (onSelection) {
      onSelection(selection);
    }
  };

  render() {
    const { seq, style } = this.props;
    let { compSeq, name, showComplement, viewer, zoom } = this.props;
    const { centralIndex, cutSites, part, search, selection } = this.state;
    let { annotations } = this.state;

    // part is either from a file/accession, or each prop was set
    const localSeq: string = seq || part.seq || "";
    if (getSeqType(localSeq) === "dna") {
      compSeq = compSeq || part.compSeq || dnaComplement(localSeq).compSeq;
    } else {
      compSeq = "";
    }

    if (typeof showComplement === "undefined") {
      showComplement = true;
    }
    showComplement = !!compSeq && showComplement;

    if (typeof zoom === "undefined") {
      zoom = {
        circular: 0,
        linear: 50,
      };
    }

    name = name || part.name || "";
    annotations = annotations && annotations.length ? annotations : part.annotations || [];
    const highlightedRegions: HighlightRegion[] = this.props.highlightedRegions || [];

    if (!localSeq.length) {
      return <div className="la-vz-seqviz" />;
    }

    if (!viewer) {
      viewer = "both";
    }
    const linear = (viewer === "linear" || viewer.includes("both")) && (
      <SeqViewer
        key="linear"
        {...this.props}
        Circular={false}
        annotations={annotations}
        compSeq={compSeq}
        cutSites={cutSites}
        highlightedRegions={highlightedRegions}
        name={name}
        search={search}
        selection={selection}
        seq={localSeq}
        setSelection={this.setSelection}
        showComplement={showComplement}
        zoom={zoom}
      />
    );
    const circular = (viewer === "circular" || viewer.includes("both")) && (
      <SeqViewer
        key="circular"
        {...this.props}
        Circular={true}
        annotations={annotations}
        compSeq={compSeq}
        cutSites={cutSites}
        highlightedRegions={highlightedRegions}
        name={name}
        search={search}
        selection={selection}
        seq={localSeq}
        setSelection={this.setSelection}
        showComplement={showComplement}
        zoom={zoom}
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
