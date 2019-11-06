import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";

import PartExplorer from "./PartExplorer/PartExplorer.jsx";
import "./viewer.scss";

/**
 * Export a default part, pUC, for development
 */
export { default as pUC } from "./parts/pUC";

/**
 * Return an object with a `viewer` (React component), `viewerHTML` (HTML string),
 * and a `render` function for rendering the viewer to the `element`
 */
export default (element = "root", viewerOptions) => {
  const options = {
    part: null,
    annotate: false,
    viewer: "both",
    showAnnotations: true,
    showPrimers: true,
    showComplement: true,
    showIndex: true,
    zoom: { circular: 0, linear: 50 },
    colors: [],
    onSelection: selection => {
      return selection;
    },
    onSearch: results => {
      return results;
    },
    searchNext: {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    copySeq: {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    searchQuery: { query: "", mismatch: 0 },
    backbone: "",
    enzymes: [],
    debug: false,
    ...viewerOptions
  };

  // log configuration options if debugging
  if (options.debug) {
    logConfig(options);
  }

  // create the React element and HTML for is not using React
  const viewerReact = React.createElement(PartExplorer, options, null);
  const viewerHTML = ReactDOMServer.renderToString(viewerReact);
  const render = () => {
    ReactDOM.render(viewerReact, domElement);
  };

  // get the HTML element by ID or use as is if passed directly
  const domElement =
    element.constructor.name.startsWith("HTML") &&
    element.constructor.name.endsWith("Element")
      ? element
      : document.getElementById(element);

  return {
    viewer: viewerReact,
    viewerHTML: viewerHTML,
    render: render
  };
};

/**
 * Log the part and viewer options passed to the component
 *
 * @param {ViewerOptions} options viewer configuration options
 */
const logConfig = options => {
  const {
    part,
    annotate,
    viewer: viewerType,
    showAnnotations,
    showPrimers,
    showComplement,
    showIndex,
    colors,
    zoom,
    backbone,
    searchQuery: { query, mismatch },
    enzymes
  } = options;

  const displayName = part.name
    ? part.name
    : part.constructor.name === "FileList"
    ? part[0].name
    : part;
  const displayType = viewerType;
  const displayAnnotate = annotate ? "on" : "off";
  const displayAnnotations = showAnnotations ? "on" : "off";
  const displayPrimers = showPrimers ? "on" : "off";
  const displayComplement = showComplement ? "on" : "off";
  const displayIndex = showIndex ? "on" : "off";
  const displayCustomColors = colors.length ? "yes" : "no";
  const displayZoomLinear =
    zoom.linear > 50
      ? zoom.linear - 50
      : zoom.linear < 50
      ? 0 - (50 - zoom.linear)
      : 0;
  const displayBackbone =
    displayName.startsWith("BB") && backbone.length
      ? `BioBrick Backbone : ${backbone}`
      : "";
  console.log(
    `
  ====================================================
  Current Part: ${displayName}
  Current seqviz Settings:
      Viewer Type: ${displayType} (circular | linear | both)
      Auto-annotation: ${displayAnnotate}
      Show Annotations: ${displayAnnotations}
      Show Primers: ${displayPrimers}
      Show Complement: ${displayComplement}
      Show Index: ${displayIndex}
      Using Custom Colors: ${displayCustomColors}
      Linear Zoom: ${displayZoomLinear} (-50 . 50)
      Searching for sequence "${query}" with ${mismatch} mismatch allowance
      Showing cut sites for enzymes: ${enzymes}
      ${displayBackbone}
  =====================================================
  `
  );
  if (viewerType === "circular" && query !== "") {
    console.warn(
      "Search visualization is only supported in Linear Sequence View."
    );
  }
};
