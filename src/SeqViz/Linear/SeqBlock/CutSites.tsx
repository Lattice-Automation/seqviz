import * as React from "react";

import { ICutSite, InputRefFuncType } from "../../../elements";
import { FindXAndWidthType } from "./SeqBlock";

interface ConnectorType {
  cutX: number;
  d?: 1 | -1;
  end: number;
  fcut: number;
  hangX: number;
  highlightColor?: string;
  highlightWidth?: number;
  highlightX?: number;
  id: string;
  name?: string;
  rcut: number;
  recogStrand: 1 | -1;
  start: number;
}

/**
 * on hover, an enzyme recognition site should have an opacity of 0.5. 0 otherwise
 * on hover, an enzyme name should have opacity 1.0, 0 otherwise
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

// is this recognition site entirely within this SeqBlock?
const recogContiguous = (start: number, end: number, firstBase: number, lastBase: number) => {
  if ((start < firstBase && end < firstBase) || (start > lastBase && end > lastBase)) return true;
  if (end >= start) {
    return end < lastBase && start > firstBase;
  }
  return start < lastBase && end > firstBase;
};

/**
 * Renders enzyme cut sites above the linear sequences. Shows the enzyme name and the recognition site.
 */
const CutSites = (props: {
  cutSiteRows: ICutSite[];
  elementHeight: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  lineHeight: number;
  yDiff: number;
  zoom: { linear: number };
}) => {
  const {
    cutSiteRows,
    findXAndWidth,
    firstBase,
    inputRef,
    lastBase,
    lineHeight,
    yDiff,
    zoom: { linear: zoom },
  } = props;

  // Add x and width to each cut site.
  const sitesWithX: ConnectorType[] = cutSiteRows.map((c: ICutSite) => {
    const { x: cutX } = findXAndWidth(c.fcut, c.fcut);
    const { x: hangX } = findXAndWidth(c.rcut, c.rcut);
    let { width: highlightWidth, x: highlightX } = findXAndWidth(c.recogStart, c.recogEnd);

    if (recogContiguous(c.recogStart, c.recogEnd, firstBase, lastBase)) {
      if (c.recogStart > c.recogEnd) {
        ({ width: highlightWidth, x: highlightX } = findXAndWidth(
          c.recogEnd < firstBase ? lastBase : Math.min(lastBase, c.recogEnd),
          c.recogStart > lastBase ? firstBase : Math.max(firstBase, c.recogStart)
        ));
      } else if (c.recogEnd > c.recogStart) {
        ({ width: highlightWidth, x: highlightX } = findXAndWidth(
          c.recogStart < firstBase ? lastBase : Math.min(lastBase, c.recogStart),
          c.recogEnd > lastBase ? firstBase : Math.max(firstBase, c.recogEnd)
        ));
      }
    }

    return {
      ...c,
      cutX,
      hangX,
      highlightColor: c.highlightColor,
      highlightWidth,
      highlightX,
      recogStrand: c.direction,
    };
  });

  if (!sitesWithX.length) return null;

  const getConnectorXAndWidth = (c: ConnectorType, sequenceCutSite: boolean, complementCutSite: boolean) => {
    if (sequenceCutSite && complementCutSite) {
      return {
        width: Math.abs(c.hangX - c.cutX),
        x: Math.min(c.cutX, c.hangX),
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
    return { width: 0, x: 0 };
  };

  // This would normally be 1xlineHeight (one row after the label row), but the text starts right at the top of the
  // sequence row, so we need to adjust upward for that.
  const lineYDiff = 0.8 * lineHeight;

  return (
    <g className="la-vz-cut-sites">
      {sitesWithX.map((c: ConnectorType) => {
        // prevent double rendering, by placing the indeces only in the seqBlock
        // that they need to be shown. Important for the zero-index edge case
        const sequenceCutSite = c.fcut >= firstBase && c.fcut < lastBase;
        const complementCutSite = c.rcut >= firstBase && c.rcut < lastBase;
        const showIndex = sequenceCutSite || complementCutSite;

        const { width: connectorWidth, x: connectorX } = getConnectorXAndWidth(c, sequenceCutSite, complementCutSite);
        return (
          <React.Fragment key={`la-vz-cut-site-${c.id}`}>
            {/* custom highlight color block */}
            {c.highlightColor ? (
              <HighlightBlock
                color={c.highlightColor}
                connector={c}
                end={c.end}
                findXAndWidth={findXAndWidth}
                id={c.id}
                lineHeight={lineHeight}
                start={c.start}
                yDiff={c.recogStrand > 0 ? lineYDiff : lineYDiff + lineHeight}
              />
            ) : null}

            {/* label above seq */}
            {sequenceCutSite && (
              <text
                className="la-vz-cut-site-text"
                dominantBaseline="hanging"
                id={c.id}
                style={{
                  cursor: "pointer",
                  fill: "rgb(51, 51, 51)",
                  fillOpacity: 0.8,
                }}
                textAnchor="start"
                x={c.cutX}
                y={yDiff}
                onBlur={() => 0}
                onFocus={() => 0}
                onMouseOut={() => hoverCutSite(c.id, false)}
                onMouseOver={() => hoverCutSite(c.id, true)}
              >
                {c.name}
              </text>
            )}

            {/* lines showing the cut site */}
            {sequenceCutSite && <rect height={lineHeight} width="1px" x={c.cutX - 1} y={lineYDiff} />}
            {showIndex && zoom > 10 ? (
              <rect height="1px" width={connectorWidth + 1} x={connectorX - 1} y={lineHeight + lineYDiff} />
            ) : null}
            {complementCutSite && zoom > 10 ? (
              <rect height={lineHeight} width="1px" x={c.hangX - 1} y={lineHeight + lineYDiff} />
            ) : null}

            {/* dashed outline showing the recog site */}
            {zoom > 10 && (
              <rect
                ref={inputRef(c.id, {
                  element: null,
                  end: c.end,
                  id: c.id,
                  start: c.start,
                  type: "ENZYME",
                })} // for highlighting
                className={c.id}
                height={lineHeight * 2}
                strokeDasharray="4,5"
                style={{
                  fill: "rgb(255, 165, 0, 0.3)",
                  fillOpacity: 0,
                  stroke: "rgb(150,150,150)",
                  strokeWidth: 1,
                }}
                width={c.highlightWidth}
                x={c.highlightX}
                y={lineYDiff}
              />
            )}
          </React.Fragment>
        );
      })}
    </g>
  );
};

const HighlightBlock = (props: {
  color: string;
  connector: ConnectorType;
  end: number;
  findXAndWidth: FindXAndWidthType;
  id: string;
  lineHeight: number;
  start: number;
  yDiff: number;
}) => {
  const { color, end, findXAndWidth, id, lineHeight, start, yDiff } = props;
  const { width, x } = findXAndWidth(start, end);

  return (
    <rect
      key={id}
      className="la-vz-cut-site-highlight"
      height={lineHeight}
      id={id}
      style={{
        cursor: "pointer",
        fill: color,
        stroke: "rgba(0, 0, 0, 0.5)",
        strokeWidth: 0,
      }}
      width={width}
      x={x}
      y={yDiff}
    />
  );
};

export default CutSites;
