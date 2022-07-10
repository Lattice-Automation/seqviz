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
  } = props;

  // Add x and width to each cut site.
  const sitesWithX: ConnectorType[] = cutSiteRows.map((c: ICutSite) => {
    const { x: cutX } = findXAndWidth(c.fcut, c.fcut);
    const { x: hangX } = findXAndWidth(c.rcut, c.rcut);
    let { x: highlightX, width: highlightWidth } = findXAndWidth(c.recogStart, c.recogEnd);

    console.log(
      c,
      cutX,
      hangX,
      highlightX,
      highlightWidth,
      recogContiguous(c.recogStart, c.recogEnd, firstBase, lastBase)
    );

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

        const { x: connectorX, width: connectorWidth } = getConnectorXAndWidth(c, sequenceCutSite, complementCutSite);
        return (
          <React.Fragment key={`la-vz-cut-site-${c.id}`}>
            {/* custom highlight color block */}
            {c.highlightColor ? (
              <HighlightBlock
                id={c.id}
                start={c.start}
                end={c.end}
                yDiff={c.recogStrand > 0 ? lineYDiff : lineYDiff + lineHeight}
                findXAndWidth={findXAndWidth}
                connector={c}
                color={c.highlightColor}
                lineHeight={lineHeight}
              />
            ) : null}

            {/* label above seq */}
            {sequenceCutSite && (
              <text
                id={c.id}
                className="la-vz-cut-site-text"
                dominantBaseline="hanging"
                textAnchor="start"
                x={c.cutX}
                y={yDiff}
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
              <rect width={connectorWidth + 1} height="1px" x={connectorX - 1} y={lineHeight + lineYDiff} />
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
                x={c.highlightX}
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
  lineHeight: number;
}) => {
  const { id, start, end, findXAndWidth, yDiff, color, lineHeight } = props;
  const { x, width } = findXAndWidth(start, end);

  return (
    <rect
      key={id}
      id={id}
      className="la-vz-cut-site-highlight"
      x={x}
      y={yDiff}
      height={lineHeight}
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
