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

  const recogContiguous = (start: number, end: number, first: number, last: number) => {
    if ((start < first && end < first) || (start > last && end > last)) return true;
    if (end >= start) {
      return end < last && start > first;
    }
    return start < last && end > first;
  };

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

  const textProps = {
    dominantBaseline: "inherit",
    textAnchor: "start",
    y: yDiff,
  };

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
          <React.Fragment key={`la-vz-${c.id}-first-base`}>
            {sequenceCutSite ? (
              <text
                {...textProps}
                id={c.id}
                className={`la-vz-cut-site-text ${c.id}-name`}
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
            ) : null}
            {zoom > 10 && (
              <rect
                width={c.highlightWidth}
                height={lineHeight * 2}
                x={c.highlightX}
                y={yDiff + 6}
                strokeDasharray="4,5"
                style={{
                  stroke: "rgb(150,150,150)",
                  strokeWidth: 1,
                  fill: "rgb(255, 165, 0, 0.3)",
                  fillOpacity: 0,
                }}
                className={c.id}
                ref={inputRef(c.id, {
                  id: c.id,
                  start: c.start,
                  end: c.end,
                  type: "ENZYME",
                  element: null,
                })}
              />
            )}
            {sequenceCutSite ? (
              <rect width="1px" height={lineHeight} x={c.cutX - 0.5} y={lineHeight / 4 + yDiff} />
            ) : null}
            {showIndex && zoom > 10 ? (
              <rect width={connectorWidth} height="1px" x={connectorX - 0.5} y={lineHeight * 1.25 + yDiff} />
            ) : null}
            {complementCutSite && zoom > 10 ? (
              <rect width="1px" height={lineHeight + 1.5} x={c.hangX - 0.5} y={lineHeight * 1.25 + yDiff} />
            ) : null}
            {c.highlightColor && (
              <>
                <HighlightBlock
                  connector={c}
                  id={c.id}
                  start={c.start}
                  end={c.end}
                  indexYDiff={yDiff + lineHeight - 5}
                  findXAndWidth={findXAndWidth}
                  color={c.highlightColor}
                  direction={c.recogStrand}
                />
              </>
            )}
          </React.Fragment>
        );
      })}
    </g>
  );
};

const HighlightBlock = (props: {
  connector: ConnectorType;
  id: string | undefined;
  start: number;
  end: number;
  findXAndWidth: FindXAndWidthType;
  indexYDiff: number;
  color: string;
  direction: 1 | -1;
}) => {
  const HEIGHT = 18;
  const { id, start, end, findXAndWidth, indexYDiff, color, direction } = props;
  const { x, width } = findXAndWidth(start, end);
  /* direction = 1 -> top strand */
  let y = indexYDiff - HEIGHT / 2; // template row result
  /* direction = 1 -> bottom strand */
  if (direction == -1) {
    y = indexYDiff + HEIGHT / 2;
  }

  return (
    <rect
      key={id}
      id={id}
      x={x - 1}
      y={y}
      width={width}
      style={{
        height: 18,
        stroke: "rgba(0, 0, 0, 0.5)",
        cursor: "pointer",
        strokeWidth: 1,
        fill: color,
      }}
    />
  );
};

export default CutSites;
