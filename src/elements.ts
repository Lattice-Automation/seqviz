/** Range is a single element with a range and direction in the viewer */
export interface Range {
  direction: -1 | 0 | 1;
  end: number;
  start: number;
}

/** NameRange elements have been parsed to include an id and name */
export interface NameRange extends Range {
  color?: string;
  id: string;
  name: string;
}

/** AnnotationProp is an annotation provided to SeqViz via the annotations prop. */
export interface AnnotationProp {
  color?: string;
  direction?: number | string;
  end: number;
  name: string;
  start: number;
}

/** Annotation is an annotation after parsing. */
export interface Annotation extends NameRange {
  color: string;
}

/** Translation is a single translated CDS. */
export interface Translation extends NameRange {
  AAseq: string;
  direction: -1 | 1;
}

/** Primer is a single primer for PCR. Not visualized right now. */
export interface Primer extends NameRange {
  color: string;
  direction: 1 | -1;
}

/** HighlightProp is a region of the plasmid and the desired highlight for that region. */
export interface HighlightProp {
  color?: string;
  end: number;
  start: number;
}

/** Highlight is the processed version of HighlightProp */
export interface Highlight extends HighlightProp {
  color: string;
  /* direction is ignored for now */
  direction: 1 | -1;
  id: string;
  name: string;
}

export interface Part {
  annotations: Annotation[];
  compSeq: string;
  cutSites: CutSite[];
  name: string;
  primers: Primer[];
  seq: string;
}

export type InputRefFuncType = <T>(id: string, ref: unknown) => React.LegacyRef<T>;

export interface Size {
  height: number;
  width: number;
}

export interface Coor {
  x: number;
  y: number;
}

/** a single enzyme to use to digest the sequence with */
export interface Enzyme {
  /** an optional color to highlight the recognition site with */
  color?: string;

  /** the index of the cut-site on the forward strand relative to the start of the recognition site */
  fcut: number;

  /** name is the name of the enzyme. Used in the label above a cut-site */
  name: string;

  /** an optional range over which this enzyme's cut-sites should be limited */
  range?: {
    end: number;
    start: number;
  };

  /** the index of the cut-site on the reverse strand relative to the start of the recognition site */
  rcut: number;

  /** the recognition sequence */
  rseq: string;
}

/**
 * a single recognition site on the sequence
 *
 * TODO: it should be possible to remove name from below (it's on the enzyme)
 * and calc fcut/rcut from start/end + enzyme.fcut/rcut
 */
export interface CutSite extends NameRange {
  /** `1` if top strand (`seq`), `-1` if bottom strand (`compSeq`) */
  direction: 1 | -1;

  /** enzyme used to create this cut-site */
  enzyme: Enzyme;

  /** index relative to start index of the cut on the top strand */
  fcut: number;

  /** index relative to start index of the cut on the bottom strand */
  rcut: number;
}

/** supported input sequence types */
export type SeqType = "dna" | "rna" | "aa" | "unknown";
