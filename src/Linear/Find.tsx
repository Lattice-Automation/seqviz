import * as React from "react";

import { InputRefFuncType, Range } from "../elements";
import randomid from "../randomid";
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
  listenerOnly,
  seqBlockRef,
}: {
  compYDiff: number;
  filteredRows: Range[];
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  indexYDiff: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
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
        listenerOnly={listenerOnly}
        seqBlockRef={seqBlockRef}
        start={s.start}
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
  listenerOnly,
  seqBlockRef,
  start,
}: {
  compYDiff: number;
  direction: -1 | 1;
  end: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  indexYDiff: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
  start: number;
}) => {
  let { width, x } = findXAndWidth(start, end);
  if (start > end) {
    ({ width, x } = findXAndWidth(
      start > lastBase ? firstBase : Math.max(firstBase, start),
      end < firstBase ? lastBase : Math.min(lastBase, end)
    ));
  }

  const id = randomid();
  let y = indexYDiff - 1; // template row result
  if (direction < 0) {
    y = compYDiff - 1; // complement row result
  }

  return (
    <rect
      key={id}
      ref={inputRef(id, {
        element: seqBlockRef,
        end: end,
        id: id,
        start: start,
        type: "FIND",
      })}
      className="la-vz-search"
      cursor="pointer"
      height={18}
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
