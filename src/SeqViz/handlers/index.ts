import * as React from "react";

import withEventHandler, { WithEventsProps } from "./events";
import withSelectionHandler, { WithSelectionProps } from "./selection";

/**
 * Wrap the viewer with higher order components for sequence selection and event handling.
 */
export default <T extends WithEventsProps & WithSelectionProps>(
  WrappedViewer: React.ComponentType<Omit<T, keyof WithEventsProps & WithSelectionProps>>
) => withSelectionHandler(withEventHandler(WrappedViewer));
