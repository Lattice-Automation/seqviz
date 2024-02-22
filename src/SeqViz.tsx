import * as React from "react";
import seqparse, { ParseOptions, parseFile } from "seqparse";

import SeqViewerContainer, { CustomChildrenProps, SeqVizChildRefs } from "./SeqViewerContainer";
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
  PrimerProp,
  Range,
  SeqType,
  TranslationProp,
} from "./elements";
import { isEqual } from "./isEqual";
import search from "./search";
import { ExternalSelection, Selection } from "./selectionContext";
import { complement, directionality, guessType, randomID } from "./sequence";

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

  /** Custom children to render within the SeqViz component. This is useful for when custom rendering the positioning of children viewers (Linear, Circular). */
  children?: (props: CustomChildrenProps) => React.ReactNode;

  /** a list of colors to populate un-colored annotations with. HEX, RGB, names are supported */
  colors?: string[];

  /** the complementary sequence to `seq`. Inferred by default. Ignored if `seqType: "aa"` */
  compSeq?: string;

  /** a callback that is applied within SeqViz on each keyboard event. If it returns truthy, the currently selected seq is copied */
  copyEvent?: (event: React.KeyboardEvent<HTMLElement>) => boolean;

  /**
   * if true SeqViz will not download fonts from external sites. Right now this only applies to Roboto Mono from Google Fonts. Set this
   * to true if you want to host the font yourself or cannot make requests for external assets. If true, you will need to host "Roboto Mono:300,400,500"
   */
  disableExternalFonts?: boolean;

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

  /** a list of primers to render above or below the sequences. At the time of writing, only the Linear viewer is supported. */
  primers: PrimerProp[];

  /** Refs associated with custom children. */
  refs?: SeqVizChildRefs;

  /** whether the circular viewer should rotate when the mouse scrolls over the plasmid */
  rotateOnScroll?: boolean;

  /** search parameters. Matched sequences on the viewer are highlighted and selectable. */
  search?: {
    mismatch?: number;
    query: string;
  };

  /** a callback that is applied within SeqViz on each keyboard event. If it returns truthy, the all seq is selected */
  selectAllEvent?: (event: React.KeyboardEvent<HTMLElement>) => boolean;

  /**
   * Externally managed selection.
   *
   * If passed, SeqViz uses this prop as the selection range, rather than the internally managed selection */
  selection?: ExternalSelection;

  /** a sequence to render. Can be DNA, RNA, or an amino acid sequence. Setting accession or file overrides this */
  seq?: string;

  /** the type of the sequence. If this isn't passed, the type is guessed */
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
  translations?: TranslationProp[];

  /** the orientation of the viewer(s). "both", the default, has a circular viewer on left and a linear viewer on right. */
  viewer?: "linear" | "circular" | "both" | "both_flip";

  /** how large to make the sequence and elements [0,100]. A larger zoom increases the size of text and elements for that viewer. */
  zoom?: {
    /**
     * how zoomed to make the circular viewer. default: 0
     *
     * @deprecated make a Github issue if this is a desired feature
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
    disableExternalFonts: false,
    enzymes: [],
    enzymesCustom: {},
    name: "",
    onSearch: (_: Range[]) => null,
    onSelection: (_: Selection) => null,
    primers: [],
    rotateOnScroll: true,
    search: { mismatch: 0, query: "" },
    selectAllEvent: e => e.key === "a" && (e.metaKey || e.ctrlKey),
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

    const seq = this.parseInput(props);
    this.state = {
      ...seq,
      ...this.search(props, seq.seq),
      ...this.cut(seq.seq, seq.seqType),
    };
  }

  /**
   * If an accession was provided, query it here.
   */
  componentDidMount(): void {
    if (typeof window !== "undefined") {
      // Allow the user to choose whether to load fonts from Google Fonts or from another source
      if (!this.props.disableExternalFonts) {
        // Fetch Roboto Mono, the only font used by SeqViz (at the time of writing)
        // https://github.com/typekit/webfontloader/issues/383#issuecomment-389627920
        /* eslint-disable */
        require("webfontloader").load({
          google: {
            families: ["Roboto Mono:300,400,500"],
          },
        });
      }
    }

    // Check if an accession was passed, we'll query it here if so
    const { accession } = this.props;
    if (!accession || !accession.length) {
      return;
    }

    // Query an accession to a sequence
    seqparse(accession, { cors: true }).then(parsed => {
      const seqType = guessType(parsed.seq);

      this.setState({
        annotations: this.parseAnnotations(parsed.annotations, parsed.seq),
        compSeq: complement(parsed.seq, seqType).compSeq,
        name: parsed.name,
        seq: parsed.seq,
        seqType,
        ...this.search(this.props, parsed.seq),
        ...this.cut(parsed.seq, seqType),
      });
    });
  }

  /** Log caught errors. */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught in SeqViz: %v %v", error, errorInfo);
  }

  /**
   * Re-parse props to state if there are changes to:
   * - seq/accession/file (this probably means we need to update the rest)
   * - search input changes
   * - enzymes change
   * - annotations
   *
   * This is needed for the parse(accession) call that makes an async fetch to a remote repository
   * https://reactjs.org/docs/react-component.html#componentdidupdate
   */
  componentDidUpdate = (
    // previous props
    { accession = "", annotations, enzymes, enzymesCustom, file, search }: SeqVizProps,
    // previous state
    { seq, seqType }: SeqVizState
  ) => {
    // New accession or file provided, fetch and/or parse.
    if (
      accession !== this.props.accession ||
      file !== this.props.file ||
      (this.props.seq && this.props.seq !== seq) ||
      (this.props.seqType && this.props.seqType !== seqType)
    ) {
      const input = this.parseInput();
      this.setState({
        annotations: input.annotations,
        compSeq: input.compSeq,
        name: input.name,
        seq: input.seq,
        seqType: input.seqType,
        ...this.search(this.props, input.seq),
        ...this.cut(input.seq, input.seqType),
      });
      return;
    }

    // New search parameters provided.
    if (
      search &&
      (!this.props.search || search.query !== this.props.search.query || search.mismatch !== this.props.search.mismatch)
    ) {
      this.setState(this.search(this.props, seq)); // new search parameters
    }

    // New digest parameters.
    if (!isEqual(enzymes, this.props.enzymes) || !isEqual(enzymesCustom, this.props.enzymesCustom)) {
      this.setState(this.cut(seq, seqType));
    }

    // New annotations provided.
    if (!isEqual(annotations, this.props.annotations)) {
      this.setState({
        annotations: this.parseAnnotations(this.props.annotations, this.props.seq),
      });
    }
  };

  /**
   * If a file is provided or a sequence is provided, parse it and its annotations.
   * If an accession is provided, query a remote repository and parse the sequence and annotations.
   */
  parseInput = (
    props?: SeqVizProps
  ): {
    annotations: Annotation[];
    compSeq: string;
    name: string;
    seq: string;
    seqType: SeqType;
  } => {
    const { annotations, compSeq, file, name = "", seq, seqType } = props || this.props;

    if (file) {
      // Parse a sequence file
      const parseOptions = {} as ParseOptions;
      if (file && file instanceof File) {
        parseOptions.fileName = file.name;
      }

      const parsed = parseFile(file.toString(), parseOptions);
      if (parsed.length) {
        const parsedSeqType = seqType ?? guessType(parsed[0].seq);
        return {
          annotations: this.parseAnnotations(parsed[0].annotations, parsed[0].seq),
          compSeq: complement(parsed[0].seq, parsedSeqType).compSeq,
          name: parsed[0].name,
          seq: parsed[0].seq,
          seqType: parsedSeqType,
        };
      }
    } else if (seq) {
      // Fill in default props just using the seq
      const parsedSeqType = seqType ?? guessType(seq);
      return {
        annotations: this.parseAnnotations(annotations, seq),
        compSeq: compSeq || complement(seq, parsedSeqType).compSeq,
        name,
        seq,
        seqType: parsedSeqType,
      };
    }

    return {
      annotations: [],
      compSeq: "",
      name: "",
      seq: "",
      seqType: "dna",
    };
  };

  /**
   * Search for the query sequence in the part sequence, set in state.
   */
  search = (props: SeqVizProps, seq: string): { search: NameRange[] } => {
    const { onSearch, search: searchProp, seqType } = props;

    if (!searchProp || !seq || !seq.length) {
      return { search: [] };
    }

    const results = search(searchProp.query, searchProp.mismatch, seq, seqType || guessType(seq));
    if (this.state && isEqual(results, this.state.search)) {
      return { search: this.state.search };
    }

    onSearch && onSearch(results);
    return { search: results };
  };

  /**
   * Find and save enzymes' cut-site locations.
   */
  cut = (seq: string, seqType: SeqType): { cutSites: CutSite[] } => ({
    cutSites: digest(seq || "", seqType, this.props.enzymes || [], this.props.enzymesCustom || {}),
  });

  /**
   * Fix annotations to add unique ids, fix directionality, and modulo the start and end of each.
   */
  parseAnnotations = (annotations: AnnotationProp[] | null = null, seq = ""): Annotation[] =>
    (annotations || []).map((a, i) => ({
      id: randomID(),
      ...a,
      color: a.color || colorByIndex(i, COLORS),
      direction: directionality(a.direction),
      end: a.end % (seq.length + 1),
      start: a.start % (seq.length + 1),
    }));

  render() {
    const { highlightedRegions, highlights, primers, showComplement, showIndex, style, zoom } = this.props;
    let { translations } = this.props;
    const { compSeq, seq, seqType } = this.state;

    // This is an unfortunate bit of seq checking. We could get a seq directly or from a file parsed to a part.
    if (!seq) return <div className="la-vz-seqviz" />;

    // If the seqType is aa, make the entire sequence the "translation"
    if (seqType === "aa") {
      // TODO: during some grand future refactor, make this cleaner and more transparent to the user
      translations = [{ direction: 1, end: seq.length, start: 0, name: "translation" }];
    }

    // Since all the props are optional, we need to parse them to defaults.
    const props = {
      bpColors: this.props.bpColors || {},
      copyEvent: this.props.copyEvent || (() => false),
      selectAllEvent: this.props.selectAllEvent || (() => false),
      cutSites: this.state.cutSites,
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
      onSelection:
        this.props.onSelection ||
        (() => {
          // do nothing
        }),
      primers: primers.map((p, i) => ({ color: colorByIndex(i), id: `primer${p.name}${i}${p.start}${p.end}`, ...p })),
      rotateOnScroll: !!this.props.rotateOnScroll,
      showComplement: (!!compSeq && (typeof showComplement !== "undefined" ? showComplement : true)) || false,
      showIndex: !!showIndex,
      translations: (translations || []).map(
        (
          t,
          i
        ): { direction: 1 | -1; end: number; start: number; color: string; id: string; name: string | undefined } => ({
          direction: t.direction ? (t.direction < 0 ? -1 : 1) : 1,
          end: seqType === "aa" ? t.end : t.start + Math.floor((t.end - t.start) / 3) * 3,
          start: t.start % seq.length,
          color: t.color || colorByIndex(i, COLORS),
          id: `translation${t.name}${i}${t.start}${t.end}`,
          name: t.name,
        })
      ),
      viewer: this.props.viewer || "both",
      zoom: {
        circular: typeof zoom?.circular == "number" ? Math.min(Math.max(zoom.circular, 0), 100) : 0,
        linear: typeof zoom?.linear == "number" ? Math.min(Math.max(zoom.linear, 0), 100) : 50,
      },
    };

    return (
      <div className="la-vz-seqviz" data-testid="la-vz-seqviz" style={{ height: "100%", width: "100%", ...style }}>
        <SeqViewerContainer {...this.props} {...props} {...this.state} />
      </div>
    );
  }
}
