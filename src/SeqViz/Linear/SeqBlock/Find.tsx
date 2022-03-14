import * as React from "react";
import randomid from "../../../utils/randomid";
import { SearchResult } from "../../../utils/search";
import { InputRefFuncType } from "../../common";
import { FindXAndWidthType } from "./SeqBlock";

export interface HighlightRegion {
  start: number;
  end: number;
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
export default function Find(props: FindProps) {
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

  let searchFindBlocks = <></>;
  if (searchRows.length) {
    searchFindBlocks = (
      <>
        {searchRows.map(s => {
          console.table(s);
          return (
            <FindBlock
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
          );
        })}
      </>
    );
  }

  const highlightFindBlocks = (
    <>
      {highlightedRegions.map(({ start, end }) => {
        return (
          <FindBlock
            key={`highlight ${start} ${end}`}
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
            fillStyle="rgba(0, 251, 7, 0.5)"
          />
        );
      })}
    </>
  );

  return (
    <>
      {highlightFindBlocks}
      {searchFindBlocks}
    </>
  );
}

const FindBlock = (props: {
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
  console.table({ start, end, listenerOnly, width });
  const id = randomid();

  const selReference = {
    id: id,
    start: start,
    end: end,
    type: "FIND",
    element: seqBlockRef,
  };

  let y = indexYDiff - findBlockProps.height / 2; // template row result
  if (direction < 0) {
    y = compYDiff - findBlockProps.height / 2; // complement row result
  }

  return <rect key={id} id={id} x={x - 1} y={y} width={width} ref={inputRef(id, selReference)} {...findBlockProps} />;
};
