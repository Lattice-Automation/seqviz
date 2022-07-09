import * as React from "react";

import { Annotation } from "../../part";
import { COLOR_BORDER_MAP, darkerColor } from "../../utils/colors";
import { Coor, ISize, InputRefFuncType } from "../common";
import CentralIndexContext from "../handlers/centralIndex";

interface AnnotationsProps {
  radius: number;
  center: Coor;
  lineHeight: number;
  seqLength: number;
  findCoor: (index: number, radius: number, rotate?: boolean) => Coor;
  getRotation: (index: number) => string;
  generateArc: (args: {
    innerRadius: number;
    outerRadius: number;
    length: number;
    largeArc: boolean; // see svg.arc large-arc-flag
    sweepFWD?: boolean;
    arrowFWD?: boolean;
    arrowREV?: boolean;
    offset?: number;
  }) => string;
  rotateCoor: (coor: Coor, degrees: number) => Coor;
  inputRef: InputRefFuncType;
  annotations: Annotation[][];
  size: ISize;
  rowsToSkip: number;
  inlinedAnnotations: string[];
}

/**
 * Used to build up all the path elements. Does not include a display
 * of the annotation name or a line connecting name to annotation
 *
 * Annotations might overlap with one another. To avoid that, annotations are first moved into rows -- non-overlapping
 * arrays or annotation arrays -- and then used to create the array of array of annotation paths.
 */
export default class Annotations extends React.PureComponent<AnnotationsProps> {
  /** during an annotation hover event, darken all other pieces of the same annotation */
  hoverAnnotation = (className: string, opacity: number) => {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i += 1) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'style' does not exist on type 'Element'.
      elements[i].style.fillOpacity = opacity;
    }
  };

  render() {
    const { radius, rowsToSkip, lineHeight, annotations } = this.props;

    // at least 3 rows inward from default radius (ie index row)
    const rowShiftHeight = lineHeight * rowsToSkip;
    const radiusAdjust = lineHeight * 3;
    let currBRadius = radius - radiusAdjust - rowShiftHeight;
    let currTRadius = currBRadius - lineHeight; // top radius

    return (
      <CentralIndexContext.Consumer>
        {({ circular }) => (
          <g className="la-vz-circular-annotations">
            {annotations.reduce((acc: any[], anns: Annotation[], i) => {
              if (i) {
                currBRadius -= lineHeight + 3;
                currTRadius -= lineHeight + 3;
              } // increment the annRow radii if on every loop after first

              return acc.concat(
                anns.map(ann => (
                  <SingleAnnotation
                    seqLength={this.props.seqLength}
                    getRotation={this.props.getRotation}
                    generateArc={this.props.generateArc}
                    lineHeight={lineHeight}
                    inputRef={this.props.inputRef}
                    inlinedAnnotations={this.props.inlinedAnnotations}
                    key={`la-vz-${ann.id}-annotation-circular-row`}
                    id={`la-vz-${ann.id}-annotation-circular-row`}
                    annotation={ann}
                    currBRadius={currBRadius}
                    currTRadius={currTRadius}
                    hoverAnnotation={this.hoverAnnotation}
                    calcBorderColor={darkerColor}
                    centralIndex={circular}
                  />
                ))
              );
            }, [])}
          </g>
        )}
      </CentralIndexContext.Consumer>
    );
  }
}

interface SingleAnnotationProps {
  annotation: Annotation;
  seqLength: number;
  getRotation: (index: number) => string;
  generateArc: (args: {
    innerRadius: number;
    outerRadius: number;
    length: number;
    largeArc: boolean; // see svg.arc large-arc-flag
    sweepFWD?: boolean;
    arrowFWD?: boolean;
    arrowREV?: boolean;
    offset?: number;
  }) => string;
  currBRadius: number;
  currTRadius: number;
  centralIndex: number;
  lineHeight: number;
  inputRef: InputRefFuncType;
  calcBorderColor: (c: any) => any;
  hoverAnnotation: (className: string, opacity: number) => void;
  inlinedAnnotations: string[];
  id: string;
}

/**
 * A component for a single annotation within the Circular Viewer
 *
 */
const SingleAnnotation = (props: SingleAnnotationProps) => {
  const {
    annotation: a,
    seqLength,
    getRotation,
    generateArc,
    currBRadius,
    currTRadius,
    centralIndex,
    lineHeight,
    inputRef,
    calcBorderColor,
    hoverAnnotation,
    inlinedAnnotations,
  } = props;

  // if it crosses the zero index, correct for actual length
  let annLength = a.end >= a.start ? a.end - a.start : seqLength - a.start + a.end;

  // can't make an arc from a full circle
  annLength = annLength === 0 ? seqLength - 0.1 : annLength;

  // how many degrees should it be rotated?
  const rotation = getRotation(a.start);

  if (currBRadius < 0 || currTRadius < 0) {
    return null;
  }

  //is name in top or bottom half?
  const mid = (annLength / 2 + a.start + seqLength - centralIndex) % seqLength;
  const bottomHalf = mid > seqLength * 0.25 && mid < seqLength * 0.75;

  const path = generateArc({
    innerRadius: currBRadius,
    outerRadius: currTRadius,
    length: annLength,
    largeArc: annLength > seqLength / 2,
    sweepFWD: true,
    arrowFWD: a.direction === 1,
    arrowREV: a.direction === -1,
  });
  const namePath = generateArc({
    innerRadius: bottomHalf ? currBRadius : currTRadius,
    outerRadius: bottomHalf ? currBRadius : currTRadius,
    length: annLength,
    largeArc: annLength > seqLength / 2,
    sweepFWD: true,
    arrowFWD: false,
    arrowREV: false,
  });

  const circAnnID = `la-vz-${a.id}-circular`;
  return (
    <g id={`la-vz-${a.id}-annotation-circular`} transform={rotation}>
      <path id={circAnnID} d={namePath} stroke="transparent" fill="transparent" />
      <path
        d={path}
        id={a.id}
        className={a.id}
        ref={inputRef(a.id, {
          ref: a.id,
          name: a.name,
          start: a.start,
          end: a.end,
          type: "ANNOTATION",
          direction: a.direction,
        })}
        style={{
          shapeRendering: "geometricPrecision",
          cursor: "pointer",
          fillOpacity: 0.7,
          strokeLinejoin: "round",
          fill: a.color,
          stroke: a.color ? COLOR_BORDER_MAP[a.color] || calcBorderColor(a.color) : "gray",
          strokeWidth: a.type === "insert" ? 2.4 : 0.5,
        }}
        onMouseOver={() => hoverAnnotation(a.id, 1.0)}
        onMouseOut={() => hoverAnnotation(a.id, 0.7)}
        onFocus={() => {}}
        onBlur={() => {}}
      />
      {inlinedAnnotations.includes(a.id) && (
        <text
          id={a.id}
          dy={-0.4 * lineHeight}
          onMouseOver={() => hoverAnnotation(a.id, 1.0)}
          onMouseOut={() => hoverAnnotation(a.id, 0.7)}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          <textPath
            id={a.id}
            textAnchor="middle"
            startOffset={bottomHalf ? "25%" : "75%"}
            dominantBaseline="middle"
            xlinkHref={`#${circAnnID}`}
            cursor="pointer"
          >
            {a.name}
          </textPath>
        </text>
      )}
    </g>
  );
};
