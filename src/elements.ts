/* Element is a single element with a range in the viewer */
export interface Element {
  direction: -1 | 0 | 1;
  end: number;
  start: number;
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

/* Annotation is an annotation after parsing by SeqViz. */
export interface Annotation extends Element {
  color: string;
  id: string;
  name: string;
  type?: "enzyme" | "insert" | "";
}

/* Primer is a single primer for PCR. Not visualized right now. */
export interface Primer {
  color: string;
  direction: 1 | -1;
  end: number;
  id: string;
  name: string;
  start: number;
}

export interface Part {
  annotations: Annotation[];
  compSeq: string;
  cutSites: Element[];
  date: number;
  name: string;
  note: string;
  primers: Primer[];
  seq: string;
  source: { file: string; name: string };
}

export type InputRefFuncType = <T>(id: string, ref: unknown) => React.LegacyRef<T>;

export interface ISize {
  height: number;
  width: number;
}

export interface ICutSite {
  end: number;
  fcut: number;
  highlightColor?: string;
  id: string;
  name: string;
  rcut: number;
  recogEnd: number;
  recogStart: number;
  recogStrand: 1 | -1;
  start: number;
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
