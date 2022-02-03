import * as React from "react";

import CentralIndexContext from "../handlers/centralIndex";
import { COLOR_BORDER_MAP, darkerColor } from "../../utils/colors";
import { Coor, SizeType } from "./Circular";
import { inputRefFuncType } from "../Linear/SeqBlock/Translations";
import { Annotation, Label } from "../../part";

interface AnnotationsViewerProps {
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
  inputRef: inputRefFuncType;
  annotations: Annotation[];
  size: SizeType;
  rowsToSkip: number;
  inlinedAnnotations: Label[];
}

/**
 * Used to build up all the path elements. Does not include a display
 * of the annotation name or a line connecting name to annotatino
 *
 * one central consideration here is that annotations might overlap with one another.
 * to avoid having those overalp visually, annotations are first moved into rows,
 * which are non-overlapping arrays or annotation arrays, which are then
 * used to create the array of array of annotation paths
 *
 * @type {Function}
 */
export default class AnnotationsViewer extends React.PureComponent<AnnotationsViewerProps> {
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

    // shared style object for inlining
    const annStyle = {
      strokeWidth: 0.5,
      shapeRendering: "geometricPrecision",
      cursor: "pointer",
      fillOpacity: 0.7,
      strokeLinejoin: "round",
    };
    // this is strictly here to create an invisible path that the
    // annotation name can follow
    const transparentPath = {
      stroke: "transparent",
      fill: "transparent",
    };
    const labelStyle = {
      cursor: "pointer",
    };

    return (
      <CentralIndexContext.Consumer>
        {({ circular }) => (
          <g className="la-vz-circular-annotations">
            {annotations.map((ann: Annotation, i) => {
              if (i) {
                currBRadius -= lineHeight + 3;
                currTRadius -= lineHeight + 3;
              } // increment the annRow radii if on every loop after first

              return (
                <SingleAnnotation
                  {...this.props}
                  key={`la-vz-${ann.id}-annotation-circular-row`}
                  id={`la-vz-${ann.id}-annotation-circular-row`}
                  annotation={ann}
                  currBRadius={currBRadius}
                  currTRadius={currTRadius}
                  transparentPath={transparentPath}
                  labelStyle={labelStyle}
                  annStyle={annStyle}
                  hoverAnnotation={this.hoverAnnotation}
                  calcBorderColor={darkerColor}
                  centralIndex={circular}
                />
              );
            })}
          </g>
        )}
      </CentralIndexContext.Consumer>
    );
  }
}

/**
 * A component for a single annotation within the Circular Viewer
 *
 * @param {AnnotationProps} props for a single Annotation
 */
const SingleAnnotation = props => {
  const {
    annotation: a,
    seqLength,
    getRotation,
    generateArc,
    currBRadius,
    currTRadius,
    centralIndex,
    lineHeight,
    transparentPath,
    inputRef,
    calcBorderColor,
    hoverAnnotation,
    annStyle,
    inlinedAnnotations,
    labelStyle,
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
      <path id={circAnnID} d={namePath} {...transparentPath} />
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
        fill={a.color}
        stroke={COLOR_BORDER_MAP[a.color] || calcBorderColor(a.color)}
        onMouseOver={() => hoverAnnotation(a.id, 1.0)}
        onMouseOut={() => hoverAnnotation(a.id, 0.7)}
        onFocus={() => {}}
        onBlur={() => {}}
        {...annStyle}
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
            {...labelStyle}
          >
            {a.name}
          </textPath>
        </text>
      )}
    </g>
  );
};
