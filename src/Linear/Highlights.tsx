import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { NameRange } from "../elements";
import { highlight as highlightStyle } from "../style";
import { FindXAndWidthElementType } from "./SeqBlock";

/**
 * Render rectangles around highlighted ranges.
 */
export const Highlights = (props: {
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

  let fill = highlightStyle.fill;
  if (props.listenerOnly) {
    // fill = "transparent";
  } else if (props.highlight.color?.length) {
    // fill = props.highlight.color;
  }

  const rectProps = {
    className: "la-vz-highlight",
    height: props.lineHeight,
    id: props.highlight.id,
    stroke: props.listenerOnly ? "none" : "rgba(0, 0, 0, 0.5)",
    fill,
    style: highlightStyle,
    width: width,
    x: x,
  };

  return (
    <>
      <rect
        key={`linear-highlight-${props.highlight.id}-top`}
        ref={props.inputRef(props.highlight.id, {
          ref: props.highlight.id,
          ...props.highlight,
          type: "HIGHLIGHT",
          viewer: "LINEAR",
        })}
        {...rectProps}
        fill="rgba(255, 251, 7, 0.25)"
        y={props.indexYDiff}
      />
      <rect
        key={`linear-highlight-${props.highlight.id}-bottom`}
        ref={props.inputRef(props.highlight.id, {
          ref: props.highlight.id,
          ...props.highlight,
          type: "HIGHLIGHT",
          viewer: "LINEAR",
        })}
        {...rectProps}
        fill="rgba(255, 251, 7, 0.25)"
        y={props.compYDiff}
      />
    </>
  );
};
