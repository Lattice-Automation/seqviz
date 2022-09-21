import * as React from "react";
import seqparse, { ParseOptions } from "seqparse";

import SeqViewerContainer from "./SeqViewerContainer";
import { COLORS, colorByIndex } from "./colors";
import digest from "./digest";
import {
  Annotation,
  AnnotationProp,
  CutSite,
  Enzyme,
  Highlight,
  HighlightProp,
  NameRange,
  Range,
  SeqType,
} from "./elements";
import { Selection } from "./handlers/selection";
import isEqual from "./isEqual";
import { complement, directionality } from "./parser";
import search from "./search";
import { annotationFactory, guessType } from "./sequence";

/** `SeqViz` props. See the README for more details. One of `seq`, `file` or `accession` is required. */
export interface SeqVizProps {
  /**
   * an NCBI or iGEM accession to retrieve a sequence using
   *
   * @deprecated use `...seqparse.parse(accession)` to fetch and parse the accession to SeqViz props
   */
  accession?: string;

  /** a list of annotations to render to the viewer */
  annotations?: AnnotationProp[];

  /**
   * an iGEM backbone to render within the viewer
   *
   * @deprecated append `backbone` to `props.seq`
   */
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
  enzymes?: (Enzyme | string)[];

  /**
   * a map from enzyme name to definition for custom enzymes not already supported
   *
   * @deprecated use `enzymes` for custom enzymes
   */
  enzymesCustom?: {
    [key: string]: Enzyme;
  };

  /**
   * a file to parse and render. Genbank, FASTA, SnapGene, JBEI, SBOLv1/2, ab1, and SeqBuilder formats are supported
   *
   * @deprecated use `...seqparse.parse(file)` outside of SeqViz to parse a file to SeqViz props
   */
  file?: string | File;

  /**
   * ranges of the viewer to highlight.
   *
   * @deprecated use `highlights`
   */
  highlightedRegions?: HighlightProp[];

  /** ranges of sequence to highlight on the viewer */
  highlights?: HighlightProp[];

  /** the name of the sequence to show in the middle of the circular viewer */
  name?: string;

  /** a callback that's executed on each change to the search parameters or sequence */
  onSearch?: (search: Range[]) => void;

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

  /** the type of the sequence. Without passing this, the type is guessed */
  seqType?: "dna" | "rna" | "aa";

  /**
   * whether to render the annotation rows
   *
   * @deprecated to avoid rendering annotations, don't pass any
   */
  showAnnotations?: boolean;

  /** whether to render the complement sequence */
  showComplement?: boolean;

  /** whether to show the index row with ticks and indexes  */
  showIndex?: boolean;

  /** extra style props to apply to the outermost div of SeqViz */
  style?: Record<string, unknown>;

  /** ranges of sequence that should have amino acid translations shown */
  translations?: { direction?: number; end: number; start: number }[];

  /** the orientation of the viewer(s). "both", the default, has a circular viewer on left and a linear viewer on right. */
  viewer?: "linear" | "circular" | "both" | "both_flip";

  /** how large to make the sequence and elements [0,100]. A larger zoom increases the size of text and elements for that viewer. */
  zoom?: {
    /**
     * how zoomed to make the circular viewer. default: 0
     *
     * @deprecated reach out if this is of interest
     */
    circular?: number;

    /** how zoomed to make the linear viewer. default: 50 */
    linear?: number;
  };
}

export interface SeqVizState {
  annotations: Annotation[];
  compSeq: string;
  cutSites: CutSite[];
  name: string;
  search: NameRange[];
  seq: string;
  seqType: SeqType;
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
    copyEvent: e => e.key === "c" && (e.metaKey || e.ctrlKey),
    enzymes: [],
    enzymesCustom: {},
    name: "",
    onSearch: (_: Range[]) => null,
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
      annotations: [],
      compSeq: "",
      cutSites: [],
      name: "",
      search: [],
      seq: "",
      seqType: "unknown",
    };
  }

  /** Log caught errors. */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught in SeqViz: %v %v", error, errorInfo);
  }

  componentDidMount = async () => {
    const input = await this.parseInput();

    this.setState(input);
    this.search(input.seq);
    this.cut(input.seq);
  };

  /*
   * Re-parse props to state if there are changes to:
   * - seq/accession/file (this probably means we need to update the rest)
   * - search input changes
   * - enzymes change
   * - annotations
   *
   * This is needed for the parse(accession) call that makes an async fetch to a remote repository
   * https://reactjs.org/docs/react-component.html#componentdidupdate
   */
  componentDidUpdate = async (
    // previous props
    { accession = "", annotations, enzymes, enzymesCustom, file, search }: SeqVizProps,
    // previous state
    { seq }: SeqVizState
  ) => {
    // New accession or file provided, fetch and/or parse.
    if (accession !== this.props.accession || file !== this.props.file || (this.props.seq && this.props.seq !== seq)) {
      const input = await this.parseInput();
      this.setState({
        annotations: input.annotations,
        compSeq: input.compSeq,
        name: input.name,
        seq: input.seq,
        seqType: input.seqType,
      });
      this.search(seq);
      this.cut(seq);
      return;
    }

    // New search parameters provided.
    if (
      search &&
      (!this.props.search || search.query !== this.props.search.query || search.mismatch !== this.props.search.mismatch)
    ) {
      this.search(seq); // new search parameters
    }

    // New digest parameters.
    if (!isEqual(enzymes, this.props.enzymes) || !isEqual(enzymesCustom, this.props.enzymesCustom)) {
      this.cut(seq);
    }

    // New annotations provided.
    if (!isEqual(annotations, this.props.annotations)) {
      this.setState({
        annotations: this.parseAnnotations(this.props.annotations, this.props.seq),
      });
    }
  };

  /**
   * If a file or accession were passed, parse it. This might be a call to a remote iGEM or NCBI server.
   */
  parseInput = async (): Promise<{
    annotations: Annotation[];
    compSeq: string;
    name: string;
    seq: string;
    seqType: SeqType;
  }> => {
    const { accession, annotations, file, seq } = this.props;
    const name = this.props.name || "";

    // Fetch the seq if we need to get it from a remote repository
    if (accession || file) {
      // Add settings for source buffer and name (for SnapGene)
      const parseOptions = {
        cors: true,
      } as ParseOptions;
      if (file && file instanceof File) {
        parseOptions.fileName = file.name;
        parseOptions.source = await file.arrayBuffer();
      }

      // Parse a sequence file or accession
      const parsed = await seqparse((accession || file || "").toString(), parseOptions);
      return {
        annotations: this.parseAnnotations(parsed.annotations, parsed.seq),
        compSeq: complement(parsed.seq).compSeq,
        name: parsed.name,
        seq: parsed.seq,
        seqType: guessType(parsed.seq),
      };
    } else if (seq) {
      // Fill in default props just using the seq
      return {
        annotations: this.parseAnnotations(annotations, seq),
        compSeq: complement(seq).compSeq,
        name,
        seq,
        seqType: guessType(seq),
      };
    }
    throw new Error("No 'seq', 'file', or 'accession' provided to SeqViz... Nothing to render");
  };

  /**
   * Search for the query sequence in the part sequence, set in state.
   */
  search = (seq: string) => {
    const { onSearch, search: searchProp, seqType } = this.props;

    if (!searchProp || !seq) {
      return;
    }

    const results = search(searchProp.query, searchProp.mismatch, seq, seqType || guessType(seq));
    if (isEqual(results, this.state.search)) {
      return;
    }

    this.setState({ search: results });
    onSearch && onSearch(results);
  };

  /**
   * Find and save enzymes' cutsite locations.
   */
  cut = (seq: string) => {
    const { enzymes, enzymesCustom } = this.props;

    let cutSites: CutSite[] = [];
    if ((enzymes && enzymes.length) || (enzymesCustom && Object.keys(enzymesCustom).length)) {
      cutSites = digest(seq || "", enzymes || [], enzymesCustom || {});
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
      color: a.color || colorByIndex(i, COLORS),
      direction: directionality(a.direction),
      end: a.end % (seq.length + 1),
      start: a.start % (seq.length + 1),
    }));

  render() {
    const { highlightedRegions, highlights, showComplement, showIndex, style, zoom } = this.props;
    let { translations } = this.props;
    const { compSeq, seq, seqType } = this.state;

    // This is an unfortunate bit of seq checking. We could get a seq directly or from a file parsed to a part.
    if (!seq) return <div className="la-vz-seqviz" />;

    if (seqType !== "dna" && translations && translations.length) {
      // TODO: this should have a warning, I just don't want to do it in render
      translations = [];
    }

    // Since all the props are optional, we need to parse them to defaults.
    const props = {
      bpColors: this.props.bpColors || {},
      highlights: (highlights || []).concat(highlightedRegions || []).map(
        (h, i): Highlight => ({
          ...h,
          direction: 1,
          end: h.end % (seq.length + 1),
          id: `highlight-${i}-${h.start}-${h.end}`,
          name: "",
          start: h.start % (seq.length + 1),
        })
      ),
      showComplement: (!!compSeq && (typeof showComplement !== "undefined" ? showComplement : true)) || false,
      showIndex: !!showIndex,
      translations: (translations || []).map((t): { direction: 1 | -1; end: number; start: number } => ({
        direction: t.direction ? (t.direction < 0 ? -1 : 1) : 1,
        end: t.start + Math.floor((t.end - t.start) / 3) * 3,
        start: t.start % seq.length,
      })),
      viewer: this.props.viewer || "both",
      zoom: {
        circular: typeof zoom?.circular == "number" ? Math.min(Math.max(zoom.circular, 0), 100) : 0,
        linear: typeof zoom?.linear == "number" ? Math.min(Math.max(zoom.linear, 0), 100) : 50,
      },
      onSelection:
        this.props.onSelection ||
        (() => {
          // do nothing
        }),
    };

    return (
      <div className="la-vz-seqviz" style={style}>
        <SeqViewerContainer {...props} {...this.state} />
      </div>
    );
  }
}
