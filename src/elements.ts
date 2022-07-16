/** Ranged is a single element with a range and direction in the viewer */
export interface Ranged {
  direction: -1 | 0 | 1;
  end: number;
  start: number;
}

/** NamedRanged elements have been parsed to include an id and name */
export interface NamedRanged extends Ranged {
  id: string;
  name: string;
}

/** DirectionProp is any of the directions for an element that we accept from a user */
export type DirectionProp = -1 | 0 | 1 | "FORWARD" | "REVERSE" | "FWD" | "REV" | "NONE" | "1" | "0" | "-1" | "NONSENSE";

/** AnnotationProp is an annotation provided to SeqViz via the annotations prop. */
export interface AnnotationProp {
  color?: string;
  direction?: DirectionProp;
  end: number;
  name: string;
  start: number;
}

/** Annotation is an annotation after parsing. */
export interface Annotation extends NamedRanged {
  color: string;
  type?: "enzyme" | "insert" | "";
}

/** Primer is a single primer for PCR. Not visualized right now. */
export interface Primer extends NamedRanged {
  color: string;
  direction: 1 | -1;
}

/** ColorRange is a region of the plasmid and the desired color for that region. */
export interface ColorRange {
  color?: string;
  end: number;
  start: number;
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
  fcut: number;
  color?: string;
  rcut: number;
  rseq: string;
}

/** a single recognition site on the sequence. */
export interface CutSite extends NamedRanged {
  /** `1` if top strand (`seq`), `-1` if bottom strand (`compSeq`) */
  direction: 1 | -1;
  /** name is the name of the enzyme that created this cut site */
  name: string;
  /** index relative to start index of the cut on the top strand */
  fcut: number;
  /** color to highlight the cutsite with. Empty string if it shouldn't be colored */
  color: string;
  /** index relative to start index of the cut on the bottom strand */
  rcut: number;
  recogEnd: number;
  recogStart: number;
}

/** supported input sequence types */
export type SeqType = "dna" | "rna" | "aa" | "unknown";
