import * as React from "react";
import * as ReactDOM from "react-dom";
import { renderToString as reactRenderToString } from "react-dom/server";

import SeqViz, { SeqVizProps } from "./SeqViz";
import "./SeqViz.css";
import enzymes from "./enzymes";

/**
 * Export a React component directly for React-based development
 */
export { SeqViz, enzymes as Enzymes };

export default SeqViz;

export type { SeqVizProps } from "./SeqViz";

/**
 * Return a Viewer object with three properties:
 *  - `render` to an HTML element
 *  - `setState(options)` to update the viewer's internal state
 *  - `renderToString` to return an HTML representation of the Viewer
 */
const Viewer = (element: string | HTMLElement = "root", options: SeqVizProps) => {
  // used to keep track of whether to re-render after a "set" call
  let rendered = false;
  // get the HTML element by ID or use as is if passed directly
  let domElement: HTMLElement | null;
  if (!document) return;

  if (typeof element === "string") {
    if (document.getElementById(element)) {
      domElement = document.getElementById(element);
    } else {
      throw new Error(`Failed to find an element with ID: ${element}`);
    }
  } else {
    domElement = element;
  }
  let viewer = React.createElement(SeqViz, options, null);

  /**
   * Render the Viewer to the element passed
   */
  const render = () => {
    rendered = true;
    ReactDOM.render(viewer, domElement);
    return viewer;
  };

  /**
   * Return an HTML string representation of the viewer
   */
  const renderToString = () => {
    return reactRenderToString(viewer);
  };

  /**
   * Update the viewer with new settings. Re-renders if render was already called.
   */
  const setState = (state: SeqVizProps) => {
    options = { ...options, ...state };
    viewer = React.createElement(SeqViz, options, null);

    if (rendered) {
      ReactDOM.render(viewer, domElement);
    }
    return viewer;
  };

  return {
    render,
    renderToString,
    setState,
  };
};

export { Viewer };
