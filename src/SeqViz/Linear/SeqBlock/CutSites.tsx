import * as React from "react";

import { ICutSite, InputRefFuncType } from "../../common";
import { FindXAndWidthType } from "./SeqBlock";

interface ConnectorType {
  fcut: number;
  rcut: number;
  id: string;
  cutX: number;
  start: number;
  end: number;
  hangX: number;
  recogStrand: 1 | -1;
  d?: 1 | -1;
  name?: string;
  highlightWidth?: number;
  highlightX?: number;
  highlightColor?: string;
}

/**
 * on hover, an enzyme recognition site should have an opacity of 0.5. 0 otherwise
 * on hover, an enzyme name should have opacity 1.0, 0 otherwise
 *
 * first set the names to 1.0 and then the cut site regions (without the name) to 0.5
 */
const hoverCutSite = (className: string, on = false) => {
  let elements = document.getElementsByClassName(`${className}-name`);
  for (let i = 0; i < elements.length; i += 1) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'style' does not exist on type 'Element'.
    elements[i].style.fillOpacity = on ? 1.0 : 0.8;
  }
  elements = document.getElementsByClassName(className);
  for (let i = 0; i < elements.length; i += 1) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'style' does not exist on type 'Element'.
    elements[i].style.fillOpacity = on ? 0.5 : 0;
  }
};

const recogContiguous = (start: number, end: number, first: number, last: number) => {
  if ((start < first && end < first) || (start > last && end > last)) return true;
  if (end >= start) {
    return end < last && start > first;
  }
  return start < last && end > first;
};

/**
 * CutSites
 *
 * a component shown above the sequence viewer that shows the name of the
 * enzyme that has a cut-site within the sequence and a line for the resulting cutsite
 */
const CutSites = (props: {
  zoom: { linear: number };
  cutSiteRows: ICutSite[];
  findXAndWidth: FindXAndWidthType;
  elementHeight: number;
  lineHeight: number;
  firstBase: number;
  lastBase: number;
  inputRef: InputRefFuncType;
  yDiff: number;
}) => {
  const {
    zoom: { linear: zoom },
    cutSiteRows,
    findXAndWidth,
    lineHeight,
    firstBase,
    lastBase,
    inputRef,
    yDiff,
    elementHeight,
  } = props;

  const sitesWithX: ConnectorType[] = cutSiteRows.map((c: ICutSite) => {
    const { x: cutX } = findXAndWidth(c.fcut, c.fcut);
    const { x: hangX } = findXAndWidth(c.rcut, c.rcut);
    let { x: highlightX, width: highlightWidth } = findXAndWidth(c.recogStart, c.recogEnd);
    if (recogContiguous(c.recogStart, c.recogEnd, firstBase, lastBase)) {
      if (c.recogStart > c.recogEnd) {
        ({ x: highlightX, width: highlightWidth } = findXAndWidth(
          c.recogEnd < firstBase ? lastBase : Math.min(lastBase, c.recogEnd),
          c.recogStart > lastBase ? firstBase : Math.max(firstBase, c.recogStart)
        ));
      } else if (c.recogEnd > c.recogStart) {
        ({ x: highlightX, width: highlightWidth } = findXAndWidth(
          c.recogStart < firstBase ? lastBase : Math.min(lastBase, c.recogStart),
          c.recogEnd > lastBase ? firstBase : Math.max(firstBase, c.recogEnd)
        ));
      }
    }
    return {
      ...c,
      cutX,
      hangX,
      highlightX,
      highlightWidth,
      recogStrand: c.recogStrand,
      highlightColor: c.highlightColor,
    };
  });

  if (!sitesWithX.length) return null;

  const getConnectorXAndWidth = (c: ConnectorType, sequenceCutSite: boolean, complementCutSite: boolean) => {
    if (sequenceCutSite && complementCutSite) {
      return {
        x: Math.min(c.cutX, c.hangX),
        width: Math.abs(c.hangX - c.cutX),
      };
    }
    if (sequenceCutSite) {
      if (c.start + c.cutX > c.end + c.hangX) {
        return findXAndWidth(firstBase, c.fcut);
      }
      if (c.fcut > c.rcut) return findXAndWidth(firstBase, c.fcut);
      return findXAndWidth(c.fcut, lastBase);
    }
    if (complementCutSite) {
      if (c.start + c.cutX > c.end + c.hangX) {
        return findXAndWidth(c.rcut, lastBase);
      }
      if (c.fcut > c.rcut) return findXAndWidth(c.rcut, lastBase);
      return findXAndWidth(firstBase, c.rcut);
    }
    return { x: 0, width: 0 };
  };

  // the cut site starts lower and on the sequence
  const lineYDiff = lineHeight - 3;

  return (
    <g className="la-vz-cut-sites">
      {sitesWithX.map((c: ConnectorType) => {
        // prevent double rendering, by placing the indeces only in the seqBlock
        // that they need to be shown. Important for the zero-index edge case
        const sequenceCutSite = c.fcut >= firstBase && c.fcut < lastBase;
        const complementCutSite = c.rcut >= firstBase && c.rcut < lastBase;
        const showIndex = sequenceCutSite || complementCutSite;

        const { x: connectorX, width: connectorWidth } = getConnectorXAndWidth(c, sequenceCutSite, complementCutSite);
        return (
          <React.Fragment key={`la-vz-cut-site-${c.id}`}>
            {/* custom highlight color block */}
            {c.highlightColor ? (
              <HighlightBlock
                id={c.id}
                start={c.start}
                end={c.end}
                yDiff={elementHeight}
                findXAndWidth={findXAndWidth}
                connector={c}
                color={c.highlightColor}
                direction={c.recogStrand}
                lineHeight={lineHeight}
              />
            ) : null}

            {/* label above seq */}
            {sequenceCutSite && (
              <text
                dominantBaseline="hanging"
                textAnchor="start"
                y={yDiff}
                id={c.id}
                className="la-vz-cut-site-text"
                x={c.cutX}
                style={{
                  cursor: "pointer",
                  fill: "rgb(51, 51, 51)",
                  fillOpacity: 0.8,
                }}
                onMouseOver={() => hoverCutSite(c.id, true)}
                onMouseOut={() => hoverCutSite(c.id, false)}
                onFocus={() => 0}
                onBlur={() => 0}
              >
                {c.name}
              </text>
            )}

            {/* lines showing the cut site */}
            {sequenceCutSite && <rect width="1px" height={lineHeight} x={c.cutX - 1} y={lineYDiff} />}
            {showIndex && zoom > 10 ? (
              <rect width={connectorWidth + 1} height="1px" x={connectorX - 1} y={lineHeight + lineYDiff - 1} />
            ) : null}
            {complementCutSite && zoom > 10 ? (
              <rect width="1px" height={lineHeight} x={c.hangX - 1} y={lineHeight + lineYDiff} />
            ) : null}

            {/* dashed outline showing the recog site */}
            {zoom > 10 && (
              <rect
                className={c.id} // for highlighting
                width={c.highlightWidth}
                height={lineHeight * 2}
                x={c.cutX - 1}
                y={lineYDiff}
                strokeDasharray="4,5"
                style={{
                  stroke: "rgb(150,150,150)",
                  strokeWidth: 1,
                  fill: "rgb(255, 165, 0, 0.3)",
                  fillOpacity: 0,
                }}
                ref={inputRef(c.id, {
                  id: c.id,
                  start: c.start,
                  end: c.end,
                  type: "ENZYME",
                  element: null,
                })}
              />
            )}
          </React.Fragment>
        );
      })}
    </g>
  );
};

const HighlightBlock = (props: {
  connector: ConnectorType;
  id: string;
  start: number;
  end: number;
  findXAndWidth: FindXAndWidthType;
  yDiff: number;
  color: string;
  direction: 1 | -1;
  lineHeight: number;
}) => {
  const { id, start, end, findXAndWidth, yDiff, color, direction, lineHeight } = props;
  const { x, width } = findXAndWidth(start, end);
  /* direction = 1 -> top strand */
  let y = yDiff - lineHeight / 2 - 1; // template row result
  /* direction = -1 -> bottom strand */
  if (direction == -1) {
    y = yDiff + lineHeight / 2 - 1;
  }

  return (
    <rect
      key={id}
      id={id}
      className="la-vz-cut-site-highlight"
      x={x}
      y={y}
      width={width}
      style={{
        stroke: "rgba(0, 0, 0, 0.5)",
        cursor: "pointer",
        strokeWidth: 0,
        fill: color,
      }}
    />
  );
};

export default CutSites;
