import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";

import SeqViewerContainer from "./SeqViewer/SeqViewerContainer.jsx";
import "./viewer.scss";

/**
 * Export a React component directly for React-based development
 */
export { SeqViewerContainer as SeqViz };

/**
 * Export a part, pUC, for development
 */
export { default as pUC } from "./parts/pUC";

/**
 * Return an object with a `viewer` (React component), `viewerHTML` (HTML string),
 * and a `render` function for rendering the viewer to the `element`
 *
 * @param {ViewerOptions} options - The {ViewerOptions} for the viewer
 */
export const Viewer = (element = "root", options) => {
  // used to keep track of whether to re-render after a "set" call
  let rendered = false;
  // get the HTML element by ID or use as is if passed directly
  const domElement =
    element.constructor.name.startsWith("HTML") &&
    element.constructor.name.endsWith("Element")
      ? element
      : document.getElementById(element);
  let viewer = React.createElement(SeqViewerContainer, options, null);

  /**
   * Render the Viewer to the element passed
   */
  const render = () => {
    rendered = true;
    ReactDOM.render(viewer, domElement);
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
    viewer = React.createElement(SeqViewerContainer, options, null);

    if (rendered) {
      ReactDOM.render(viewer, domElement);
    }
  };

  return {
    render,
    renderToString,
    setState
  };
};
