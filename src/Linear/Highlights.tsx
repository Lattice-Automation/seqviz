import * as React from "react";

import { InputRefFunc, NameRange } from "../elements";
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
  inputRef: InputRefFunc;
  lastBase: number;
  lineHeight: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
}) => (
  <>
    {/* We use two LinearFindBlocks here because we want to span both the top and bottom strand for a highlight */}
    {props.highlights.map((h, i) => (
      // TODO: what's going on here, why does this lead to duplicates
      <SingleHighlight key={`linear-highlight-${h.id}-${props.listenerOnly}`} {...props} highlight={h} index={i} />
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
  inputRef: InputRefFunc;
  lastBase: number;
  lineHeight: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
}) => {
  const { width, x } = props.findXAndWidth(props.index, props.highlight, props.highlights);

  let highlightStyle = {};
  if (props.listenerOnly) {
    highlightStyle = { fill: "transparent" };
  } else if (props.highlight.color) {
    highlightStyle = { fill: props.highlight.color };
  }

  const rectProps = {
    className: "la-vz-highlight",
    cursor: "pointer",
    height: props.lineHeight,
    id: props.highlight.id,
    stroke: props.listenerOnly ? "none" : "rgba(0, 0, 0, 0.5)",
    strokeWidth: 1,
    style: highlightStyle,
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
        y={props.indexYDiff}
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
        y={props.compYDiff}
      />
    </>
  );
};
