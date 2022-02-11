import * as React from "react";

export default class CutSites extends React.PureComponent {
  calculateLinePath = (index, startRadius, endRadius) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findCoor' does not exist on type 'Readon... Remove this comment to see the full error message
    const { findCoor } = this.props;
    const lineStart = findCoor(index, startRadius);
    const lineEnd = findCoor(index, endRadius);
    const linePath = `M ${lineEnd.x} ${lineEnd.y}
            L ${lineStart.x} ${lineStart.y}`;
    return linePath;
  };

  displayCutSite = cutSite => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'radius' does not exist on type 'Readonly... Remove this comment to see the full error message
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

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'cutSites' does not exist on type 'Readon... Remove this comment to see the full error message
    const { cutSites } = this.props;

    if (!cutSites.length) {
      return null;
    }

    return <g className="la-vz-circular-cutsites">{cutSites.map(this.displayCutSite)}</g>;
  }
}
