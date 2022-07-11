/* Ranged is a single element with a range and direction in the viewer */
export interface Ranged {
  direction: -1 | 0 | 1;
  end: number;
  start: number;
}

/* NamedRanged elements have been parsed to include an id and name */
export interface NamedRanged extends Ranged {
  id: string;
  name: string;
}

/* DirectionProp is any of the directions for an element that we accept from a user */
export type DirectionProp = -1 | 0 | 1 | "FORWARD" | "REVERSE" | "FWD" | "REV" | "NONE" | "1" | "0" | "-1" | "NONSENSE";

/* AnnotationProp is an annotation provided to SeqViz via the annotations prop. */
export interface AnnotationProp {
  color?: string;
  direction?: DirectionProp;
  end: number;
  name: string;
  start: number;
}

/* Annotation is an annotation after parsing. */
export interface Annotation extends NamedRanged {
  color: string;
  type?: "enzyme" | "insert" | "";
}

/* Primer is a single primer for PCR. Not visualized right now. */
export interface Primer extends NamedRanged {
  color: string;
  direction: 1 | -1;
}

export interface Part {
  annotations: Annotation[];
  compSeq: string;
  cutSites: ICutSite[];
  name: string;
  primers: Primer[];
  seq: string;
}

export type InputRefFuncType = <T>(id: string, ref: unknown) => React.LegacyRef<T>;

export interface ISize {
  height: number;
  width: number;
}

export interface ICutSite extends NamedRanged {
  direction: 1 | -1;
  end: number;
  fcut: number;
  highlightColor?: string;
  rcut: number;
  recogEnd: number;
  recogStart: number;
  type?: "enzyme" | "annotation";
}

export interface Coor {
  x: number;
  y: number;
}

export interface IEnzyme {
  fcut: number;
  highlightColor?: string;
  rcut: number;
  rseq: string;
}
