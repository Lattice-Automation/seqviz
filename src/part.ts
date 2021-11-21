export interface Annotation {
  start: number;
  end: number;
  name: string;
  direction: number;
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
