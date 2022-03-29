import * as React from "react";

import { Coor, ICutSite, InputRefFuncType } from "../common";
import { CircularFindArc } from "./CircularFind";

interface CutSitesProps {
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
  selectionRows: number;
  cutSites: ICutSite[];
}

export default class CutSites extends React.PureComponent<CutSitesProps> {
  calculateLinePath = (index: number, startRadius: number, endRadius: number) => {
    const { findCoor } = this.props;
    const lineStart = findCoor(index, startRadius);
    const lineEnd = findCoor(index, endRadius);
    const linePath = `M ${lineEnd.x} ${lineEnd.y}
            L ${lineStart.x} ${lineStart.y}`;
    return linePath;
  };

  displayCutSite = (cutSite: ICutSite) => {
    const { radius, lineHeight, seqLength, getRotation, inputRef, generateArc } = this.props;
    const { id, start } = cutSite;
    let { fcut, rcut, end } = cutSite;

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
      outerRadius: topR,
      length: cutSiteLength,
      largeArc: cutSiteLength > seqLength / 2,
      sweepFWD: true,
    });

    // find start and stop coordinates to cut site line
    const cutLinePath = this.calculateLinePath(fcut - start, radius + lineHeight * 2, radius + lineHeight * 1.5);

    // find start and stop coordinates of connector line
    const connectorLinePath = generateArc({
      innerRadius: radius + lineHeight * 1.5,
      outerRadius: radius + lineHeight * 1.5,
      length: Math.abs(fcut - rcut),
      largeArc: Math.abs(fcut - rcut) > seqLength / 2,
      sweepFWD: true,
      offset: Math.min(fcut, rcut) - start,
    });

    // find start and stop coordinates to hang site line
    const hangLinePath = this.calculateLinePath(rcut - start, radius + lineHeight * 1.5, radius + lineHeight / 1.2);

    const fill = "rgba(255, 165, 0, 0.2)";

    const cutSiteStyle = {
      stroke: "black",
      strokeWidth: 1,
      fill: fill,
      shapeRendering: "auto",
      cursor: "pointer",
      fillOpacity: 0,
    };

    const lineStyle = {
      fill: "transparent",
      stroke: "black",
      strokeWidth: 1,
      shapeRendering: "auto",
    };

    return (
      <g id={`la-vz-circular-cutsite-${id}`} key={id} transform={getRotation(start)}>
        {<path d={cutLinePath} {...lineStyle} />}
        {<path d={connectorLinePath} {...lineStyle} />}
        {<path d={hangLinePath} {...lineStyle} />}
        <path
          {...cutSiteStyle}
          d={recogAreaPath}
          className={id}
          ref={inputRef(id, {
            ref: id,
            start: start,
            end: end,
            type: "ENZYME",
          })}
        />
      </g>
    );
  };
  recogHighlightArc = (c: ICutSite) => {
    if (c.highlightColor) {
      return (
        <CircularFindArc
          key={c.id}
          radius={this.props.radius}
          lineHeight={this.props.lineHeight}
          seqLength={this.props.seqLength}
          start={c.start}
          end={c.end}
          getRotation={this.props.getRotation}
          generateArc={this.props.generateArc}
          inputRef={this.props.inputRef}
          direction={1}
          fillStyle={c.highlightColor}
        />
      );
    }
  };
  render() {
    const { cutSites } = this.props;

    if (!cutSites.length) {
      return null;
    }

    return (
      <g className="la-vz-circular-cutsites">
        {cutSites.map(c => {
          return (
            <>
              {this.recogHighlightArc(c)}

              {this.displayCutSite(c)}
            </>
          );
        })}
      </g>
    );
  }
}
