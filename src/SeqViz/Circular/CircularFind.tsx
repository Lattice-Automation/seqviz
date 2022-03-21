import * as React from "react";

import { SearchResult } from "../../utils/search";
import { HighlightRegion } from "../Linear/SeqBlock/LinearFind";
import { Coor, InputRefFuncType } from "../common";

interface CircularFindProps {
  search: SearchResult[];
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
  onUnmount: unknown;
  totalRows: number;
  seq: string;
  highlightedRegions: HighlightRegion[];
}

export const CircularFind = (props: CircularFindProps) => {
  const { seqLength, search, radius, lineHeight, getRotation, generateArc, inputRef, highlightedRegions } = props;
  const threshold = seqLength >= 200 ? search.length / seqLength <= 0.02 : true;
  const searchArcs = search.map(s => (
    <CircularFindArc
      radius={radius}
      lineHeight={lineHeight}
      seqLength={seqLength}
      getRotation={getRotation}
      generateArc={generateArc}
      inputRef={inputRef}
      key={JSON.stringify(s)}
      start={s.start}
      end={s.end}
      direction={s.direction}
      fillStyle={"rgba(255, 251, 7, 0.5)"}
    />
  ));

  const highlightArcs = highlightedRegions.map(({ start, end, color }) => (
    <CircularFindArc
      radius={radius}
      lineHeight={lineHeight}
      seqLength={seqLength}
      getRotation={getRotation}
      generateArc={generateArc}
      inputRef={inputRef}
      key={JSON.stringify({ start, end })}
      start={start}
      end={end}
      direction={1}
      fillStyle={color || "rgba(0, 251, 7, 0.5)"}
    />
  ));
  return (
    <g className="la-vz-circular-search-results">
      {threshold && searchArcs}
      {highlightArcs}
    </g>
  );
};

/**
 * Create an SVG `path` element that highlights the search result
 */
const CircularFindArc = (props: {
  radius: number;
  lineHeight: number;
  seqLength: number;
  start: number;
  end: number;
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
  inputRef: InputRefFuncType;
  direction: -1 | 1;
  fillStyle: string;
}) => {
  const { radius, lineHeight, seqLength, getRotation, generateArc, inputRef, start, direction, fillStyle } = props;

  let { end } = props;
  // crosses the zero index
  if (end < start) {
    end += seqLength;
  }

  const resultLength = Math.abs(end - start);
  const findPath = generateArc({
    innerRadius: radius - lineHeight / 2,
    outerRadius: radius + lineHeight / 2,
    length: resultLength,
    largeArc: resultLength > seqLength / 2,
    sweepFWD: true,
  });

  const resultStyle = {
    stroke: "rgba(0, 0, 0, 0.5)",
    strokeWidth: 1,
    fill: fillStyle,
    shapeRendering: "auto",
    cursor: "pointer",
  };

  const id = `${start}${end}${direction}${start}`;

  return (
    <path
      key={id}
      id={id}
      d={findPath}
      transform={getRotation(start)}
      ref={inputRef(id, {
        ref: id,
        start: start,
        end: end,
        type: "FIND",
      })}
      {...resultStyle}
    />
  );
};
