import * as React from "react";

import CentralIndexContext from "../centralIndexContext";
import { Coor, Size } from "../elements";
import { GenArcFunc, RENDER_SEQ_LENGTH_CUTOFF } from "./Circular";

interface IndexProps {
  center: Coor;
  compSeq: string;
  findCoor: (index: number, radius: number, rotate?: boolean) => Coor;
  genArc: GenArcFunc;
  getRotation: (index: number) => string;
  lineHeight: number;
  name: string;
  radius: number;
  rotateCoor: (coor: Coor, degrees: number) => Coor;
  seq: string;
  seqLength: number;
  showIndex: boolean;
  size: Size;
  totalRows: number;
  yDiff: number;
}

/**
 * The Index component renders the plasmid's:
 * 		1. name (center or bottom)
 * 		2. number of bps (center or bottom)
 * 		3. index circle
 * 		4. index ticks and numbers along the plasmid circle
 *
 * The center or bottom here refers to the fact that the name/bps of the
 * part need to be pushed to the bottom of the circular viewer if there
 * are too many elements in the circular viewer and the name won't fit
 */
export class Index extends React.PureComponent<IndexProps> {
  static contextType = CentralIndexContext;
  static context: React.ContextType<typeof CentralIndexContext>;
  declare context: React.ContextType<typeof CentralIndexContext>;

  static getDerivedStateFromProps = (nextProps: IndexProps) => {
    const { seqLength } = nextProps;
    let centralIndex = 0;
    if (this.context) {
      centralIndex = this.context.circular;
    }

    const tickCount = 6;
    // make each increment a multiple of 10 with two sig figs
    const increments = Math.floor(seqLength / tickCount);
    let indexInc = Math.max(+increments.toPrecision(2), 10);
    while (indexInc % 10 !== 0) indexInc += 1;

    // make all the ticks. Also, only keep ticks that are +/- 6 tick incremenets from the top
    // centralIndex, as the others won't be shown/rendered anyway
    let ticks: number[] = [];
    for (let i = 0; i <= seqLength - indexInc / 2; i += indexInc) {
      ticks.push(i === 0 ? 1 : i);
    }
    const tickTolerance = indexInc * 6;
    ticks = ticks.filter(
      t =>
        Math.abs(centralIndex - t) < tickTolerance ||
        Math.abs(centralIndex + seqLength - t) < tickTolerance ||
        Math.abs(centralIndex - seqLength - t) < tickTolerance
    );
    return { indexInc, ticks };
  };

  state = {
    indexInc: 10,
    ticks: [],
  };

  /**
   * return a react element for the basepairs along the surface of the plasmid viewer
   */
  renderBasepairs = () => {
    const { compSeq, findCoor, getRotation, lineHeight, radius, seq, seqLength } = this.props;
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

    const basepairsToRender: JSX.Element[] = [];
    for (let i = firstBase; i <= lastBase; i += 1) {
      basepairsToRender.push(
        <text
          key={`la-vz-base-${i}`}
          {...findCoor(0, radius + 2 * lineHeight)}
          dominantBaseline="middle"
          transform={getRotation(i)}
        >
          {seqForCircular.charAt(i)}
        </text>,
        <text
          key={`la-vz-base-comp-${i}`}
          {...findCoor(0, radius + lineHeight)}
          dominantBaseline="middle"
          transform={getRotation(i)}
        >
          {compSeqForCircular.charAt(i)}
        </text>
      );
    }
    return basepairsToRender;
  };

  render() {
    const {
      center,
      findCoor,
      genArc,
      getRotation,
      lineHeight,
      name,
      radius,
      seq,
      seqLength,
      showIndex,
      size,
      totalRows,
      yDiff,
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
    const nameSpans: string[] = [];
    let nameIndex = 0;

    // TODO: react freaks out when the circ viewer is small and each line is one char
    // bc there are shared keys (also it's just not a good look)
    while (nameIndex < name.length) {
      nameSpans.push(name.substring(nameIndex, nameIndex + cutoff).trim());
      nameIndex += cutoff;
    }

    // generate the name text for the middle of the plasmid
    const spanCountAdjust = 20 * nameSpans.length; // adjust for each tspan off name
    const nameYAdjust = 14 + spanCountAdjust; // correct for both
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
    const tickCoorEnd = findCoor(0, radius - 7);

    // create tick and text style
    const subtitleStyle = {
      fill: "gray",
      fontSize: 12,
      textAnchor: "middle",
    };

    // generate the full circle around the edge of the plasmid
    const indexCurve = genArc({
      innerRadius: radius,
      largeArc: true,
      length: seqLength / 2,
      outerRadius: radius,
    });

    return (
      <g>
        {/* A label showing the name of the plasmid */}
        <text fontSize={20} fontWeight={500} textAnchor="middle">
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

        {/* If less than cutoff long, render the bp of the plasmid */}
        {seq.length <= RENDER_SEQ_LENGTH_CUTOFF && <g className="la-vz-circular-bps">{this.renderBasepairs()}</g>}

        {/* The ticks and their index labels */}
        {ticks.map(t => (
          <g key={`la-vz-tick-${t}`} transform={getRotation(t - 0.5)}>
            <path
              className="la-vz-index-tick"
              d={`M ${tickCoorStart.x} ${tickCoorStart.y} L ${tickCoorEnd.x} ${tickCoorEnd.y}`}
            />
            <text
              className="la-vz-index-tick-label"
              fontSize={12}
              textAnchor="middle"
              x={tickCoorEnd.x}
              y={tickCoorEnd.y + lineHeight}
            >
              {t}
            </text>
          </g>
        ))}

        {/* The two arcs that make the plasmid's circle */}
        <g>
          <path className="la-vz-index-line" d={indexCurve} transform={getRotation(seqLength * 0.75)} />
          <path className="la-vz-index-line" d={indexCurve} transform={getRotation(seqLength * 0.25)} />
        </g>
      </g>
    );
  }
}
