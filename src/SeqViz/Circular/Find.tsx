import * as React from "react";
import { SearchResult } from "../../utils/search";
import { inputRefFuncType } from "../Linear/SeqBlock/Translations";
import { Coor } from "./Circular";

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
  inputRef: inputRefFuncType;
  onUnmount: unknown;
  totalRows: number;
  seq: string;
}

export default class CircularFind extends React.PureComponent<CircularFindProps> {
  /**
   * Create an SVG `path` element that highlights the search result
   */
  createHighlight = (result: SearchResult) => {
    const { radius, lineHeight, seqLength, getRotation, generateArc, inputRef } = this.props;
    let { start, end } = result;
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
      fill: "rgba(255, 251, 7, 0.5)",
      shapeRendering: "auto",
      cursor: "pointer",
    };

    const id = `${start}${end}${result.direction}${result.start}`;

    return (
      <path
        key={id}
        id={id}
        d={findPath}
        transform={getRotation(result.start)}
        ref={inputRef(id, {
          ref: id,
          start: result.start,
          end: result.end,
          type: "FIND",
        })}
        {...resultStyle}
      />
    );
  };

  render() {
    const { seqLength, search } = this.props;
    const threshold = seqLength >= 200 ? search.length / seqLength <= 0.02 : true;

    if (!search.length) {
      return null;
    }

    return threshold && <g className="la-vz-circular-search-results">{search.map(this.createHighlight)}</g>;
  }
}
