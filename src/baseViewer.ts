import * as React from "react";
import { Root, createRoot } from "react-dom/client";

import SeqViz, { SeqVizProps } from "./SeqViz";

/**
 * The base Viewer created by `createBaseViewer`. Shared by the node and browser
 * entrypoints. Intentionally imports only `react` and `react-dom/client` so it
 * is safe to bundle for the browser (no `react-dom/server` dependency).
 */
export interface BaseViewer {
  /** The current React element (used by the node entry for SSR). */
  readonly element: React.ReactElement;
  /** Render the Viewer to the element passed. */
  render: () => React.ReactElement;
  /** Update the viewer with new settings. Re-renders if render was already called. */
  setState: (state: SeqVizProps) => React.ReactElement;
}

/**
 * Create a Viewer bound to a DOM element. Returns `render`, `setState` and a live
 * `element` getter. The node entrypoint layers `renderToString` on top of this via
 * `element`; the browser entrypoint exposes only `render` and `setState`.
 */
const createBaseViewer = (element: string | HTMLElement = "root", options: SeqVizProps): BaseViewer | undefined => {
  // used to keep track of whether to re-render after a "set" call
  let root: Root | null = null;
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
    if (!root && domElement) {
      root = createRoot(domElement);
    }
    root?.render(viewer);
    return viewer;
  };

  /**
   * Update the viewer with new settings. Re-renders if render was already called.
   */
  const setState = (state: SeqVizProps) => {
    options = { ...options, ...state };
    viewer = React.createElement(SeqViz, options, null);

    if (root) {
      root.render(viewer);
    }
    return viewer;
  };

  return {
    get element() {
      return viewer;
    },
    render,
    setState,
  };
};

export default createBaseViewer;
