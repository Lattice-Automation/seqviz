import * as React from "react";

import { Annotation, AnnotationProp, ICutSite, IEnzyme, Part, Ranged } from "../elements";
import externalToPart from "../io/externalToPart";
import filesToParts from "../io/filesToParts";
import { cutSitesInRows } from "../utils/digest";
import isEqual from "../utils/isEqual";
import { directionality, dnaComplement } from "../utils/parser";
import search from "../utils/search";
import { annotationFactory, getSeqType } from "../utils/sequence";
import { HighlightRegion } from "./Linear/SeqBlock/Find";
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
  onSearch?: (search: Ranged[]) => void;
  onSelection?: (selection: SeqVizSelection) => void;
  rotateOnScroll?: boolean;
  search?: {
    mismatch?: number;
    query: string;
  };
  seq?: string;
  showAnnotations?: boolean;
  showComplement?: boolean;
  showIndex?: boolean;
  showPrimers?: boolean;
  style?: Record<string, unknown>;
  translations?: Ranged[];
  viewer?: "linear" | "circular" | "both" | "both_flip";
  zoom?: {
    circular?: number;
    linear?: number;
  };
}

export interface SeqVizState {
  accession: string;
  annotations: Annotation[];
  centralIndex: {
    circular: number;
    linear: number;
    setCentralIndex: (type: "linear" | "circular", value: number) => void;
  };
  cutSites: ICutSite[];
  part: null | Part;
  search: Ranged[];
  selection: SeqVizSelection;
}

/**
 * SeqViz is a viewer for rendering sequences in a linear and/or circular viewer.
 */
export default class SeqViz extends React.Component<SeqVizProps, SeqVizState> {
  static defaultProps: SeqVizProps = {
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
    onSearch: (results: Ranged[]) => results,
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
      part: null,
      search: [],
      selection: { ...defaultSelection },
    };
  }

  componentDidMount = async () => {
    await this.setPart();
  };

  /*
   * Re-parse props to state if the seq/accession/file changed, the enzymes/enzymesCustom changed, or annotations changed
   */
  componentDidUpdate = async (
    { accession = "", annotations, backbone, enzymes, enzymesCustom, file, search }: SeqVizProps,
    { part }
  ) => {
    // New access or part provided, do a lookup.
    if (accession !== this.props.accession || backbone !== this.props.backbone || file !== this.props.file) {
      await this.setPart(); // new accession/remote ID
    }

    // New search parameters provided.
    if (
      search &&
      (!this.props.search || search.query !== this.props.search.query || search.mismatch !== this.props.search.mismatch)
    ) {
      this.search(part); // new search parameters
    }

    // New digest parameters.
    if (!isEqual(enzymes, this.props.enzymes) || !isEqual(enzymesCustom, this.props.enzymesCustom)) {
      this.cut(part);
    }

    // New annotations provided.
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
      console.warn(err);
    }
  };

  /**
   * Search for the query sequence in the part sequence, set in state.
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
   * Find and save enzymes' cutsite locations.
   */
  cut = (part: { seq: string } | null = null) => {
    const { enzymes, enzymesCustom, seq } = this.props;

    let cutSites: ICutSite[] = [];
    if ((enzymes && enzymes.length) || (enzymesCustom && Object.keys(enzymesCustom).length)) {
      cutSites = cutSitesInRows(seq || (part && part.seq) || "", enzymes || [], enzymesCustom || {});
    }

    if (!isEqual(cutSites, this.state.cutSites)) {
      this.setState({ cutSites });
    }
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
   * Update the central index of the linear or circular viewer.
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
    const { name, showComplement, showIndex, style, zoom } = this.props;
    let { compSeq, seq, viewer } = this.props;
    const { annotations, centralIndex, cutSites, part, search, selection } = this.state;

    // This is an unfortunate bit of seq checking. We could get a seq directly or from a file parsed to a part.
    seq = seq || part?.seq || "";
    if (getSeqType(seq) === "dna") {
      compSeq = compSeq || part?.compSeq || dnaComplement(seq).compSeq || "";
    }
    if (!seq) return <div className="la-vz-seqviz" />;

    // Since all the props are optional, we need to parse them to defaults.
    const props = {
      annotations: annotations && annotations.length ? annotations : part?.annotations || [],
      bpColors: this.props.bpColors || {},
      compSeq: compSeq || "",
      cutSites: cutSites,
      highlightedRegions: this.props.highlightedRegions || [],
      name: name || part?.name || "",
      search: search,
      selection: selection,
      seq: seq,
      setSelection: this.setSelection,
      showComplement: (!!compSeq && (typeof showComplement === "undefined" ? showComplement : true)) || true,
      showIndex: !!showIndex,
      translations: this.props.translations || [],
      zoom: {
        circular: zoom?.circular || 0,
        linear: zoom?.linear || 50,
      },
    };

    // Arrange the viewers based on the viewer prop.
    viewer = viewer || "both";
    const linear = (viewer === "linear" || viewer.includes("both")) && (
      <SeqViewer key="linear" Circular={false} {...props} />
    );
    const circular = (viewer === "circular" || viewer.includes("both")) && (
      <SeqViewer key="circular" Circular {...props} />
    );
    const bothFlipped = viewer === "both_flip";
    const viewers = bothFlipped ? [linear, circular] : [circular, linear];

    return (
      <div className="la-vz-seqviz" style={style}>
        <CentralIndexContext.Provider value={centralIndex}>
          <SelectionContext.Provider value={selection}>{viewers.filter(v => v)}</SelectionContext.Provider>
        </CentralIndexContext.Provider>
      </div>
    );
  }
}
