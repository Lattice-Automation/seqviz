import withEventRouter from "./eventRouter";
import withSelectionHandler from "./selectionHandler";

/**
 * sequentially apply all the Sequence Viewer HOCs
 *
 * this is just merging the HOCs into a single function to simplfy appling
 * them to the Circular and Linear viewers (one function rather than 4 (or however many there are))
 */
export default WrappedViewer =>
  withSelectionHandler(withEventRouter(WrappedViewer));
