import * as React from "react";

/**
 * Used to build up all the path elements. Does not include a display
 * of the primer name or a line connecting name to primer
 *
 * one central consideration here is that primers might overlap with one another.
 * to avoid having those overalp visually, primers are first moved into rows,
 * which are non-overlapping arrays or primer arrays, which are then
 * used to create the array of array of primer paths
 *
 * When the Zoom is greater than 5, show the primer names in the primers
 * (move them to within the primer)
 *
 * @type {Function}
 */
export default class Primers extends React.PureComponent {
  hoverPrimer = (className, opacity) => {
    const elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].style.fillOpacity = opacity;
    }
  };

  render() {
    const { radius, rowsToSkip, Zoom, lineHeight, primers } = this.props;

    const rowShiftHeight = lineHeight * rowsToSkip;
    const radiusAdjust = lineHeight * 3;
    let currBRadius = radius - radiusAdjust - rowShiftHeight;

    // increasing the size of the primers during a "zoom"
    let currTRadius = currBRadius - lineHeight; // top radius

    return (
      <g id="circular-primers">
        {primers.reduce((acc, primerRows, i) => {
          if (i) {
            currBRadius -= lineHeight + 3;
            currTRadius -= lineHeight + 3;
          } // increment the primerRow radii if on every loop after first
          return acc.concat(
            primerRows.map(primer => (
              <SinglePrimer
                {...this.props}
                key={`${primer.id}-${primer.start}`}
                id={primer.id}
                primer={primer}
                currBRadius={currBRadius}
                currTRadius={currTRadius}
                Zoom={Zoom}
                hoverPrimer={this.hoverPrimer}
              />
            ))
          );
        }, [])}
      </g>
    );
  }
}

/**
 * A component for a single primer within the Circular Viewer
 *
 * @param {PrimerProps} props for a single Primer
 */
const SinglePrimer = props => {
  const {
    primer,
    seqLength,
    getRotation,
    generateArc,
    currBRadius,
    currTRadius,
    inputRef,
    hoverPrimer,
    Zoom
  } = props;

  // shared style object for inlining
  const primerStyle = {
    strokeWidth: Zoom > 30 ? 1 : 0.5,
    shapeRendering: "geometricPrecision",
    cursor: "pointer",
    fillOpacity: 0.2,
    strokeLinejoin: "round",
    fill: "#1b1d21",
    stroke: "#1b1d21"
  };

  // do not try to render primers without binding site information
  if (!primer.end || !primer.start) {
    return null;
  }

  // if it crosses the zero index, correct for actual length
  let primerLength =
    primer.end >= primer.start
      ? primer.end - primer.start
      : seqLength - primer.start + primer.end;

  // can't make an arc from a full circle
  primerLength = primerLength === 0 ? seqLength - 0.1 : primerLength;

  // how many degrees should it be rotated?
  const rotation = getRotation(primer.start);

  if (currBRadius < 0 || currTRadius < 0) {
    return null;
  }

  const path = generateArc({
    innerRadius: currBRadius,
    outerRadius: currTRadius,
    length: primerLength,
    largeArc: primerLength > seqLength / 2,
    sweepFWD: true,
    arrowFWD: primer.direction === 1,
    arrowREV: primer.direction === -1,
    isInsert: primer.type === "insert"
  });

  return (
    <g id={primer.id} transform={rotation}>
      <path
        d={path}
        id={primer.id}
        className={primer.id}
        ref={inputRef(primer.id, {
          ref: primer.id,
          start: primer.start,
          end: primer.end,
          type: "PRIMER",
          element: null
        })}
        onMouseOver={() => hoverPrimer(primer.id, 0.3)}
        onMouseOut={() => hoverPrimer(primer.id, 0.2)}
        onFocus={() => {}}
        onBlur={() => {}}
        {...primerStyle}
      />
    </g>
  );
};
