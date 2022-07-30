import * as React from "react";

import { InputRefFuncType, NameRange } from "../../../elements";
import randomid from "../../../utils/randomid";
import { FindXAndWidthElementType } from "./SeqBlock";

/**
 * Render rectangles aroun highlighted ranges.
 */
const Highlights = (props: {
  compYDiff: number;
  findXAndWidth: FindXAndWidthElementType;
  firstBase: number;
  highlights: NameRange[];
  indexYDiff: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
}) => (
  <>
    {/* We use two LinearFindBlocks here because we want to span both the top and bottom strand for a highlight */}
    {props.highlights.map((h, i) => (
      // TODO: what's going on here, why does this lead to duplicates
      <SingleHighlight key={`linear-highlight-${h.id}-${randomid()}`} {...props} highlight={h} index={i} />
    ))}
  </>
);

export default Highlights;

const SingleHighlight = (props: {
  compYDiff: number;
  findXAndWidth: FindXAndWidthElementType;
  firstBase: number;
  highlight: NameRange;
  highlights: NameRange[];
  index: number;
  indexYDiff: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
}) => {
  const { width, x } = props.findXAndWidth(props.index, props.highlight, props.highlights);

  const rectProps = {
    cursor: "pointer",
    height: 18,
    id: props.highlight.id,
    stroke: props.listenerOnly ? "none" : "rgba(0, 0, 0, 0.5)",
    strokeWidth: 1,
    style: { fill: props.listenerOnly ? "transparent" : props.highlight.color || "rgba(255, 251, 7, 0.5)" },
    width: width,
    x: x,
  };

  return (
    <>
      <rect
        key={`linear-highlight-${props.highlight.id}-top`}
        ref={props.inputRef(props.highlight.id, {
          element: props.highlight,
          ref: props.highlight.id,
          ...props.highlight,
          type: "HIGHLIGHT",
        })}
        {...rectProps}
        y={props.indexYDiff - 1}
      />
      <rect
        key={`linear-highlight-${props.highlight.id}-bottom`}
        ref={props.inputRef(props.highlight.id, {
          element: props.highlight,
          ref: props.highlight.id,
          ...props.highlight,
          type: "HIGHLIGHT",
        })}
        {...rectProps}
        y={props.compYDiff - 1}
      />
    </>
  );
};
