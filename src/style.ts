import * as React from "react";

export const svgText: React.CSSProperties = {
  MozUserSelect: "none",
  WebkitUserSelect: "none",
  background: "none",
  fill: "rgb(42, 42, 42)",
  fontFamily: "Roboto Mono, Monaco, monospace",
  msUserSelect: "none",
  userSelect: "none",
};

export const search: React.CSSProperties = {
  cursor: "pointer",
  fill: "rgba(255, 251, 7, 0.5)",
};

export const highlight: React.CSSProperties = {
  cursor: "pointer",
  fill: "rgba(255, 251, 7, 0.25)",
  strokeWidth: 1,
};

export const selection: React.CSSProperties = {
  fill: "rgb(222, 246, 255)",
  shapeRendering: "auto",
};

export const selectionEdge: React.CSSProperties = {
  fill: "black",
  shapeRendering: "geometricPrecision",
  stroke: "black",
  strokeWidth: 1,
};

export const cutSite: React.CSSProperties = {
  fill: "transparent",
  shapeRendering: "auto",
  stroke: "rgb(115, 119, 125)",
  strokeWidth: 1,
};

export const cutSiteHighlight: React.CSSProperties = {
  cursor: "pointer",
  fill: "rgb(255, 251, 7)",
  fillOpacity: 0,
  shapeRendering: "auto",
  stroke: "rgb(115, 119, 125)",
  strokeWidth: 1,
};

export const indexLine: React.CSSProperties = {
  fill: "transparent",
  shapeRendering: "geometricPrecision",
  stroke: "rgb(115, 119, 125)",
  strokeWidth: 1,
};

export const indexTick: React.CSSProperties = {
  fill: "transparent",
  shapeRendering: "geometricPrecision",
  stroke: "rgb(115, 119, 125)",
  strokeWidth: 1,
};

export const indexTickLabel: React.CSSProperties = {
  ...svgText,
  fill: "rgb(115, 119, 125)",
  fontSize: 12,
  fontWeight: 300,
  textRendering: "optimizeLegibility",
};

export const annotation: React.CSSProperties = {
  fillOpacity: 0.7,
  shapeRendering: "geometricPrecision",
  strokeWidth: 0.5,
};

export const annotationLabel: React.CSSProperties = {
  ...svgText,
  color: "rgb(42, 42, 42)",
  fontWeight: 400,
  shapeRendering: "geometricPrecision",
  strokeLinejoin: "round",
  textRendering: "optimizeLegibility",
};

export const translationAminoAcidLabel: React.CSSProperties = {
  ...svgText,
  color: "rgb(42, 42, 42)",
  fontSize: 12,
  fontWeight: 400,
};

export const viewerCircular: React.CSSProperties = {
  cursor: "text",
  fontSize: 12,
  fontWeight: 300,
  margin: "auto",
};

export const circularLabel: React.CSSProperties = {
  ...svgText,
  cursor: "pointer",
};

export const circularLabelHover: React.CSSProperties = {
  ...circularLabel,
  textDecoration: "underline",
};

export const circularLabelLine: React.CSSProperties = {
  fill: "none",
  stroke: "rgb(158, 170, 184)",
  strokeWidth: 1,
};

export const linearScroller: React.CSSProperties = {
  cursor: "text",
  fontWeight: 300,
  height: "100%",
  outline: "none !important",
  overflowX: "hidden",
  overflowY: "scroll",
  padding: 10,
  position: "relative",
};

export const seqBlock: React.CSSProperties = {
  overflow: "visible",
  padding: 0,
  width: "100%",
};
