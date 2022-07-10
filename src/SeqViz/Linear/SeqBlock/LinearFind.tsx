import * as React from "react";

import randomid from "../../../utils/randomid";
import { SearchResult } from "../../../utils/search";
import { InputRefFuncType } from "../../common";
import { FindXAndWidthType } from "./SeqBlock";

export interface HighlightRegion {
  color?: string;
  end: number;
  start: number;
}

interface FindProps {
  compYDiff: number;
  filteredRows: SearchResult[];
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  highlightedRegions: HighlightRegion[];
  indexYDiff: number;
  inputRef: InputRefFuncType;
  lastBase: number;
  listenerOnly: boolean;
  seqBlockRef: unknown;
}

/**
 * Render rectangles around Search results.
 */
export default function LinearFind(props: FindProps) {
  const {
    filteredRows: searchRows,
    findXAndWidth,
    inputRef,
    firstBase,
    lastBase,
    indexYDiff,
    compYDiff,
    seqBlockRef,
    listenerOnly,
    highlightedRegions,
  } = props;

  return (
    <>
      {/* We use two LinearFindBlocks here because we want to span both the top and bottom strand for a highlight */}
      {highlightedRegions.map(({ start, end, color }) => (
        <React.Fragment key={`highlight-${start}-${end}-1`}>
          <LinearFindBlock
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
          <LinearFindBlock
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
        <LinearFindBlock
          key={JSON.stringify(s)}
          compYDiff={compYDiff}
          direction={s.direction}
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

export const LinearFindBlock = (props: {
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
    inputRef,
    findXAndWidth,
    firstBase,
    lastBase,
    start,
    end,
    seqBlockRef,
    listenerOnly,
    indexYDiff,
    direction,
    compYDiff,
    fillStyle,
  } = props;

  const findBlockProps = {
    cursor: "pointer",
    height: 18,
    stroke: listenerOnly ? "none" : "rgba(0, 0, 0, 0.5)",
    strokeWidth: 1,
    style: { fill: listenerOnly ? "transparent" : fillStyle },
  };

  let { x, width } = findXAndWidth(start, end);
  if (start > end) {
    ({ x, width } = findXAndWidth(
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

  return <rect key={id} ref={inputRef(id, selReference)} id={id} width={width} x={x} y={y} {...findBlockProps} />;
};
