import * as React from "react";

/**
 * CutSites
 *
 * a component shown above the sequence viewer that shows the name of the
 * enzyme that has a cut-site within the sequence and a line for the resulting cutsite
 */

/**
 * on hover, an enzyme recognition site should have an opacity of 0.5. 0 otherwise
 * on hover, an enzyme name should have opacity 1.0, 0 otherwise
 *
 * first set the names to 1.0 and then the cut site regions (without the name) to 0.5
 */
const hoverCutSite = (className, on = false) => {
  const linearScroller = document.getElementById("Linear-scroller");
  if (linearScroller) {
    let elements = linearScroller.getElementsByClassName(`${className}-name`);
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].style.fillOpacity = on ? 1.0 : 0.8;
    }
    elements = linearScroller.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].style.fillOpacity = on ? 0.5 : 0;
    }
  }
};

const CutSites = props => {
  const {
    zoom: { linear: zoom },
    cutSiteRows,
    findXAndWidth,
    lineHeight,
    enzymes,
    firstBase,
    lastBase,
    inputRef,
    yDiff
  } = props;

  if (enzymes.length < 1) return null;

  const sitesWithX = cutSiteRows.map(c => {
    const { x: cutX } = findXAndWidth(c.sequenceCutIdx, c.sequenceCutIdx);
    const { x: hangX } = findXAndWidth(c.complementCutIdx, c.complementCutIdx);
    let { x: highlightX, width: highlightWidth } = findXAndWidth(
      c.recogStart,
      c.recogEnd
    );
    if (c.start > c.end) {
      ({ x: highlightX, width: highlightWidth } = findXAndWidth(
        c.start > lastBase ? firstBase : Math.max(firstBase, c.start),
        c.end < firstBase ? lastBase : Math.min(lastBase, c.end)
      ));
    }
    return {
      ...c,
      cutX,
      hangX,
      highlightX,
      highlightWidth
    };
  });

  if (!sitesWithX.length) return null;

  const textProps = {
    dominantBaseline: "inherit",
    textAnchor: "start",
    y: yDiff
  };

  const getConnectorXAndWidth = (c, sequenceCutSite, complementCutSite) => {
    if (sequenceCutSite && complementCutSite) {
      return {
        x: Math.min(c.cutX, c.hangX),
        width: Math.abs(c.hangX - c.cutX)
      };
    }
    if (sequenceCutSite) {
      if (c.start + c.cutX > c.end + c.hangX) {
        return findXAndWidth(firstBase, c.sequenceCutIdx);
      }
      if (c.sequenceCutIdx > c.complementCutIdx)
        return findXAndWidth(firstBase, c.sequenceCutIdx);
      return findXAndWidth(c.sequenceCutIdx, lastBase);
    }
    if (complementCutSite) {
      if (c.start + c.cutX > c.end + c.hangX) {
        return findXAndWidth(c.complementCutIdx, lastBase);
      }
      if (c.sequenceCutIdx > c.complementCutIdx)
        return findXAndWidth(c.complementCutIdx, lastBase);
      return findXAndWidth(firstBase, c.complementCutIdx);
    }
    return { x: 0, width: 0 };
  };

  return (
    <g className="cutSites">
      {sitesWithX.map(c => {
        // prevent double rendering, by placing the indeces only in the seqBlock
        // that they need to be shown. Important for the zero-index edge case
        const sequenceCutSite =
          c.sequenceCutIdx >= firstBase && c.sequenceCutIdx < lastBase;
        const complementCutSite =
          c.complementCutIdx >= firstBase && c.complementCutIdx < lastBase;
        const showIndex = sequenceCutSite || complementCutSite;

        const { x: connectorX, width: connectorWidth } = getConnectorXAndWidth(
          c,
          sequenceCutSite,
          complementCutSite
        );

        return (
          <React.Fragment key={`${c.id}-firstBase`}>
            {sequenceCutSite ? (
              <text
                {...textProps}
                id={c.id}
                className={`cutSite-text ${c.id}-name`}
                x={c.cutX}
                style={{
                  cursor: "pointer",
                  fill: "rgb(51, 51, 51)",
                  fillOpacity: 0.8
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
                  fillOpacity: 0
                }}
                className={c.id}
                ref={inputRef(c.id, {
                  id: c.id,
                  start: c.start,
                  end: c.end,
                  type: "ENZYME",
                  element: null
                })}
              />
            )}
            {sequenceCutSite ? (
              <rect
                width="1px"
                height={lineHeight}
                x={c.cutX - 0.5}
                y={6 + yDiff}
              />
            ) : null}
            {showIndex && zoom > 10 ? (
              <rect
                width={connectorWidth}
                height="1px"
                x={connectorX - 0.5}
                y={lineHeight + 6 + yDiff}
              />
            ) : null}
            {complementCutSite && zoom > 10 ? (
              <rect
                width="1px"
                height={lineHeight + 1.5}
                x={c.hangX - 0.5}
                y={lineHeight + 6 + yDiff}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </g>
  );
};

export default CutSites;
