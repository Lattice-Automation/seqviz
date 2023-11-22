import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { COLOR_BORDER_MAP, darkerColor } from "../colors";
import { NameRange } from "../elements";
import { annotation, annotationLabel } from "../style";
import { FindXAndWidthElementType } from "./SeqBlock";

const hoverOtherPrimerRows = (className: string, opacity: number) => {
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
const PrimeRows = (props: {
  bpsPerBlock: number;
  direction: 1 | -1;
  elementHeight: number;
  findXAndWidth: FindXAndWidthElementType;
  firstBase: number;
  fullSeq: string;
  inputRef: InputRefFunc;
  lastBase: number;
  primerRows: NameRange[][];
  seqBlockRef: unknown;
  width: number;
  yDiff: number;
}) => (
  <g>
    {props.primerRows.map((primers: NameRange[], i: number) => (
      <PrimerRow
        key={`annotation-linear-row-${primers[0].id}-${props.firstBase}-${props.lastBase}`}
        bpsPerBlock={props.bpsPerBlock}
        direction={props.direction}
        findXAndWidth={props.findXAndWidth}
        firstBase={props.firstBase}
        fullSeq={props.fullSeq}
        height={props.elementHeight}
        inputRef={props.inputRef}
        lastBase={props.lastBase}
        primers={primers}
        seqBlockRef={props.seqBlockRef}
        width={props.width}
        y={props.yDiff + props.elementHeight * i}
      />
    ))}
  </g>
);

export default PrimeRows;

/**
 * A single row of annotations. Multiple of these may be in one seqBlock
 * vertically stacked on top of one another in non-overlapping arrays.
 */
const PrimerRow = (props: {
  bpsPerBlock: number;
  direction: 1 | -1;
  findXAndWidth: FindXAndWidthElementType;
  firstBase: number;
  fullSeq: string;
  height: number;
  inputRef: InputRefFunc;
  lastBase: number;
  primers: NameRange[];
  seqBlockRef: unknown;
  width: number;
  y: number;
}) => {
  return (
    <g
      className="la-vz-linear-annotation-row"
      height={props.height * 0.8}
      transform={`translate(0, ${props.y})`}
      width={props.width}
    >
      {props.primers
        .filter(a => a.direction == props.direction)
        .map((a, i) => (
          <SingleNamedElement
            {...props} // include overflowLeft in the key to avoid two split annotations in the same row from sharing a key
            key={`annotation-linear-${a.id}-${i}-${props.firstBase}-${props.lastBase}`}
            element={a}
            elements={props.primers}
            index={i}
          />
        ))}
    </g>
  );
};
/**
 * SingleNamedElement is a single rectangular element in the SeqBlock.
 * It does a bunch of stuff to avoid edge-cases from wrapping around the 0-index, edge of blocks, etc.
 */
const SingleNamedElement = (props: {
  element: NameRange;
  elements: NameRange[];
  findXAndWidth: FindXAndWidthElementType;
  firstBase: number;
  height: number;
  index: number;
  inputRef: InputRefFunc;
  lastBase: number;
}) => {
  const { element, elements, findXAndWidth, firstBase, index, inputRef, lastBase } = props;

  const { color, direction, end, name, start } = element;
  const forward = direction === 1;
  const reverse = direction === -1;
  const { overflowLeft, overflowRight, width, x: origX } = findXAndWidth(index, element, elements);
  const crossZero = start > end && end < firstBase;

  // does the element begin or end within this seqBlock with a directionality?
  const endFWD = forward && end > firstBase && end <= lastBase;
  const endREV = reverse && start >= firstBase && start <= lastBase;

  // create padding on either side, vertically, of an element
  const height = props.height * 0.7;

  const cW = 4; // jagged cutoff width
  const cH = height / 4; // jagged cutoff height
  const aH = 3; // arrow height at edges of primers
  const [x, w] = [origX, width];

  // create the SVG path, starting at the topLeft and working clockwise
  // there is additional logic here for if the element overflows
  // to the left or right of this seqBlock, where a "jagged edge" is created
  const topLeft = "M 0 0";
  const topRight = endFWD
    ? `
      L ${width - Math.min(8 * cW, w)} 0
      L ${width - Math.min(8 * cW, w)} ${-aH}
    `
    : `L ${width} 0`;

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
        L ${width} ${height}`; // arrow forward
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
        L ${Math.min(8 * cW, w)} ${height}
        L ${Math.min(8 * cW, w)} ${height + aH}`; // arrow reverse
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
  }
  if ((reverse && overflowLeft) || (reverse && crossZero)) {
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
  // 0.591 is our best approximation of Roboto Mono's aspect ratio (width / height).
  const fontSize = 12;
  const annotationCharacterWidth = 0.591 * fontSize;
  const availableCharacters = Math.floor((width - 40) / annotationCharacterWidth);

  // Ellipsize or hide the name if it's too long.
  let displayName = name;
  if (name.length > availableCharacters) {
    const charactersToShow = availableCharacters - 1;
    if (charactersToShow < 3) {
      // If we can't show at least three characters, don't show any.
      displayName = "";
    } else {
      displayName = `${name.slice(0, charactersToShow)}…`;
    }
  }

  return (
    <g id={element.id} transform={`translate(${x}, ${0.1 * height})`}>
      {/* <title> provides a hover tooltip on most browsers */}
      <title>{name}</title>
      <path
        ref={inputRef(element.id, {
          end: end,
          name: element.name,
          ref: element.id,
          start: start,
          type: "PRIMER",
          viewer: "LINEAR",
        })}
        className={`${element.id} la-vz-primer`}
        cursor="pointer"
        d={linePath}
        fill={color}
        id={element.id}
        stroke={color ? COLOR_BORDER_MAP[color] || darkerColor(color) : "gray"}
        style={annotation}
        onBlur={() => {
          // do nothing
        }}
        onFocus={() => {
          // do nothing
        }}
        onMouseOut={() => hoverOtherPrimerRows(element.id, 0.7)}
        onMouseOver={() => hoverOtherPrimerRows(element.id, 1.0)}
      />
      <text
        className="la-vz-primer-label"
        cursor="pointer"
        dominantBaseline="middle"
        fontSize={fontSize}
        id={element.id}
        style={annotationLabel}
        textAnchor="middle"
        x={width / 2}
        y={height / 2 + 1}
        onBlur={() => {
          // do nothing
        }}
        onFocus={() => {
          // do nothing
        }}
        onMouseOut={() => hoverOtherPrimerRows(element.id, 0.7)}
        onMouseOver={() => hoverOtherPrimerRows(element.id, 1.0)}
      >
        {displayName}
      </text>
    </g>
  );
};
