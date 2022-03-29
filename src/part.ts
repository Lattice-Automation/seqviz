export interface Element {
  start: number;
  end: number;
  direction: -1 | 1;
}

export interface Annotation extends Element {
  id: string;
  name: string;
  color: string;
  type: "enzyme" | "insert";
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
