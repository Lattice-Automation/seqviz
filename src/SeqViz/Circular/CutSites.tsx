import * as React from "react";

import { Coor, CutSite, InputRefFuncType } from "../../elements";
import { GenArcFunc, RENDER_SEQ_LENGTH_CUTOFF } from "./Circular";

interface CutSitesProps {
  center: Coor;
  cutSites: CutSite[];
  findCoor: (index: number, radius: number, rotate?: boolean) => Coor;
  genArc: GenArcFunc;
  getRotation: (index: number) => string;
  inputRef: InputRefFuncType;
  lineHeight: number;
  radius: number;
  rotateCoor: (coor: Coor, degrees: number) => Coor;
  selectionRows: number;
  seqLength: number;
}

const CutSites = (props: CutSitesProps) => {
  const { cutSites } = props;
  if (!cutSites.length) return null;

  const calculateLinePath = (index: number, startRadius: number, endRadius: number): string => {
    const { findCoor } = props;
    const lineStart = findCoor(index, startRadius);
    const lineEnd = findCoor(index, endRadius);
    return `M ${lineEnd.x} ${lineEnd.y} L ${lineStart.x} ${lineStart.y}`;
  };

  return (
    <g className="la-vz-circular-cutsites">
      {cutSites.map(c => (
        <SingleCutSite key={`circular-cut-site-${c.id}`} {...props} calculateLinePath={calculateLinePath} cutSite={c} />
      ))}
    </g>
  );
};

const SingleCutSite = (props: {
  calculateLinePath: (index: number, startRadius: number, endRadius: number) => string;
  center: Coor;
  cutSite: CutSite;
  findCoor: (index: number, radius: number, rotate?: boolean) => Coor;
  genArc: GenArcFunc;
  getRotation: (index: number) => string;
  inputRef: InputRefFuncType;
  lineHeight: number;
  radius: number;
  rotateCoor: (coor: Coor, degrees: number) => Coor;
  selectionRows: number;
  seqLength: number;
}) => {
  const { calculateLinePath, cutSite, genArc, getRotation, inputRef, lineHeight, radius, seqLength } = props;
  const { id, start } = cutSite;
  let { end, fcut, rcut } = cutSite;

  // crosses the zero index
  if (start + fcut > end + rcut) {
    end = start > end ? end + seqLength : end;
    if (fcut > rcut) {
      rcut += seqLength;
    } else {
      fcut += seqLength;
    }
  }

  // length for highlighted recog area
  const cutSiteLength = Math.abs(end - start);

  // const calc the size of the recog area radii
  const botR = radius;
  let midR = radius + 0.5 * lineHeight; // mid radius
  let topR = radius + lineHeight; // outer radius
  if (seqLength < RENDER_SEQ_LENGTH_CUTOFF) {
    midR += lineHeight + 1.5;
    topR += 2 * lineHeight + 1.5;
  }

  return (
    <g key={`la-vz-circular-cutsite-${id}`} id={`la-vz-circular-cutsite-${id}`} transform={getRotation(start)}>
      {/* an arc that surrounds the cut site */}
      <path
        ref={inputRef(id, {
          end: end,
          ref: id,
          start: start,
          type: "ENZYME",
        })}
        className="la-vz-cut-site"
        cursor="pointer"
        d={genArc({
          innerRadius: botR,
          largeArc: cutSiteLength > seqLength / 2,
          length: cutSiteLength,
          outerRadius: topR,
          sweepFWD: true,
        })}
        style={cutSite.enzyme.color ? { fill: cutSite.enzyme.color } : {}}
      />

      {/* a line showing the start of the cut-site */}
      <path className="la-vz-cut-site" d={calculateLinePath(fcut - start, topR, midR)} />

      {/* a connector line for the cut-site */}
      <path
        className="la-vz-cut-site"
        d={genArc({
          innerRadius: midR,
          largeArc: Math.abs(fcut - rcut) > seqLength / 2,
          length: Math.abs(fcut - rcut),
          offset: Math.min(fcut, rcut) - start,
          outerRadius: midR,
          sweepFWD: true,
        })}
      />

      {/* a line showing the end of the cut-site */}
      <path className="la-vz-cut-site" d={calculateLinePath(rcut - start, midR, botR)} />
    </g>
  );
};

export default CutSites;
