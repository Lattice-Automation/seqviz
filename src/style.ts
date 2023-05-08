// My css.d.ts file
import type * as CSS from "csstype";

declare module "csstype" {
  interface Properties {
    // Allow namespaced CSS Custom Properties
    [index: `--theme-${string}`]: any;

    // Allow any CSS Custom Properties
    [index: `--${string}`]: any;

    // ...or allow any other property
    [index: string]: any;

    // Add a CSS Custom Property
    "--theme-color"?: "black" | "white";

    // Add a missing property
    WebkitRocketLauncher?: string;
  }
}

export const svgText: CSS.Properties = {
  MozUserSelect: "none",
  WebkitUserSelect: "none",
  background: "none",
  fill: "rgb(42, 42, 42)",
  fontFamily: "Roboto Mono, Monaco, monospace",
  msUserSelect: "none",
  userSelect: "none",
};

export const search: CSS.Properties = {
  cursor: "pointer",
  fill: "rgba(255, 251, 7, 0.5)",
};

export const highlight: CSS.Properties = {
  cursor: "pointer",
  fill: "rgba(255, 251, 7, 0.25)",
  strokeWidth: "1",
};

export const selection: CSS.Properties = {
  fill: "rgb(222, 246, 255)",
  shapeRendering: "auto",
};

export const selectionEdge: CSS.Properties = {
  fill: "black",
  shapeRendering: "geometricPrecision",
  stroke: "black",
};

export const cutSite: CSS.Properties = {
  fill: "transparent",
  shapeRendering: "auto",
  stroke: "rgb(115, 119, 125)",
  strokeWidth: "1",
};

export const cutSiteHighlight: CSS.Properties = {
  cursor: "pointer",
  fill: "rgb(255, 251, 7)",
  fillOpacity: 0,
  shapeRendering: "auto",
  stroke: "rgb(115, 119, 125)",
  strokeWidth: "1",
};

export const indexLine: CSS.Properties = {
  fill: "transparent",
  shapeRendering: "geometricPrecision",
  stroke: "rgb(115, 119, 125)",
  strokeWidth: "1",
};

export const indexTick: CSS.Properties = {
  fill: "transparent",
  shapeRendering: "geometricPrecision",
  stroke: "rgb(115, 119, 125)",
  strokeWidth: "1",
};

export const indexTickLabel: CSS.Properties = {
  ...svgText,
  fill: "rgb(115, 119, 125)",
  fontSize: "12",
  fontWeight: 300,
  textRendering: "optimizeLegibility",
};

export const annotation: CSS.Properties = {
  fillOpacity: "0.7",
  shapeRendering: "geometricPrecision",
  strokeWidth: "0.5",
};

export const annotationLabel: CSS.Properties = {
  ...svgText,
  color: "rgb(42, 42, 42)",
  fontWeight: 400,
  shapeRendering: "geometricPrecision",
  strokeLinejoin: "round",
  textRendering: "optimizeLegibility",
};

export const translationAminoAcidLabel: CSS.Properties = {
  ...svgText,
  color: "rgb(42, 42, 42)",
  fontSize: "12",
  fontWeight: 400,
};

export const viewerCircular: CSS.Properties = {
  cursor: "text",
  fontSize: "12",
  fontWeight: 300,
  margin: "auto",
};

export const circularLabel: CSS.Properties = {
  ...svgText,
  cursor: "pointer",
};

export const circularLabelHover: CSS.Properties = {
  ...circularLabel,
  textDecoration: "underline",
};

export const circularLabelLine: CSS.Properties = {
  fill: "none",
  stroke: "rgb(158, 170, 184)",
  strokeWidth: "1",
};

export const linearScroller: CSS.Properties = {
  cursor: "text",
  fontWeight: 300,
  height: "100%",
  outline: "none !important",
  overflowX: "hidden",
  overflowY: "scroll",
  padding: "10",
  position: "relative",
};

export const seqBlock: CSS.Properties = {
  overflow: "visible",
  padding: 0,
  width: "100%",
};

export const linearOneRowScroller: CSS.Properties = {
  cursor: "text",
  fontWeight: 300,
  height: "100%",
  outline: "none !important",
  overflowX: "auto",
  overflowY: "hidden",
  padding: "10",
  position: "relative",
};

export const linearOneRowSeqBlock: CSS.Properties = {
  padding: 0,
};
