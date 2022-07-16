import * as React from "react";

import { Annotation, AnnotationProp, ColorRange, CutSite, Enzyme, Part, Ranged } from "../elements";
import externalToPart from "../io/externalToPart";
import filesToParts from "../io/filesToParts";
import digest from "../utils/digest";
import isEqual from "../utils/isEqual";
import { complement, directionality } from "../utils/parser";
import search from "../utils/search";
import { annotationFactory, guessType } from "../utils/sequence";
import SeqViewer from "./SeqViewer";
import CentralIndexContext from "./handlers/centralIndex";
import { Selection, SelectionContext, defaultSelection } from "./handlers/selection";
import "./style.css";

/** `SeqViz` props. See the README for more details. One of `seq`, `file` or `accession` is required. */
export interface SeqVizProps {
  /** an NCBI or iGEM accession to retrieve a sequence using */
  accession?: string;

  /** a list of annotations to render to the viewer */
  annotations?: AnnotationProp[];

  /** an iGEM backbone to render within the viewer */
  backbone?: string;

  /** nucleotides keyed by symbol or index and the color to apply to it */
  bpColors?: { [key: number | string]: string };

  /** a list of colors to populate un-colored annotations with. HEX, RGB, names are supported */
  colors?: string[];

  /** the complementary sequence to `seq`. Ignored if `seqType: "aa"` */
  compSeq?: string;

  /** a callback that is applied within SeqViz on each keyboard event. If it returns truthy, the currently selected seq is copied */
  copyEvent?: (event: React.KeyboardEvent<HTMLElement>) => boolean;

  /** a list of enzymes or enzyme names to digest the sequence with. see seqviz.Enzymes */
  enzymes?: string[];

  /** a map from enzyme name to definition for custom enzymes not already supported */
  enzymesCustom?: {
    [key: string]: Enzyme;
  };

  /** a file to parse and render. Genbank, FASTA, SnapGene, JBEI, SBOLv1/2, ab1, and SeqBuilder formats are supported */
  file?: string | File;

  /** ranges of the viewer to highlight. */
  highlightedRegions?: ColorRange[];

  /** the name of the sequence to show in the middle of the circular viewer */
  name?: string;

  /** a callback that's executed on each change to the search parameters or sequence */
  onSearch?: (search: Ranged[]) => void;

  /** a callback that's executed on each click of the sequence viewer. Selection includes meta about the selected element */
  onSelection?: (selection: Selection) => void;

  /** whether the circular viewer should rotate when the mouse scrolls over the plasmid */
  rotateOnScroll?: boolean;

  /** search parameters. Matched sequences on the viewer are highlighted and selectable. */
  search?: {
    mismatch?: number;
    query: string;
  };

  /** a sequence to render. Can be DNA, RNA, or an amino acid sequence. Setting accession or file overrides this */
  seq?: string;

  /** the type of the sequence. Without passing this, the type is guessed after ambiguous symbols (eg 'N') */
  seqType?: "dna" | "rna" | "aa";

  /** whether to render the annotation rows */
  showAnnotations?: boolean;

  /** whether to render the complement sequence */
  showComplement?: boolean;

  /** whether to show the index row that  */
  showIndex?: boolean;

  /** extra syle props to apply to the outermost div of SeqViz */
  style?: Record<string, unknown>;

  /** ranges of sequence that should have amino acid translations shown */
  translations?: Ranged[];

  /** the orientation of the viewer(s). "both", the default, has a circular viewer on left and a linear viewer on right. */
  viewer?: "linear" | "circular" | "both" | "both_flip";

  /** how large to make the sequence and elements [0,100]. A larger zoom increases the size of text and elements for that viewer. */
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
  cutSites: CutSite[];
  part: null | Part;
  search: Ranged[];
  selection: Selection;
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
    onSearch: (_: Ranged[]) => null,
    onSelection: (_: Selection) => null,
    rotateOnScroll: true,
    search: { mismatch: 0, query: "" },
    seq: "",
    showComplement: true,
    showIndex: true,
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
      console.warn(
        "Failed to parse input props %s, create an issue if this is bug: Create an issue if this is a bug: https://github.com/Lattice-Automation/seqviz/issues",
        err
      );
    }
  };

  /**
   * Search for the query sequence in the part sequence, set in state.
   */
  search = (part: Part | null) => {
    const { onSearch, search: searchProp, seqType } = this.props;
    const seq = this.props.seq || (part && part.seq) || "";

    if (!searchProp || !seq) {
      return;
    }

    const results = search(searchProp.query, searchProp.mismatch, seq, seqType || guessType(seq));

    // We should be able to call search on every significant prop change to seq/file/accession/search.
    // Instead, we run into infinite recursion. TODO: what's triggering repeated rerenders if we remove below.
    if (isEqual(results, this.state.search)) {
      return;
    }

    this.setState({ search: results });
    if (onSearch) onSearch(results);
  };

  /**
   * Find and save enzymes' cutsite locations.
   */
  cut = (part: { seq: string } | null = null) => {
    const { enzymes, enzymesCustom, seq } = this.props;

    let cutSites: CutSite[] = [];
    if ((enzymes && enzymes.length) || (enzymesCustom && Object.keys(enzymesCustom).length)) {
      cutSites = digest(seq || (part && part.seq) || "", enzymes || [], enzymesCustom || {});
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
  setSelection = (selection: Selection) => {
    const { onSelection } = this.props;
    this.setState({ selection });
    if (onSelection) {
      onSelection(selection);
    }
  };

  render() {
    const { name, showComplement, showIndex, style, zoom } = this.props;
    let { compSeq, seq, translations, viewer } = this.props;
    const { annotations, centralIndex, cutSites, part, search, selection } = this.state;

    // This is an unfortunate bit of seq checking. We could get a seq directly or from a file parsed to a part.
    seq = seq || part?.seq || "";
    const seqType = this.props.seqType || guessType(seq);
    if (!seq) return <div className="la-vz-seqviz" />;
    if (seqType === "dna") {
      compSeq = compSeq || part?.compSeq || complement(seq).compSeq || "";
    }
    if (seqType !== "dna" && translations && translations.length) {
      // TODO: this really shouldn't in render
      translations = [];
      console.warn(
        "Not rendering translations because seqType: %s. Create an issue if this is a bug: https://github.com/Lattice-Automation/seqviz/issues",
        seqType
      );
    }

    // Since all the props are optional, we need to parse them to defaults.
    const props = {
      ...this.props,
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
      showComplement: (!!compSeq && (typeof showComplement === "undefined" ? showComplement : true)) || false,
      showIndex: !!showIndex,
      translations: translations || [],
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
