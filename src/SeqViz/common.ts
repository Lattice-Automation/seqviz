import * as React from "react";

export type InputRefFuncType = <T>(id: string, ref: unknown) => React.LegacyRef<T>;

export interface ISize {
  height: number;
  width: number;
}

export interface ICutSite {
  fcut: number;
  rcut: number;
  start: number;
  end: number;
  type?: "enzyme" | "annotation";
  name: string;
  id: string;
  recogStart: number;
  recogEnd: number;
  recogStrand: 1 | -1;
  highlightColor?: string;
}

export interface Coor {
  x: number;
  y: number;
}

export interface IEnzyme {
  rseq: string;
  fcut: number;
  rcut: number;
  highlightColor?: string;
}
