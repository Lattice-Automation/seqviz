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
 *
 * @param {ViewerOptions} viewerOptions - The {ViewerOptions} for the viewer
 */
export const Viewer = (element = "root", viewerOptions) => {
  const options = {
    backbone: "",
    bpColors: {},
    colors: [],
    copySeq: {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    enzymes: [],
    onSearch: results => {
      return results;
    },
    onSelection: selection => {
      return selection;
    },
    part: null,
    searchNext: {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    searchQuery: { query: "", mismatch: 0 },
    showAnnotations: true,
    showComplement: true,
    showIndex: true,
    showPrimers: true,
    translations: [],
    viewer: "both",
    zoom: { circular: 0, linear: 50 },
    ...viewerOptions
  };

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
