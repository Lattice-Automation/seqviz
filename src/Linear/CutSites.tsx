import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { CutSite, Enzyme } from "../elements";
import { FindXAndWidthType } from "./SeqBlock";

interface HighlightedCutSite {
  cutX: number;
  direction: 1 | -1;
  end: number;
  enzyme: Enzyme;
  fcut: number;
  hangX: number;
  highlight: {
    color?: string;
    width: number;
    x: number;
  };
  id: string;
  rcut: number;
  start: number;
}

/**
 * on hover, an enzyme recognition site should have an opacity of 0.5. 0 otherwise
 * on hover, an enzyme name should have opacity 1.0, 0 otherwise
 */
const hoverCutSite = (className: string, on = false) => {
  if (!document) return;

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
 * Is the recognition site entirely within this SeqBlock?
 */
const isWithinSeqBlock = (start: number, end: number, firstBase: number, lastBase: number) => {
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
  cutSites: CutSite[];
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  inputRef: InputRefFunc;
  lastBase: number;
  lineHeight: number;
  yDiff: number;
  zoom: { linear: number };
}) => {
  const {
    findXAndWidth,
    firstBase,
    inputRef,
    lastBase,
    lineHeight,
    yDiff,
    zoom: { linear: zoom },
  } = props;
  let { cutSites } = props;

  // TODO: fix cut-sites across the zero index
  cutSites = cutSites.filter(c => c.end > c.start);

  // Add x and width to each cut site.
  const sitesWithX: HighlightedCutSite[] = cutSites.map((c: CutSite) => {
    const { x: cutX } = findXAndWidth(c.fcut, c.fcut);
    const { x: hangX } = findXAndWidth(c.rcut, c.rcut);
    let { width: highlightWidth, x: highlightX } = findXAndWidth(c.start, c.end);

    if (isWithinSeqBlock(c.start, c.end, firstBase, lastBase)) {
      if (c.start > c.end) {
        ({ width: highlightWidth, x: highlightX } = findXAndWidth(
          c.end < firstBase ? lastBase : Math.min(lastBase, c.end),
          c.start > lastBase ? firstBase : Math.max(firstBase, c.start)
        ));
      } else {
        ({ width: highlightWidth, x: highlightX } = findXAndWidth(
          c.start < firstBase ? lastBase : Math.min(lastBase, c.start),
          c.end > lastBase ? firstBase : Math.max(firstBase, c.end)
        ));
      }
    }

    return {
      ...c,
      cutX,
      hangX,
      highlight: {
        color: c.enzyme.color,
        width: Math.max(0, highlightWidth),
        x: highlightX,
      },
    };
  });

  if (!sitesWithX.length) return null;

  // This gets the x and width of the connector line that connects the forward and reverse cut sites
  const getConnectorXAndWidth = (c: HighlightedCutSite, showTopLine: boolean, showBottomLine: boolean) => {
    if (showTopLine && showBottomLine) {
      return {
        width: Math.abs(c.hangX - c.cutX),
        x: Math.min(c.cutX, c.hangX),
      };
    }
    if (showTopLine) {
      if (c.start + c.cutX > c.end + c.hangX) {
        return findXAndWidth(firstBase, c.fcut);
      }
      if (c.fcut > c.rcut) return findXAndWidth(firstBase, c.fcut);
      return findXAndWidth(c.fcut, lastBase);
    }
    if (showBottomLine) {
      if (c.start + c.cutX > c.end + c.hangX) {
        return findXAndWidth(c.rcut, lastBase);
      }
      if (c.fcut > c.rcut) return findXAndWidth(c.rcut, lastBase);
      return findXAndWidth(firstBase, c.rcut);
    }
    return { width: 0, x: 0 };
  };

  const lineYDiff = yDiff + lineHeight;
  return (
    <g className="la-vz-cut-sites">
      {sitesWithX.map((c: HighlightedCutSite) => {
        // prevent double rendering of cut-site lines across SeqBlocks. Without this shenanigans below, we wind
        // if a cut site lands on the last or first base of a SeqBlock, it will also render at the end of a SeqBlock
        // and the start of the next. Below, we only show a cut if 1. it's wholly within this SeqBlock or
        // 2. the other cut is also within this block. If both the top and bottom cuts are on the last/first bases,
        // we render the cut in the first block (ie at the very end of the first block)
        let showTopLine = c.fcut > firstBase && c.fcut < lastBase;
        if (c.fcut === firstBase && c.rcut > firstBase && c.rcut <= lastBase) {
          showTopLine = true;
        } else if (c.fcut === lastBase && c.rcut >= firstBase && c.rcut <= lastBase) {
          showTopLine = true;
        }

        let showBottomLine = c.rcut > firstBase && c.rcut < lastBase;
        if (c.rcut === firstBase && c.fcut > firstBase && c.fcut <= lastBase) {
          showBottomLine = true;
        } else if (c.rcut === lastBase && c.fcut >= firstBase && c.fcut <= lastBase) {
          showBottomLine = true;
        }

        const showConnector = showTopLine || showBottomLine;
        const { width: connectorWidth, x: connectorX } = getConnectorXAndWidth(c, showTopLine, showBottomLine);

        return (
          <React.Fragment key={`cut-site-${c.id}-${firstBase}`}>
            {/* enzyme name label above the cut-site */}
            {showTopLine && (
              <text
                className={`la-vz-cut-site-text ${c.id}-name`}
                dominantBaseline="hanging"
                id={c.id}
                textAnchor="start"
                x={c.highlight.x}
                y={yDiff}
                onBlur={() => 0}
                onFocus={() => 0}
                onMouseOut={() => hoverCutSite(c.id, false)}
                onMouseOver={() => hoverCutSite(c.id, true)}
              >
                {c.enzyme.name}
              </text>
            )}

            {/* outline showing the recognition site */}
            {zoom > 10 && (
              <path
                ref={inputRef(c.id, {
                  clockwise: true,
                  end: c.end,
                  id: c.id,
                  start: c.start,
                  type: "ENZYME",
                  viewer: "LINEAR",
                })} // for highlighting
                className={`la-vz-cut-site-highlight ${c.id}`}
                d={`M ${c.highlight.x} ${lineYDiff}
                    L ${c.highlight.x + c.highlight.width} ${lineYDiff}
                    L ${c.highlight.x + c.highlight.width} ${lineYDiff + 2 * lineHeight}
                    L ${c.highlight.x} ${lineYDiff + 2 * lineHeight} Z`}
                style={c.enzyme.color?.length ? { fill: c.enzyme.color } : {}}
              />
            )}

            {/* lines showing the cut site */}
            {showTopLine && (
              <path className="la-vz-cut-site" d={`M ${c.cutX} ${lineYDiff} L ${c.cutX} ${lineYDiff + lineHeight}`} />
            )}
            {showConnector && zoom > 10 && (
              <path
                className="la-vz-cut-site"
                d={`M ${connectorX} ${lineYDiff + lineHeight}
                    L ${connectorX + connectorWidth} ${lineYDiff + lineHeight}`}
              />
            )}
            {showBottomLine && zoom > 10 && (
              <path
                className="la-vz-cut-site"
                d={`M ${c.hangX} ${lineYDiff + lineHeight} L ${c.hangX} ${lineYDiff + 2 * lineHeight}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </g>
  );
};

export default CutSites;
