import * as React from "react";

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
