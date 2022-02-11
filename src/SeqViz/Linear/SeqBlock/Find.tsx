import * as React from "react";

import randomid from "../../../utils/randomid";

/**
 * Render rectangles around Search results.
 */
export default props => {
  const {
    filteredRows: searchRows,
    findXAndWidth,
    indexYDiff,
    compYDiff,
    seqBlockRef,
    inputRef,
    firstBase,
    lastBase,
    listenerOnly = false,
  } = props;

  if (!searchRows.length) {
    return null;
  }

  const findProps = {
    height: 18,
    stroke: listenerOnly ? "none" : "rgba(0, 0, 0, 0.5)",
    cursor: "pointer",
    strokeWidth: 1,
    style: { fill: listenerOnly ? "transparent" : "rgba(255, 251, 7, 0.5)" },
  };

  return searchRows.map(s => {
    let { x, width } = findXAndWidth(s.start, s.end);
    if (s.start > s.end) {
      ({ x, width } = findXAndWidth(
        s.start > lastBase ? firstBase : Math.max(firstBase, s.start),
        s.end < firstBase ? lastBase : Math.min(lastBase, s.end)
      ));
    }

    const id = randomid();
    const selReference = {
      id: id,
      start: s.start,
      end: s.end,
      type: "FIND",
      element: seqBlockRef,
    };

    let y = indexYDiff - findProps.height / 2; // template row result
    if (s.direction < 0) {
      y = compYDiff - findProps.height / 2; // complement row result
    }

    return <rect key={id} id={id} x={x - 1} y={y} width={width} ref={inputRef(id, selReference)} {...findProps} />;
  });
};
