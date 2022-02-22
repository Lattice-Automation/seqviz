import * as React from "react";

export type InputRefFuncType = <T>(id: string, ref: unknown) => React.LegacyRef<T>;

export interface ISize {
  height: number;
  width: number;
}

export interface Primer {
  direction: 1 | -1;
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
  recogStrand: unknown;
}

export interface Coor {
  x: number;
  y: number;
}
