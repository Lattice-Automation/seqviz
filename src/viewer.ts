import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";

import SeqViz from "./SeqViz/SeqViz";

/**
 * Export a React component directly for React-based development
 */
export { SeqViz };

/**
 * Export a part, pUC, for development
 */
export { default as pUC } from "./parts/pUC";

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
  let domElement: HTMLElement;
  if (typeof element === "string") {
    if (document.getElementById(element)) {
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'HTMLElement | null' is not assignable to typ... Remove this comment to see the full error message
      domElement = document.getElementById(element);
    } else {
      throw new Error(`Failed to find an element with ID: ${element}`);
    }
  } else {
    domElement = element;
  }
  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
   * @param {Object} state key-value map of ViewerSettings
   */
  const setState = state => {
    Object.keys(state).forEach(key => {
      if (!Object.keys(SeqViz.defaultProps).includes(key)) {
        console.error(`Unrecognized viewer setting: ${key}`);
      }
    });

    options = { ...options, ...state };
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
