import * as React from "react";

type SelectionTypeEnum = "ANNOTATION" | "FIND" | "TRANSLATION" | "ENZYME" | "SEQ" | "AMINOACID" | "HIGHLIGHT" | "";

/* Selection holds meta about the viewer(s) active selection. */
export interface Selection {
  clockwise?: boolean;
  color?: string;
  direction?: number;
  end?: number;
  id?: string;
  length?: number;
  name?: string;
  parent?: Selection;
  ref?: null | string;
  start?: number;
  type: SelectionTypeEnum;
  viewer?: "LINEAR" | "CIRCULAR";
}

/** Initial/default selection */
export const defaultSelection: Selection = {
  clockwise: true,
  end: 0,
  length: 0,
  name: "",
  ref: null,
  start: 0,
  type: "",
};

/** Default context object */
const SelectionContext = React.createContext(defaultSelection);
SelectionContext.displayName = "SelectionContext";

export default SelectionContext;
