export interface Element {
  start: number;
  end: number;
  direction: number;
}

export interface Label {
  start: number;
  end: number;
  type: "enzyme" | "annotation";
  name: string;
  id?: string;
}

export interface Annotation extends Element {
  id: string;
  name: string;
  color: string;
  type: string;
}

export interface Part {
  name: string;
  date: number;
  source: { name: string; file: string };
  seq: string;
  compSeq: string;
  annotations: Annotation[];
  note: string;
}
