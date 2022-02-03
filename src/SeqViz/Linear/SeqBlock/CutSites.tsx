import * as React from "react";

/**
 * on hover, an enzyme recognition site should have an opacity of 0.5. 0 otherwise
 * on hover, an enzyme name should have opacity 1.0, 0 otherwise
 *
 * first set the names to 1.0 and then the cut site regions (without the name) to 0.5
 */
const hoverCutSite = (className, on = false) => {
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
const CutSites = props => {
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

  const recogContiguous = (start, end, first, last) => {
    if ((start < first && end < first) || (start > last && end > last)) return true;
    if (end >= start) {
      return end < last && start > first;
    }
    return start < last && end > first;
  };

  const sitesWithX = cutSiteRows.map(c => {
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
    };
  });

  if (!sitesWithX.length) return null;

  const textProps = {
    dominantBaseline: "inherit",
    textAnchor: "start",
    y: yDiff,
  };

  const getConnectorXAndWidth = (c, sequenceCutSite, complementCutSite) => {
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
      {sitesWithX.map(c => {
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
          </React.Fragment>
        );
      })}
    </g>
  );
};

export default CutSites;
