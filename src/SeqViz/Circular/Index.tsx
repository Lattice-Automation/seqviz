import * as React from "react";

import CentralIndexContext from "../handlers/centralIndex";

/**
 * this component renders the following:
 * 		1. the name (center or bottom)
 * 		2. the number of bps (center or bottom)
 * 		3. the plasmid circle
 * 		4. the index ticks and numbers along the plasmid circle
 *
 * center or bottom here refers to the fact that the name/bps of the
 * part need to be pushed to the bottom of the circular viewer if there
 * are too many elements in the circular viewer and the name won't fit
 */
export default class Index extends React.PureComponent {
  static contextType = CentralIndexContext;

  static getDerivedStateFromProps = nextProps => {
    const { seqLength } = nextProps;
    let centralIndex = 0;
    // @ts-expect-error ts-migrate(2334) FIXME: 'this' cannot be referenced in a static property i... Remove this comment to see the full error message
    if (this.context) {
      // @ts-expect-error ts-migrate(2334) FIXME: 'this' cannot be referenced in a static property i... Remove this comment to see the full error message
      centralIndex = this.context.circular;
    }

    const tickCount = 6;
    // make each increment a multiple of 10 with two sig figs
    const increments = Math.floor(seqLength / tickCount);
    let indexInc = Math.max(+increments.toPrecision(2), 10);
    while (indexInc % 10 !== 0) indexInc += 1;

    // make all the ticks. Also, only keep ticks that are +/- 6 tick incremenets from the top
    // centralIndex, as the others won't be shown/rendered anyway
    let ticks = [];
    for (let i = 0; i <= seqLength - indexInc / 2; i += indexInc) {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      ticks.push(i === 0 ? 1 : i);
    }
    const tickTolerance = indexInc * 6;
    ticks = ticks.filter(
      t =>
        Math.abs(centralIndex - t) < tickTolerance ||
        Math.abs(centralIndex + seqLength - t) < tickTolerance ||
        Math.abs(centralIndex - seqLength - t) < tickTolerance
    );
    return { ticks, indexInc };
  };

  context: any;

  state = {
    ticks: [],
    indexInc: 10,
  };

  /**
   * return a react element for the basepairs along the surface of the plasmid viewer
   */
  renderBasepairs = () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
    const { seq, compSeq, seqLength, lineHeight, radius, findCoor, getRotation } = this.props;
    const { indexInc } = this.state;
    const centralIndex = this.context.circular;

    // we should show all basepairs, with only 4 ticks
    const seqForCircular = seq + seq;
    const compSeqForCircular = compSeq + compSeq;
    let firstBase = centralIndex - indexInc * 5;
    let lastBase = centralIndex + indexInc * 5;
    if (centralIndex < seqLength / 2) {
      firstBase += seqLength;
      lastBase += seqLength;
    }
    const basepairsToRender = [];
    for (let i = firstBase; i <= lastBase; i += 1) {
      basepairsToRender.push(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Element' is not assignable to pa... Remove this comment to see the full error message
        <text key={`la-vz-base_${i}`} {...findCoor(0, radius + 2 * lineHeight)} transform={getRotation(i + 0.25)}>
          {seqForCircular.charAt(i)}
        </text>,
        <text key={`la-vz-base_comp_${i}`} {...findCoor(0, radius + lineHeight)} transform={getRotation(i + 0.25)}>
          {compSeqForCircular.charAt(i)}
        </text>
      );
    }
    return basepairsToRender;
  };

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
      seq,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      name,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'radius' does not exist on type 'Readonly... Remove this comment to see the full error message
      radius,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'center' does not exist on type 'Readonly... Remove this comment to see the full error message
      center,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'yDiff' does not exist on type 'Readonly<... Remove this comment to see the full error message
      yDiff,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seqLength' does not exist on type 'Reado... Remove this comment to see the full error message
      seqLength,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'lineHeight' does not exist on type 'Read... Remove this comment to see the full error message
      lineHeight,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getRotation' does not exist on type 'Rea... Remove this comment to see the full error message
      getRotation,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'generateArc' does not exist on type 'Rea... Remove this comment to see the full error message
      generateArc,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'findCoor' does not exist on type 'Readon... Remove this comment to see the full error message
      findCoor,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'totalRows' does not exist on type 'Reado... Remove this comment to see the full error message
      totalRows,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'showIndex' does not exist on type 'Reado... Remove this comment to see the full error message
      showIndex,
    } = this.props;
    const { ticks } = this.state;

    if (!showIndex) {
      return null; // don't waste time, don't show
    }

    // split up the name so it fits within spans in the center
    // 30 letters is arbitrary. would be better to first search for "cleaveable characters"
    // like "|" or "," and revert to all chars if those aren't found. Or to decrease
    // name size first before cleaving, etc
    const mostInwardElementRadius = radius - totalRows * lineHeight;
    const cutoff = 30;
    const nameSpans = [];
    let nameIndex = 0;
    // TODO: react freaks out when the circ viewer is small and each line is one char
    // bc there are shared keys (also it's just not a good look)
    while (nameIndex < name.length) {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
      nameSpans.push(name.substring(nameIndex, nameIndex + cutoff).trim());
      nameIndex += cutoff;
    }

    // generate the name text for the middle of the plasmid
    const spanCountAdjust = 20 * nameSpans.length; // adjust for each tspan off name
    const nameYAdjust = 14 + spanCountAdjust; // correct for both
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'length' does not exist on type 'never'.
    const nameCoorRadius = nameSpans.length ? (nameSpans[0].length / 2) * 12 : 0; // 12 px per character

    // if the elements will begin to overlap with the
    // name, move the name downward to the bottom of the viewer
    const nameCoor =
      nameCoorRadius > mostInwardElementRadius
        ? {
            x: center.x,
            y: size.height - nameYAdjust - yDiff,
          }
        : {
            x: center.x,
            y: center.y - ((nameSpans.length - 1) / 2) * 25, // shift the name up for >1 rows of text
          };

    // these are just created once, but are rotated to each position along the plasmid
    const tickCoorStart = findCoor(0, radius);
    const tickCoorEnd = findCoor(0, radius - 10);

    // create tick and text style
    const nameStyle = {
      fontSize: 20,
      textAnchor: "middle",
      fontWeight: 500,
    };
    const subtitleStyle = {
      fontSize: 14,
      textAnchor: "middle",
      fill: "gray",
    };
    const indexCircleStyle = {
      fill: "transparent",
      stroke: "#73777D",
      strokeWidth: 3,
    };
    const tickLineStyle = {
      fill: "transparent",
      stroke: "black",
      strokeWidth: 1,
      shapeRendering: "geometricPrecision",
    };
    const tickTextStyle = {
      textAnchor: "middle",
      fontWeight: 300,
    };

    // generate the full circle around the edge of the plasmid
    const indexCurve = generateArc({
      innerRadius: radius,
      outerRadius: radius,
      length: seqLength / 2,
      largeArc: true,
    });
    return (
      <g className="la-vz-circular-index">
        {/* A label showing the name of the plasmid */}
        <text {...nameStyle}>
          {nameSpans.map((n, i) => (
            <tspan key={n} x={nameCoor.x} y={nameCoor.y + i * 25}>
              {n}
            </tspan>
          ))}
        </text>

        {/* A label for the length of the plasmid */}
        <text x={nameCoor.x} y={nameCoor.y + 14 + 25 * (nameSpans.length - 1)} {...subtitleStyle}>
          {`${seqLength} bp`}
        </text>

        {/* If less than 200bp long, render the bp of the plasmid */}
        {seq.length < 200 ? <g className="la-vz-circular-bps">{this.renderBasepairs()}</g> : null}

        {/* The ticks and their index labels */}
        {ticks.map(t => (
          <g key={`la-vz-${t}_tick`} transform={getRotation(t - 0.5)}>
            <path
              d={`M ${tickCoorStart.x} ${tickCoorStart.y}
                L ${tickCoorEnd.x} ${tickCoorEnd.y}`}
              {...tickLineStyle}
            />
            <text x={tickCoorEnd.x} y={tickCoorEnd.y + lineHeight} {...tickTextStyle}>
              {t}
            </text>
          </g>
        ))}

        {/* The two arcs that make the plasmid's circle */}
        <g>
          <path d={indexCurve} transform={getRotation(seqLength * 0.75)} {...indexCircleStyle} />
          <path d={indexCurve} transform={getRotation(seqLength * 0.25)} {...indexCircleStyle} />
        </g>
      </g>
    );
  }
}
