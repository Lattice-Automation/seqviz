import { COLOR_BORDER_MAP } from "../../../../utils/colors";
import * as React from "react";
import tinycolor from "tinycolor2";

/**
 * Used to build up all the path elements. Does not include a display
 * of the annotation name or a line connecting name to annotation
 *
 * one central consideration here is that annotations might overlap with one another.
 * to avoid having those overalp visually, annotations are first moved into rows,
 * which are non-overlapping arrays or annotation arrays, which are then
 * used to create the array of array of annotation paths
 *
 * @type {Function}
 */
export default class Annotations extends React.PureComponent {
  /** during an annotation hover event, darken all other pieces of the same annotation */
  hoverAnnotation = (className, opacity) => {
    const elements = document
      .getElementById("la-vz-circular-annotations")
      .getElementsByClassName(className);
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].style.fillOpacity = opacity;
    }
  };

  /** given the interior color of an annotation, calculate the color of its border */
  calcBorderColor = fillColor => {
    const tColor = tinycolor(fillColor);
    const HslColor = tColor.toHsl();
    HslColor.s = HslColor.s + 0.1 > 1 ? (HslColor.s = 1) : (HslColor.s += 0.1);
    HslColor.l -= 0.26;
    const borderColor = tinycolor(HslColor);
    return `#${borderColor.toHex()}`;
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
      strokeLinejoin: "round"
    };
    // this is strictly here to create an invisible path that the
    // annotation name can follow
    const transparentPath = {
      stroke: "transparent",
      fill: "transparent"
    };
    const labelStyle = {
      cursor: "pointer"
    };

    return (
      <g id="la-vz-circular-annotations">
        {annotations.reduce((acc, anns, i) => {
          if (i) {
            currBRadius -= lineHeight + 3;
            currTRadius -= lineHeight + 3;
          } // increment the annRow radii if on every loop after first

          return acc.concat(
            anns.map(a => (
              <SingleAnnotation
                {...this.props}
                key={`la-vz-${a.id}-annotation-circular-row`}
                id={`la-vz-${a.id}-annotation-circular-row`}
                annotation={a}
                currBRadius={currBRadius}
                currTRadius={currTRadius}
                transparentPath={transparentPath}
                labelStyle={labelStyle}
                annStyle={annStyle}
                hoverAnnotation={this.hoverAnnotation}
                calcBorderColor={this.calcBorderColor}
              />
            ))
          );
        }, [])}
      </g>
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
    circularCentralIndex,
    lineHeight,
    transparentPath,
    inputRef,
    calcBorderColor,
    hoverAnnotation,
    annStyle,
    inlinedAnnotations,
    labelStyle
  } = props;

  // if it crosses the zero index, correct for actual length
  let annLength =
    a.end >= a.start ? a.end - a.start : seqLength - a.start + a.end;

  // can't make an arc from a full circle
  annLength = annLength === 0 ? seqLength - 0.1 : annLength;

  // how many degrees should it be rotated?
  const rotation = getRotation(a.start);

  if (currBRadius < 0 || currTRadius < 0) {
    return null;
  }

  const path = generateArc({
    innerRadius: currBRadius,
    outerRadius: currTRadius,
    length: annLength,
    largeArc: annLength > seqLength / 2,
    sweepFWD: true,
    arrowFWD: a.direction === "FORWARD",
    arrowREV: a.direction === "REVERSE"
  });

  // determine whether the annotation's name is in the top or bottom
  // half of the plasmid (used in rendering inline annotation)
  const annMiddle =
    (annLength / 2 + a.start + seqLength - circularCentralIndex) % seqLength; // in bps
  const bottomHalf =
    annMiddle > seqLength * 0.25 && annMiddle < seqLength * 0.75;

  // find the length from the start of the arc to its middle to adjust the name inward
  const topLengthToMid = Math.PI * (annLength / seqLength) * currBRadius;
  const bottomLengthToMid = Math.PI * (annLength / seqLength) * currTRadius;
  let lengthToMidpoint = topLengthToMid;
  if (!bottomHalf) {
    lengthToMidpoint += topLengthToMid + bottomLengthToMid;
    if (a.direction === "REVERSE") {
      lengthToMidpoint += 0.75 * lineHeight;
    } else if (a.direction === "NONE") {
      lengthToMidpoint += lineHeight;
    }
  }

  const circAnnID = `la-vz-${a.id}-circular`;
  return (
    <g id={`la-vz-${a.id}-annotation-circular`} transform={rotation}>
      <path id={circAnnID} d={path} {...transparentPath} />
      <path
        d={path}
        id={a.id}
        className={a.id}
        ref={inputRef(a.id, {
          ref: a.id,
          start: a.start,
          end: a.end,
          type: "ANNOTATION",
          element: null
        })}
        fill={a.color}
        stroke={
          COLOR_BORDER_MAP[a.color]
            ? COLOR_BORDER_MAP[a.color]
            : calcBorderColor(a.color)
        }
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
            alignmentBaseline="middle"
            startOffset={lengthToMidpoint}
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
