import * as React from "react";

import { Coor, ICutSite, InputRefFuncType } from "../common";
import { CircularFindArc } from "./CircularFind";

interface CutSitesProps {
  center: Coor;
  cutSites: ICutSite[];
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
    const { generateArc, getRotation, inputRef, lineHeight, radius, seqLength } = this.props;
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
    const cutLinePath = this.calculateLinePath(fcut - start, radius + lineHeight * 2, radius + lineHeight * 1.5);

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
    const hangLinePath = this.calculateLinePath(rcut - start, radius + lineHeight * 1.5, radius + lineHeight / 1.2);

    const fill = "rgba(255, 165, 0, 0.2)";

    const cutSiteStyle = {
      cursor: "pointer",
      fill: fill,
      fillOpacity: 0,
      shapeRendering: "auto",
      stroke: "black",
      strokeWidth: 1,
    };

    const lineStyle = {
      fill: "transparent",
      shapeRendering: "auto",
      stroke: "black",
      strokeWidth: 1,
    };

    return (
      <g key={`cutSite: ${id}`} id={`la-vz-circular-cutsite-${id}`} transform={getRotation(start)}>
        {<path d={cutLinePath} {...lineStyle} />}
        {<path d={connectorLinePath} {...lineStyle} />}
        {<path d={hangLinePath} {...lineStyle} />}
        <path
          {...cutSiteStyle}
          ref={inputRef(id, {
            end: end,
            ref: id,
            start: start,
            type: "ENZYME",
          })}
          className={id}
          d={recogAreaPath}
        />
      </g>
    );
  };
  recogHighlightArc = (c: ICutSite) => {
    if (c.highlightColor) {
      return (
        <CircularFindArc
          key={`findArc: ${c.id}`}
          direction={1}
          end={c.end}
          fillStyle={c.highlightColor}
          generateArc={this.props.generateArc}
          getRotation={this.props.getRotation}
          inputRef={this.props.inputRef}
          lineHeight={this.props.lineHeight}
          radius={this.props.radius}
          seqLength={this.props.seqLength}
          start={c.start}
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
            <React.Fragment key={JSON.stringify(c)}>
              {this.recogHighlightArc(c)}

              {this.displayCutSite(c)}
            </React.Fragment>
          );
        })}
      </g>
    );
  }
}
