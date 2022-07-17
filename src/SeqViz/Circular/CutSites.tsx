import * as React from "react";

import { Coor, CutSite, InputRefFuncType } from "../../elements";
import { FindArc } from "./Find";

interface CutSitesProps {
  center: Coor;
  cutSites: CutSite[];
  findCoor: (index: number, radius: number, rotate?: boolean) => Coor;
  generateArc: (args: {
    arrowFWD?: boolean;
    arrowREV?: boolean;
    innerRadius: number;
    largeArc: boolean;
    length: number;
    offset?: number;
    outerRadius: number;
    // see svg.arc large-arc-flag
    sweepFWD?: boolean;
  }) => string;
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
  generateArc: (args: {
    arrowFWD?: boolean;
    arrowREV?: boolean;
    innerRadius: number;
    largeArc: boolean;
    length: number;
    offset?: number;
    outerRadius: number;
    // see svg.arc large-arc-flag
    sweepFWD?: boolean;
  }) => string;
  getRotation: (index: number) => string;
  inputRef: InputRefFuncType;
  lineHeight: number;
  radius: number;
  rotateCoor: (coor: Coor, degrees: number) => Coor;
  selectionRows: number;
  seqLength: number;
}) => {
  const { calculateLinePath, cutSite, generateArc, getRotation, inputRef, lineHeight, radius, seqLength } = props;
  const { id, start } = cutSite;
  let { end, fcut, rcut } = cutSite;

  // crosses the zero index
  if (start + fcut > end + rcut) {
    end = start > end ? end + seqLength : end;
    if (fcut > rcut) rcut += seqLength;
    else fcut += seqLength;
  }

  // length for highlighted recog area
  const cutSiteLength = Math.abs(end - start);

  // const calc the size of the recog area radii
  let topR = radius + lineHeight; // outer radius
  if (seqLength < 200) {
    topR += 2 * lineHeight;
  }

  // find start and stop coordinates of recog area
  const recogAreaPath = generateArc({
    innerRadius: radius,
    largeArc: cutSiteLength > seqLength / 2,
    length: cutSiteLength,
    outerRadius: topR,
    sweepFWD: true,
  });

  // find start and stop coordinates to cut site line
  const cutLinePath = calculateLinePath(fcut - start, radius + lineHeight * 2, radius + lineHeight * 1.5);

  // find start and stop coordinates of connector line
  const connectorLinePath = generateArc({
    innerRadius: radius + lineHeight * 1.5,
    largeArc: Math.abs(fcut - rcut) > seqLength / 2,
    length: Math.abs(fcut - rcut),
    offset: Math.min(fcut, rcut) - start,
    outerRadius: radius + lineHeight * 1.5,
    sweepFWD: true,
  });

  // find start and stop coordinates to hang site line
  const hangLinePath = calculateLinePath(rcut - start, radius + lineHeight * 1.5, radius + lineHeight / 1.2);

  const lineStyle = {
    fill: "transparent",
    shapeRendering: "auto",
    stroke: "black",
    strokeWidth: 1,
  };

  return (
    <React.Fragment>
      {cutSite.color && (
        <FindArc
          direction={1}
          end={cutSite.end}
          fillStyle={cutSite.color}
          generateArc={generateArc}
          getRotation={getRotation}
          inputRef={inputRef}
          lineHeight={lineHeight}
          radius={radius}
          seqLength={seqLength}
          start={cutSite.start}
        />
      )}
      <g key={`cutSite: ${id}`} id={`la-vz-circular-cutsite-${id}`} transform={getRotation(start)}>
        {<path d={cutLinePath} {...lineStyle} />}
        {<path d={connectorLinePath} {...lineStyle} />}
        {<path d={hangLinePath} {...lineStyle} />}
        <path
          ref={inputRef(id, {
            end: end,
            ref: id,
            start: start,
            type: "ENZYME",
          })}
          className={id}
          cursor="pointer"
          d={recogAreaPath}
          fill="rgba(255, 165, 0, 0.2)"
          fillOpacity={0}
          shapeRendering="auto"
          stroke="black"
          strokeWidth={1}
        />
      </g>{" "}
    </React.Fragment>
  );
};

export default CutSites;
