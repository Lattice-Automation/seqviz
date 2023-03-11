import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { Range } from "../elements";
import { randomid } from "../sequence";
import { FindXAndWidthType } from "./SeqBlock";

/**
 * Render rectangles around Search results.
 */
const Find = ({
  compYDiff,
  filteredRows: searchRows,
  findXAndWidth,
  firstBase,
  indexYDiff,
  inputRef,
  lastBase,
  lineHeight,
  listenerOnly,
  zoomed,
}: {
  compYDiff: number;
  filteredRows: Range[];
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  indexYDiff: number;
  inputRef: InputRefFunc;
  lastBase: number;
  lineHeight: number;
  listenerOnly: boolean;
  zoomed: boolean;
}) => (
  <>
    {searchRows.map(s => (
      <FindBlock
        key={JSON.stringify(s)}
        compYDiff={compYDiff}
        direction={s.direction || 1}
        end={s.end}
        findXAndWidth={findXAndWidth}
        firstBase={firstBase}
        indexYDiff={indexYDiff}
        inputRef={inputRef}
        lastBase={lastBase}
        lineHeight={lineHeight}
        listenerOnly={listenerOnly}
        start={s.start}
        zoomed={zoomed}
      />
    ))}
  </>
);

export default Find;

const FindBlock = ({
  compYDiff,
  direction,
  end,
  findXAndWidth,
  firstBase,
  indexYDiff,
  inputRef,
  lastBase,
  lineHeight,
  listenerOnly,
  start,
  zoomed,
}: {
  compYDiff: number;
  direction: -1 | 1;
  end: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  indexYDiff: number;
  inputRef: InputRefFunc;
  lastBase: number;
  lineHeight: number;
  listenerOnly: boolean;
  start: number;
  zoomed: boolean;
}) => {
  let { width, x } = findXAndWidth(start, end);
  if (start > end) {
    ({ width, x } = findXAndWidth(
      start > lastBase ? firstBase : Math.max(firstBase, start),
      end < firstBase ? lastBase : Math.min(lastBase, end)
    ));
  }

  const id = randomid();
  let y = indexYDiff; // template row result
  if (direction < 0 || !zoomed) {
    y = compYDiff; // complement row result
  }

  return (
    <rect
      key={id}
      ref={inputRef(id, {
        end: end,
        id: id,
        start: start,
        type: "FIND",
        viewer: "LINEAR",
      })}
      className="la-vz-search"
      cursor="pointer"
      height={lineHeight}
      id={id}
      shapeRendering="crispEdges"
      stroke={listenerOnly ? "none" : "rgba(0, 0, 0, 0.5)"}
      strokeWidth={1}
      style={listenerOnly ? { fill: "transparent" } : {}}
      width={width}
      x={x}
      y={y}
    />
  );
};
