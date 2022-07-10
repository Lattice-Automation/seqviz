import * as React from "react";

import randomid from "../../../utils/randomid";
import { SearchResult } from "../../../utils/search";
import { InputRefFuncType } from "../../common";
import { FindXAndWidthType } from "./SeqBlock";

export interface HighlightRegion {
  start: number;
  end: number;
  color?: string;
}

interface FindProps {
  filteredRows: SearchResult[];
  indexYDiff: number;
  compYDiff: number;
  seqBlockRef: unknown;
  inputRef: InputRefFuncType;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  lastBase: number;
  listenerOnly: boolean;
  highlightedRegions: HighlightRegion[];
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
            inputRef={inputRef}
            findXAndWidth={findXAndWidth}
            firstBase={start}
            lastBase={end}
            start={start}
            end={end}
            indexYDiff={indexYDiff}
            direction={1}
            seqBlockRef={seqBlockRef}
            listenerOnly={listenerOnly}
            compYDiff={compYDiff}
            fillStyle={color || "rgba(0, 251, 7, 0.5)"}
          />
          <LinearFindBlock
            inputRef={inputRef}
            findXAndWidth={findXAndWidth}
            firstBase={start}
            lastBase={end}
            start={start}
            end={end}
            indexYDiff={indexYDiff}
            direction={-1}
            seqBlockRef={seqBlockRef}
            listenerOnly={listenerOnly}
            compYDiff={compYDiff}
            fillStyle={color || "rgba(0, 251, 7, 0.5)"}
          />
        </React.Fragment>
      ))}
      {searchRows.map(s => (
        <LinearFindBlock
          key={JSON.stringify(s)}
          inputRef={inputRef}
          findXAndWidth={findXAndWidth}
          firstBase={firstBase}
          lastBase={lastBase}
          start={s.start}
          end={s.end}
          indexYDiff={indexYDiff}
          direction={s.direction}
          seqBlockRef={seqBlockRef}
          listenerOnly={listenerOnly}
          compYDiff={compYDiff}
          fillStyle="rgba(255, 251, 7, 0.5)"
        />
      ))}
    </>
  );
}

export const LinearFindBlock = (props: {
  inputRef: InputRefFuncType;
  findXAndWidth: FindXAndWidthType;
  indexYDiff: number;
  firstBase: number;
  lastBase: number;
  start: number;
  end: number;
  seqBlockRef: unknown;
  listenerOnly: boolean;
  direction: -1 | 1;
  compYDiff: number;
  fillStyle: string;
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
    height: 18,
    stroke: listenerOnly ? "none" : "rgba(0, 0, 0, 0.5)",
    cursor: "pointer",
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
    id: id,
    start: start,
    end: end,
    type: "FIND",
    element: seqBlockRef,
  };

  let y = indexYDiff - 1; // template row result
  if (direction < 0) {
    y = compYDiff - 1; // complement row result
  }

  return <rect key={id} id={id} x={x} y={y} width={width} ref={inputRef(id, selReference)} {...findBlockProps} />;
};
