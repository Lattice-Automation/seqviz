import * as React from "react";

import { COLOR_BORDER_MAP, darkerColor } from "../colors";
import { InputRefFunc, NameRange } from "../elements";
import { FindXAndWidthElementType } from "./SeqBlock";

const hoverOtherAnnotationRows = (className: string, opacity: number) => {
  if (!document) return;
  const elements = document.getElementsByClassName(className) as HTMLCollectionOf<HTMLElement>;
  for (let i = 0; i < elements.length; i += 1) {
    elements[i].style.fillOpacity = `${opacity}`;
  }
};

/**
 * Render each row of annotations into its own row.
 * This is not a default export for sake of the React component displayName.
 */
const AnnotationRows = (props: {
  annotationRows: NameRange[][];
  bpsPerBlock: number;
  elementHeight: number;
  findXAndWidth: FindXAndWidthElementType;
  firstBase: number;
  fullSeq: string;
  inputRef: InputRefFunc;
  lastBase: number;
  seqBlockRef: unknown;
  width: number;
  yDiff: number;
}) => (
  <g>
    {props.annotationRows.map((anns: NameRange[], i: number) => (
      <AnnotationRow
        key={`annotation-linear-row-${anns[0].id}-${props.firstBase}-${props.lastBase}`}
        annotations={anns}
        bpsPerBlock={props.bpsPerBlock}
        findXAndWidth={props.findXAndWidth}
        firstBase={props.firstBase}
        fullSeq={props.fullSeq}
        height={props.elementHeight}
        inputRef={props.inputRef}
        lastBase={props.lastBase}
        seqBlockRef={props.seqBlockRef}
        width={props.width}
        y={props.yDiff + props.elementHeight * i}
      />
    ))}
  </g>
);

export default AnnotationRows;

/**
 * A single row of annotations. Multiple of these may be in one seqBlock
 * vertically stacked on top of one another in non-overlapping arrays.
 */
const AnnotationRow = (props: {
  annotations: NameRange[];
  bpsPerBlock: number;
  findXAndWidth: FindXAndWidthElementType;
  firstBase: number;
  fullSeq: string;
  height: number;
  inputRef: InputRefFunc;
  lastBase: number;
  seqBlockRef: unknown;
  width: number;
  y: number;
}) => (
  <g
    className="la-vz-linear-annotation-row"
    height={props.height * 0.8}
    transform={`translate(0, ${props.y})`}
    width={props.width}
  >
    {props.annotations.map((a, i) => (
      <SingleNamedElement
        {...props} // include overflowLeft in the key to avoid two split annotations in the same row from sharing a key
        key={`annotation-linear-${a.id}-${i}-${props.firstBase}-${props.lastBase}`}
        element={a}
        elements={props.annotations}
        index={i}
      />
    ))}
  </g>
);

/**
 * SingleNamedElement is a single rectangular element in the SeqBlock.
 * It does a bunch of stuff to avoid edge-cases from wrapping around the 0-index,
 * edge of blocks, etc.
 */
const SingleNamedElement = (props: {
  bpsPerBlock: number;
  element: NameRange;
  elements: NameRange[];
  findXAndWidth: FindXAndWidthElementType;
  firstBase: number;
  fullSeq: string;
  height: number;
  index: number;
  inputRef: InputRefFunc;
  lastBase: number;
  seqBlockRef: unknown;
}) => {
  const { element, elements, findXAndWidth, firstBase, index, inputRef, lastBase, seqBlockRef } = props;

  const { color, direction, end, name, start } = element;
  const forward = direction === 1;
  const reverse = direction === -1;
  const { overflowLeft, overflowRight, width, x: origX } = findXAndWidth(index, element, elements);
  const crossZero = start > end && end < firstBase;

  // does the element begin or end within this seqBlock with a directionality?
  const endFWD = forward && end > firstBase && end <= lastBase;
  const endREV = reverse && start >= firstBase && start <= lastBase;

  // create padding on either side, vertically, of an element
  const height = props.height * 0.8;

  const cW = 4; // jagged cutoff width
  const cH = height / 4; // jagged cutoff height
  const [x, w] = [origX, width];

  // create the SVG path, starting at the topLeft and working clockwise
  // there is additional logic here for if the element overflows
  // to the left or right of this seqBlock, where a "jagged edge" is created
  const topLeft = endREV ? `M ${2 * cW} 0` : "M 0 0";
  const topRight = endFWD ? `L ${width - 2 * cW} 0` : `L ${width} 0`;

  let linePath = "";
  let bottomRight = `L ${width} ${height}`; // flat right edge
  if ((overflowRight && width > 2 * cW) || crossZero) {
    bottomRight = `
        L ${width - cW} ${cH}
        L ${width} ${2 * cH}
        L ${width - cW} ${3 * cH}
        L ${width} ${4 * cH}`; // jagged right edge
  } else if (endFWD) {
    bottomRight = `
        L ${width} ${height / 2}
        L ${width - Math.min(2 * cW, w)} ${height}`; // arrow forward
  }

  let bottomLeft = `L 0 ${height} L 0 0`; // flat left edge
  if (overflowLeft && width > 2 * cW) {
    bottomLeft = `
        L 0 ${height}
        L ${cW} ${3 * cH}
        L 0 ${2 * cH}
        L ${cW} ${cH}
        L 0 0`; // jagged left edge
  } else if (endREV) {
    bottomLeft = `
        L ${Math.min(2 * cW, w)} ${height}
        L 0 ${height / 2}
        L ${Math.min(2 * cW, w)} 0`; // arrow reverse
  }
  linePath = `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;

  if ((forward && overflowRight) || (forward && crossZero)) {
    // If it's less than 15 pixels the double arrow barely fits
    if (width > 15) {
      linePath += `
        M ${width - 3 * cW} ${cH}
        L ${width - 2 * cW} ${2 * cH}
        L ${width - 3 * cW} ${3 * cH}
        M ${width - 4 * cW} ${cH}
        L ${width - 3 * cW} ${2 * cH}
        L ${width - 4 * cW} ${3 * cH}`; // add double arrow forward
    }
  } else if ((reverse && overflowLeft) || (reverse && crossZero)) {
    // If it's less than 15 pixels the double arrow barely fits
    if (width > 15) {
      linePath += `
        M ${3 * cW} ${3 * cH}
        L ${2 * cW} ${cH * 2}
        L ${3 * cW} ${cH}
        M ${4 * cW} ${3 * cH}
        L ${3 * cW} ${cH * 2}
        L ${4 * cW} ${cH}`; // add double forward reverse
    }
  }

  // determine whether the element name fits within the width of the element
  const nameLength = name.length * 6.75; // aspect ratio of roboto mono is ~0.66
  const nameFits = nameLength < width - 15;

  return (
    <g id={element.id} transform={`translate(${x}, ${0.1 * height})`}>
      <path
        ref={inputRef(element.id, {
          element: seqBlockRef,
          end: end,
          name: element.name,
          ref: element.id,
          start: start,
          type: "ANNOTATION",
        })}
        className={`${element.id} la-vz-annotation`}
        cursor="pointer"
        d={linePath}
        id={element.id}
        fill={color}
        stroke={color ? COLOR_BORDER_MAP[color] || darkerColor(color) : "gray"}
        onBlur={() => {
          // do nothing
        }}
        onFocus={() => {
          // do nothing
        }}
        onMouseOut={() => hoverOtherAnnotationRows(element.id, 0.7)}
        onMouseOver={() => hoverOtherAnnotationRows(element.id, 1.0)}
      />

      {nameFits && (
        <text
          className="la-vz-annotation-label"
          cursor="pointer"
          fontSize={11}
          id={element.id}
          dominantBaseline="middle"
          textAnchor="middle"
          x={width / 2}
          y={height / 2 + 1}
          onBlur={() => {
            // do nothing
          }}
          onFocus={() => {
            // do nothing
          }}
          onMouseOut={() => hoverOtherAnnotationRows(element.id, 0.7)}
          onMouseOver={() => hoverOtherAnnotationRows(element.id, 1.0)}
        >
          {name}
        </text>
      )}
    </g>
  );
};
