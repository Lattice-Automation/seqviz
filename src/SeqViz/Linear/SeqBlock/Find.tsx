import * as React from "react";

import { Highlight, InputRefFuncType, Range } from "../../../elements";
import randomid from "../../../utils/randomid";
import { FindXAndWidthType } from "./SeqBlock";

interface FindProps {
  compYDiff: number;
  filteredRows: Range[];
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  highlights: Highlight[];
  indexYDiff: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
}

/**
 * Render rectangles around Search results.
 */
export default function Find(props: FindProps) {
  const {
    compYDiff,
    filteredRows: searchRows,
    findXAndWidth,
    firstBase,
    highlights,
    indexYDiff,
    inputRef,
    lastBase,
    listenerOnly,
    seqBlockRef,
  } = props;

  return (
    <>
      {/* We use two LinearFindBlocks here because we want to span both the top and bottom strand for a highlight */}
      {highlights.map(({ color, end, id, start }) => (
        <React.Fragment key={`la-vz-highlight-${id}`}>
          <FindBlock
            compYDiff={compYDiff}
            direction={1}
            end={end}
            fillStyle={color || "rgba(0, 251, 7, 0.5)"}
            findXAndWidth={findXAndWidth}
            firstBase={start}
            indexYDiff={indexYDiff}
            inputRef={inputRef}
            lastBase={end}
            listenerOnly={listenerOnly}
            seqBlockRef={seqBlockRef}
            start={start}
          />
          <FindBlock
            compYDiff={compYDiff}
            direction={-1}
            end={end}
            fillStyle={color || "rgba(0, 251, 7, 0.5)"}
            findXAndWidth={findXAndWidth}
            firstBase={start}
            indexYDiff={indexYDiff}
            inputRef={inputRef}
            lastBase={end}
            listenerOnly={listenerOnly}
            seqBlockRef={seqBlockRef}
            start={start}
          />
        </React.Fragment>
      ))}
      {searchRows.map(s => (
        <FindBlock
          key={JSON.stringify(s)}
          compYDiff={compYDiff}
          direction={s.direction || 1}
          end={s.end}
          fillStyle="rgba(255, 251, 7, 0.5)"
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
}

export const FindBlock = (props: {
  compYDiff: number;
  direction: -1 | 1;
  end: number;
  fillStyle: string;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  indexYDiff: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
  start: number;
}) => {
  const {
    compYDiff,
    direction,
    end,
    fillStyle,
    findXAndWidth,
    firstBase,
    indexYDiff,
    inputRef,
    lastBase,
    listenerOnly,
    seqBlockRef,
    start,
  } = props;

  let { width, x } = findXAndWidth(start, end);
  if (start > end) {
    ({ width, x } = findXAndWidth(
      start > lastBase ? firstBase : Math.max(firstBase, start),
      end < firstBase ? lastBase : Math.min(lastBase, end)
    ));
  }
  const id = randomid();
  const selReference = {
    element: seqBlockRef,
    end: end,
    id: id,
    start: start,
    type: "FIND",
  };

  let y = indexYDiff - 1; // template row result
  if (direction < 0) {
    y = compYDiff - 1; // complement row result
  }

  return (
    <rect
      key={id}
      ref={inputRef(id, selReference)}
      cursor="pointer"
      height={18}
      id={id}
      stroke={listenerOnly ? "none" : "rgba(0, 0, 0, 0.5)"}
      strokeWidth={1}
      style={{ fill: listenerOnly ? "transparent" : fillStyle }}
      width={width}
      x={x}
      y={y}
    />
  );
};
