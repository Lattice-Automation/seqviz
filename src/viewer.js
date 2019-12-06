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
  let options = {
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

  // used to keep track of whether to re-render after a "set" call
  let rendered = false;
  // get the HTML element by ID or use as is if passed directly
  const domElement =
    element.constructor.name.startsWith("HTML") &&
    element.constructor.name.endsWith("Element")
      ? element
      : document.getElementById(element);
  let viewer = React.createElement(PartExplorer, options, null);

  /**
   * Render the Viewer to the element passed
   */
  const render = () => {
    rendered = true;
    return ReactDOM.render(viewer, domElement);
  };

  /**
   * Return an HTML string representation of the viewer
   */
  const renderToString = () => {
    return ReactDOMServer.renderToString(viewer);
  };

  /**
   * Update the viewer with new settings.
   *
   * Re-renders if render was already called.
   *
   * @param {Object} state key-value map of ViewerSettings
   */
  const setState = state => {
    Object.keys(state).forEach(key => {
      if (!Object.keys(options).includes(key)) {
        console.error(`Invalid viewer setting: ${key}`);
      }
    });

    options = { ...options, ...state };
    viewer = React.createElement(PartExplorer, options, null);

    if (rendered) {
      return ReactDOM.render(viewer, domElement);
    }
  };

  return {
    render,
    renderToString,
    setState
  };
};
