import * as React from "react";

import { Annotation, InputRefFuncType } from "../../../elements";
import { COLOR_BORDER_MAP, darkerColor } from "../../../utils/colors";
import { FindXAndWidthType } from "./SeqBlock";

interface AnnotationRowsProps {
  annotationRows: Annotation[][];
  bpsPerBlock: number;
  elementHeight: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  inputRef: InputRefFuncType;
  lastBase: number;
  seqBlockRef: unknown;
  width: number;
  yDiff: number;
}

/**
 * Render each row of annotations into its own row.
 *
 * This is not a default export for sake of the React component displayName
 */
const AnnotationRows = ({
  annotationRows,
  bpsPerBlock,
  elementHeight,
  findXAndWidth,
  firstBase,
  fullSeq,
  inputRef,
  lastBase,
  seqBlockRef,
  width,
  yDiff,
}: AnnotationRowsProps) => (
  <g className="la-vz-linear-annotations">
    {annotationRows.map((anns: Annotation[], i: number) => (
      <AnnotationRow
        key={`annotation-linear-row-${anns[0].id}-${firstBase}-${lastBase}`}
        annotations={anns}
        bpsPerBlock={bpsPerBlock}
        findXAndWidth={findXAndWidth}
        firstBase={firstBase}
        fullSeq={fullSeq}
        height={elementHeight}
        inputRef={inputRef}
        lastBase={lastBase}
        seqBlockRef={seqBlockRef}
        width={width}
        y={yDiff + elementHeight * i}
      />
    ))}
  </g>
);

/**
 * a single row of annotations. Multiple of these may be in one seqBlock
 * vertically stacked on top of one another in non-overlapping arrays
 */
interface AnnotationRowProps {
  annotations: Annotation[];
  bpsPerBlock: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  height: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  seqBlockRef: unknown;
  width: number;
  y: number;
}

class AnnotationRow extends React.PureComponent<AnnotationRowProps> {
  hoverOtherAnnotationRows = (className: string, opacity: number) => {
    const elements = document.getElementsByClassName(className) as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].style.fillOpacity = `${opacity}`;
    }
  };

  renderAnnotation = (a: Annotation, index: number) => {
    const { annotations, bpsPerBlock, findXAndWidth, firstBase, fullSeq, inputRef, lastBase, seqBlockRef } = this.props;

    const { color, direction, end, id, name, start } = a;
    const forward = direction === 1;
    const reverse = direction === -1;
    let { width, x: origX } = findXAndWidth(start, end);
    const crossZero = start > end && end < firstBase;

    // does the annotation begin or end within this seqBlock with a directionality?
    const endFWD = forward && end > firstBase && end <= lastBase;
    const endREV = reverse && start >= firstBase && start <= lastBase;

    // does the annotation overflow to the left or the right of this seqBlock?
    let overflowLeft = start < firstBase;
    let overflowRight = end > lastBase || (start === end && fullSeq.length > bpsPerBlock); // start === end means covers whole plasmid

    // if the annotation starts and ends in a SeqBlock, by circling all the way around,
    // it will be rendered twice (once from the firstBase to start and another from
    // end to lastBase)
    // eg: https://user-images.githubusercontent.com/13923102/35816281-54571e70-0a68-11e8-92eb-ab56884337ac.png
    const splitAnnotation =
      annotations.reduce((acc, ann) => {
        if (ann.id === a.id) {
          return acc + 1;
        }
        return acc;
      }, 0) > 1; // is this annotation in two pieces?

    if (splitAnnotation) {
      if (annotations.findIndex(ann => ann.id === a.id) === index) {
        // we're in the first half of the split annotation
        ({ width, x: origX } = findXAndWidth(firstBase, end));
        overflowLeft = true;
        overflowRight = false;
      } else {
        // we're in the second half of the split annotation
        ({ width, x: origX } = findXAndWidth(start, lastBase));
        overflowLeft = false;
        overflowRight = true;
      }
    } else if (start > end) {
      // the annotation crosses over the zero index and this needs to be accounted for
      // this is very similar to the Block rendering logic in ../Selection/Selection.jsx
      ({ width, x: origX } = findXAndWidth(
        start > lastBase ? firstBase : Math.max(firstBase, start),
        end < firstBase ? lastBase : Math.min(lastBase, end)
      ));

      // if this is the first part of annotation that crosses the zero index
      if (start > firstBase) {
        overflowLeft = true;
        overflowRight = end > lastBase;
      }

      // if this is the second part of an annotation, check if it overflows
      if (end < firstBase) {
        overflowLeft = start < firstBase;
        overflowRight = true;
      }
    } else if (start === end) {
      // the annotation circles the entire plasmid and we aren't currently in a SeqBlock
      // where the annotation starts or ends
      ({ width, x: origX } = findXAndWidth(start, end + fullSeq.length));
    }

    // create padding on either side, vertically, of an annotation
    const height = this.props.height * 0.8;

    const cW = 4; // jagged cutoff width
    const cH = height / 4; // jagged cutoff height
    const [x, w] = [origX, width];

    // create the SVG path, starting at the topLeft and working clockwise
    // there is additional logic here for if the annotation overflows
    // to the left or right of this seqBlock, where a "jagged edge" is created
    const topLeft = endREV ? `M ${2 * cW} 0` : "M 0 0";
    const topRight = endFWD ? `L ${width - 2 * cW} 0` : `L ${width} 0`;

    let linePath = "";
    if (a.type === "insert") {
      linePath = `${topLeft} ${topRight}`;
    } else {
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
    }

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

    let strokeColor = "";
    if (a.type === "insert" && color) {
      strokeColor = color;
    } else if (color) {
      strokeColor = COLOR_BORDER_MAP[color] || darkerColor(color);
    } else {
      strokeColor = "gray";
    }

    // determine whether the annotation name fits within the width of the annotation
    const nameLength = name.length * 6.75; // aspect ratio of roboto mono is ~0.66
    const nameFits = nameLength < width - 15;

    return (
      <g
        // include overflowLeft in the key to avoid two split annotations in the same row from sharing a key
        key={`annotation-linear-${id}-${firstBase}-${lastBase}-${overflowLeft}`}
        id={a.id}
        transform={`translate(${x}, ${0.1 * this.props.height})`}
      >
        <path
          ref={inputRef(a.id, {
            element: seqBlockRef,
            end: end,
            name: a.name,
            ref: a.id,
            start: start,
            type: "ANNOTATION",
          })}
          className={a.id}
          d={linePath}
          id={a.id}
          shapeRendering="geometricPrecision"
          style={{
            cursor: "pointer",
            fill: color,
            fillOpacity: 0.7,
            stroke: strokeColor,
            strokeWidth: a.type === "insert" ? 2.4 : 0.5,
          }}
          onBlur={() => 0}
          onFocus={() => 0}
          onMouseOut={() => this.hoverOtherAnnotationRows(a.id, 0.7)}
          onMouseOver={() => this.hoverOtherAnnotationRows(a.id, 1.0)}
        />

        {nameFits && (
          <text
            cursor="pointer"
            dominantBaseline="middle"
            fontSize={11}
            id={a.id}
            style={{
              color: "black",
              fontWeight: 400,
            }}
            textAnchor="middle"
            textRendering="optimizeLegibility"
            x={width / 2}
            y={height / 2 + 1}
            onBlur={() => {
              // do nothing
            }}
            onFocus={() => {
              // do nothing
            }}
            onMouseOut={() => this.hoverOtherAnnotationRows(a.id, 0.7)}
            onMouseOver={() => this.hoverOtherAnnotationRows(a.id, 1.0)}
          >
            {name}
          </text>
        )}
      </g>
    );
  };

  render() {
    const { annotations, height, width, y } = this.props;

    return (
      <g className="la-vz-linear-annotation-row" height={height * 0.8} transform={`translate(0, ${y})`} width={width}>
        {annotations.map(this.renderAnnotation)}
      </g>
    );
  }
}

export default AnnotationRows;
