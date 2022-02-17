import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";

import SeqViz from "./SeqViz/SeqViz";

/**
 * Export a React component directly for React-based development
 */
/**
 * Export a part, pUC, for development
 */
export { default as pUC } from "./parts/pUC";

export { SeqViz };

/**
 * Return a Viewer object with three properties:
 *  - `render` to an HTML element
 *  - `setState(options)` to update the viewer's internal state
 *  - `renderToString` to return an HTML representation of the Viewer
 */
export const Viewer = (element: string | HTMLElement = "root", options) => {
  // used to keep track of whether to re-render after a "set" call
  let rendered = false;
  // get the HTML element by ID or use as is if passed directly
  let domElement: HTMLElement | null;
  if (typeof element === "string") {
    if (document.getElementById(element)) {
      domElement = document.getElementById(element);
    } else {
      throw new Error(`Failed to find an element with ID: ${element}`);
    }
  } else {
    domElement = element;
  }
  // @ts-ignore
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
    return ReactDOMServer.renderToString(viewer);
  };

  /**
   * Update the viewer with new settings.
   *
   * Re-renders if render was already called.
   *
   
   */
  const setState = state => {
    Object.keys(state).forEach(key => {
      if (!Object.keys(SeqViz.defaultProps).includes(key)) {
        console.error(`Unrecognized viewer setting: ${key}`);
      }
    });

    options = { ...options, ...state };
    // @ts-ignore
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
