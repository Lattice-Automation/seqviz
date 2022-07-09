export interface Element {
  start: number;
  end: number;
  direction: -1 | 0 | 1;
}

/* DirectionProp is any of the directions for an element that we accept from a user */
export type DirectionProp = -1 | 0 | 1 | "FORWARD" | "REVERSE" | "FWD" | "REV" | "NONE" | "1" | "0" | "-1" | "NONSENSE";

/* AnnotationProp is an annotation provided to SeqViz via the annotations prop. */
export interface AnnotationProp {
  name: string;
  start: number;
  end: number;
  color?: string;
  direction?: DirectionProp;
}

/* Annotation is an annotation after parsing by SeqViz. */
export interface Annotation extends Element {
  id: string;
  name: string;
  color: string;
  type?: "enzyme" | "insert" | "";
}

/* Primer is a single primer for PCR. Not visualized right now. */
export interface Primer {
  start: number;
  end: number;
  id: string;
  name: string;
  color: string;
  direction: 1 | -1;
}

export interface Part {
  name: string;
  date: number;
  source: { name: string; file: string };
  seq: string;
  compSeq: string;
  annotations: Annotation[];
  cutSites: Element[];
  primers: Primer[];
  note: string;
}
