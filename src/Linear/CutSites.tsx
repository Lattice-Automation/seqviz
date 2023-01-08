import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { CHAR_WIDTH } from "../SeqViewerContainer";
import { CutSite, Size } from "../elements";
import { FindXAndWidthType } from "./SeqBlock";

/**
 * Renders enzyme cut sites on the linear viewer. This includes a few things:
 * - the cut site itself (some lines for the cut site on top and bottom sequences)
 * - an outline of the total recognition site (can span SeqBlocks)
 * - a label above the cut-site
 */
export const CutSites = (props: {
  cutSites: CutSite[];
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  inputRef: InputRefFunc;
  lastBase: number;
  lineHeight: number;
  size: Size;
  yDiff: number;
  zoom: { linear: number };
}) => {
  const {
    cutSites,
    findXAndWidth,
    firstBase,
    inputRef,
    lastBase,
    lineHeight,
    size,
    yDiff,
    zoom: { linear: zoom },
  } = props;

  // Calc x/width of highlight region, top/bottom cut lines, etc
  const enhancedCutSites = enhanceCutSites(
    // TODO: remove this exclusion of cut-sites that cross the zero index after even more
    // zero-index accounting. This file is already hairy enough, so not in a rush to add zero-index
    // accounting here, yet.
    cutSites.filter(c => c.end > c.start),
    firstBase,
    lastBase,
    findXAndWidth
  );
  if (!enhancedCutSites.length) return null;

  // Set cut-site label positions
  const labelledCutSites = withLabels(enhancedCutSites, size);

  const lineYDiff = yDiff + lineHeight;
  return (
    <g className="la-vz-cut-sites">
      {labelledCutSites.map(c => {
        return (
          <g key={`cut-site-${c.c.id}-${firstBase}`}>
            {/* enzyme name label above the cut-site */}
            {c.label.render && (
              <text
                className={`la-vz-cut-site-text ${c.c.id}-label`}
                dominantBaseline="hanging"
                id={c.c.id}
                textAnchor="start"
                x={c.label.x}
                y={yDiff}
                onBlur={() => 0}
                onFocus={() => 0}
                onMouseOut={() => onCutSiteHover(c.c.id, false)}
                onMouseOver={() => onCutSiteHover(c.c.id, true)}
              >
                {c.label.text}
              </text>
            )}

            {/* outline showing the recognition site */}
            {zoom > 10 && (
              <path
                ref={inputRef(c.c.id, {
                  clockwise: true,
                  end: c.c.end,
                  id: c.c.id,
                  start: c.c.start,
                  type: "ENZYME",
                  viewer: "LINEAR",
                })} // for highlighting
                className={`la-vz-cut-site-highlight ${c.c.id}`}
                d={`M ${c.highlight.x} ${lineYDiff}
                    L ${c.highlight.x + c.highlight.width} ${lineYDiff}
                    L ${c.highlight.x + c.highlight.width} ${lineYDiff + 2 * lineHeight}
                    L ${c.highlight.x} ${lineYDiff + 2 * lineHeight} Z`}
                style={c.c.color?.length ? { fill: c.c.color } : {}}
                onMouseOut={() => onCutSiteHover(c.c.id, false)}
                onMouseOver={() => onCutSiteHover(c.c.id, true)}
              />
            )}

            {/* lines showing the cut site */}
            {c.top.render && (
              <path
                className={`la-vz-cut-site ${c.c.id}`}
                d={`M ${c.top.x} ${lineYDiff} L ${c.top.x} ${lineYDiff + lineHeight}`}
              />
            )}
            {c.connector.render && zoom > 10 && (
              <path
                className={`la-vz-cut-site ${c.c.id}`}
                d={`M ${c.connector.x} ${lineYDiff + lineHeight}
                    L ${c.connector.x + c.connector.width} ${lineYDiff + lineHeight}`}
              />
            )}
            {c.bottom.render && zoom > 10 && (
              <path
                className={`la-vz-cut-site ${c.c.id}`}
                d={`M ${c.bottom.x} ${lineYDiff + lineHeight} L ${c.bottom.x} ${lineYDiff + 2 * lineHeight}`}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};

type CutSiteEnhanced = {
  bottom: {
    render: boolean;
    x: number;
  };
  c: CutSite;
  connector: {
    render: boolean;
    width: number;
    x: number;
  };
  highlight: {
    width: number;
    x: number;
  };
  top: {
    render: boolean;
    x: number;
  };
};

/**
 * This takes cut-sites and does some piecemeal calculations to add meta about:
 * - top (x position of the top line and whether to render)
 * - connector (x position and width of the connector and whether to render)
 * - bottom (x position of the bottom line and whether to render)
 * - highlight (x/width/color of the highlight block)
 */
const enhanceCutSites = (
  cutSites: CutSite[],
  firstBase: number,
  lastBase: number,
  findXAndWidth: FindXAndWidthType
): CutSiteEnhanced[] =>
  cutSites.map((c: CutSite) => {
    const { x: topX } = findXAndWidth(c.fcut, c.fcut);
    const { x: bottomX } = findXAndWidth(c.rcut, c.rcut);

    // Prevent double rendering of cut-site lines across SeqBlocks. Without the shenanigans below,
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

    return {
      bottom: {
        render: showBottomLine,
        x: bottomX,
      },
      c,
      connector: calcConnector(c, topX, bottomX, firstBase, lastBase, showTopLine, showBottomLine, findXAndWidth),
      highlight: calcHighlight(c, firstBase, lastBase, findXAndWidth),
      top: {
        render: showTopLine,
        x: topX,
      },
    };
  });

/**
 * calcHighlight returns the x and width of the enzyme recognition site's highlight block.
 */
const calcHighlight = (
  c: CutSite,
  firstBase: number,
  lastBase: number,
  findXAndWidth: FindXAndWidthType
): { width: number; x: number } => {
  if (isWithinSeqBlock(c.start, c.end, firstBase, lastBase)) {
    if (c.start > c.end) {
      return findXAndWidth(
        c.end < firstBase ? lastBase : Math.min(lastBase, c.end),
        c.start > lastBase ? firstBase : Math.max(firstBase, c.start)
      );
    }
    return findXAndWidth(
      c.start < firstBase ? lastBase : Math.min(lastBase, c.start),
      c.end > lastBase ? firstBase : Math.max(firstBase, c.end)
    );
  }
  return findXAndWidth(c.start, c.end);
};

/**
 * isWithinSeqBlock returns whether the cut site is entirely within this SeqBlock
 */
const isWithinSeqBlock = (start: number, end: number, firstBase: number, lastBase: number) => {
  if ((start < firstBase && end < firstBase) || (start > lastBase && end > lastBase)) {
    return true;
  }
  if (end >= start) {
    return end < lastBase && start > firstBase;
  }
  return start < lastBase && end > firstBase;
};

// This gets the x and width of the connector line that connects the forward and reverse cut sites
const calcConnector = (
  c: CutSite,
  topX: number,
  bottomX: number,
  firstBase: number,
  lastBase: number,
  showTopLine: boolean,
  showBottomLine: boolean,
  findXAndWidth: FindXAndWidthType
): { render: boolean; width: number; x: number } => {
  if (showTopLine && showBottomLine) {
    return {
      render: true,
      width: Math.abs(bottomX - topX),
      x: Math.min(topX, bottomX),
    };
  }
  if (showTopLine) {
    if (c.start + topX > c.end + bottomX) {
      return {
        render: true,
        ...findXAndWidth(firstBase, c.fcut),
      };
    }
    if (c.fcut > c.rcut) {
      return {
        render: true,
        ...findXAndWidth(firstBase, c.fcut),
      };
    }
    return {
      render: true,
      ...findXAndWidth(c.fcut, lastBase),
    };
  }
  if (showBottomLine) {
    if (c.start + topX > c.end + bottomX) {
      return {
        render: true,
        ...findXAndWidth(c.rcut, lastBase),
      };
    }
    if (c.fcut > c.rcut) {
      return {
        render: true,
        ...findXAndWidth(c.rcut, lastBase),
      };
    }
    return {
      render: true,
      ...findXAndWidth(firstBase, c.rcut),
    };
  }
  return { render: false, width: 0, x: 0 };
};

type CutSiteLabelled = CutSiteEnhanced & {
  label: {
    render: boolean;
    text: string;
    x: number;
  };
};

/**
 * This tries to position the cut-site labels so they don't overlap.
 *
 * I'm doing something simple here where I shift the labels left/right. I don't try to
 * move the labels vertically or draw a line from the labels to the cut-sites (like on
 * the circular viewer).
 *
 * Steps:
 *   - move off the left/right side of the screen if the label is too close to the edge
 *   - if the label is too close to another label, move it left/right
 *   - if it's now all the way off the screen, don't render it
 *
 * context: https://github.com/Lattice-Automation/seqviz/issues/104
 */
const withLabels = (cutSites: CutSiteEnhanced[], size: Size): CutSiteLabelled[] => {
  const unlabelled = cutSites
    .filter(c => !c.top.render)
    .map(c => ({ ...c, label: { render: false, text: c.c.name, x: c.highlight.x } }));
  const labelled = cutSites
    .filter(c => c.top.render)
    .sort((a, b) => a.top.x - b.top.x)
    .map(c => ({ ...c, label: { render: c.top.render, text: c.c.name, x: c.highlight.x } }));

  // shift the labels left that will overflow to the right
  const overflow = (c: CutSiteLabelled): boolean => {
    return c.label.x + c.label.text.length * CHAR_WIDTH > size.width;
  };

  labelled.forEach(c => {
    const width = c.label.text.length * CHAR_WIDTH;
    if (overflow(c)) {
      c.label.x = size.width - width;
    }
  });

  // if two labels overlap, shift the righter most one to the right
  const overlap = (c1: CutSiteLabelled, c2: CutSiteLabelled): boolean => {
    return c1.label.x + c1.label.text.length * CHAR_WIDTH > c2.label.x;
  };

  labelled.forEach((c, i) => {
    if (i == 0) return c;
    const last = labelled[i - 1];

    while (overlap(last, c)) {
      c.label.x += CHAR_WIDTH * 2;
    }
    return c;
  });

  // remove labels that now overflow the right of the screen
  labelled.forEach(c => {
    if (overflow(c)) {
      c.label.render = false;
    }
  });

  return unlabelled.concat(labelled);
};

/**
 * This changes the opacity of the enzyme recognition sequence.
 *
 * on hover, an enzyme recognition site should have an opacity of 0.5. 0 otherwise
 * on hover, an enzyme name should have opacity 1.0, 0 otherwise
 */
const onCutSiteHover = (className: string, on = false) => {
  if (!document) return;

  let elements = document.getElementsByClassName(`${className}-label`) as HTMLCollectionOf<HTMLElement>;
  for (let i = 0; i < elements.length; i += 1) {
    elements[i].style.fillOpacity = on ? "1.0" : "0.8";
    elements[i].style.fontWeight = on ? "400" : "300";
  }
  elements = document.getElementsByClassName(className) as HTMLCollectionOf<HTMLElement>;
  for (let i = 0; i < elements.length; i += 1) {
    elements[i].style.fillOpacity = on ? "0.25" : "0";
    elements[i].style.stroke = on ? "black" : "rgb(115, 119, 125)";
  }
};
