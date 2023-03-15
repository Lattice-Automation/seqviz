import * as React from "react";

export const svgText: React.CSSProperties = {
  fill: "rgb(42, 42, 42)",
  fontFamily: "Roboto Mono, Monaco, monospace",
  userSelect: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  background: "none",
};

export const search: React.CSSProperties = {
  fill: "rgba(255, 251, 7, 0.5)",
  cursor: "pointer",
};

export const highlight: React.CSSProperties = {
  fill: "rgba(255, 251, 7, 0.25)",
  cursor: "pointer",
  strokeWidth: 1,
};

export const selection: React.CSSProperties = {
  fill: "rgb(222, 246, 255)",
  shapeRendering: "auto",
};

export const selectionEdge: React.CSSProperties = {
  fill: "black",
  stroke: "black",
  strokeWidth: 1,
  shapeRendering: "geometricPrecision",
};

export const cutSite: React.CSSProperties = {
  fill: "transparent",
  shapeRendering: "auto",
  strokeWidth: 1,
  stroke: "rgb(115, 119, 125)",
};

export const cutSiteHighlight: React.CSSProperties = {
  cursor: "pointer",
  fill: "rgb(255, 251, 7)",
  fillOpacity: 0,
  shapeRendering: "auto",
  strokeWidth: 1,
  stroke: "rgb(115, 119, 125)",
};

export const indexLine: React.CSSProperties = {
  fill: "transparent",
  shapeRendering: "geometricPrecision",
  strokeWidth: 1,
  stroke: "rgb(115, 119, 125)",
};

export const indexTick: React.CSSProperties = {
  fill: "transparent",
  shapeRendering: "geometricPrecision",
  strokeWidth: 1,
  stroke: "rgb(115, 119, 125)",
};

export const indexTickLabel: React.CSSProperties = {
  ...svgText,
  fill: "rgb(115, 119, 125)",
  fontWeight: 300,
  textRendering: "optimizeLegibility",
  fontSize: 12,
};
