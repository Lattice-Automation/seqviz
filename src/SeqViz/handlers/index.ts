import * as React from "react";

import withEventHandler, { EventsHandlerProps, WithEventsProps } from "./events";
import withSelectionHandler, { SelectionHandlerProps, WithSelectionProps } from "./selection";

/**
 * Wrap the viewer with higher order components for sequence selection and event handling.
 */
export default <T extends EventsHandlerProps & SelectionHandlerProps & WithEventsProps & WithSelectionProps>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<Omit<T, "inputRef" | "mouseEvent" | "onUnmount">> =>
  withSelectionHandler(withEventHandler(WrappedComponent));
