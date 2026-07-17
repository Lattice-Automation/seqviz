import Circular from "./Circular/Circular";
import Linear from "./Linear/Linear";
import SeqViz, { SeqVizProps } from "./SeqViz";
import enzymes from "./enzymes";
import createBaseViewer from "./baseViewer";

/**
 * Export a React component directly for React-based development
 */
export { Circular, enzymes as Enzymes, Linear, SeqViz };

export default SeqViz;

export type { SeqVizProps } from "./SeqViz";

export type { CircularProps } from "./Circular/Circular";

export type { LinearProps } from "./Linear/Linear";

/**
 * Return a Viewer object with two properties:
 *  - `render` to an HTML element
 *  - `setState(options)` to update the viewer's internal state
 */
const Viewer = (element: string | HTMLElement = "root", options: SeqVizProps) => {
  const baseViewer = createBaseViewer(element, options);
  if (!baseViewer) return;

  const { render, setState } = baseViewer;

  return {
    render,
    setState,
  };
};

export { Viewer };
