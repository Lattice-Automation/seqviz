import * as React from "react";
import shortid from "shortid";

/**
 * Render rectangles around Search results. Yellow by default. Orange if active search element
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
    listenerOnly = false
  } = props;

  if (!searchRows.length) {
    return null;
  }

  const findProps = listenerOnly
    ? {
        stroke: "none",
        height: 18,
        fill: "transparent",
        cursor: "pointer",
        style: { fill: "transparent" },
        className: "la-vz-linear-sel-block"
      }
    : {
        height: 18,
        stroke: "black",
        strokeWidth: 0.8,
        cursor: "pointer",
        className: "la-vz-linear-sel-block"
      };

  return searchRows.map(s => {
    let { x, width } = findXAndWidth(s.start, s.end);
    if (s.start > s.end) {
      ({ x, width } = findXAndWidth(
        s.start > lastBase ? firstBase : Math.max(firstBase, s.start),
        s.end < firstBase ? lastBase : Math.min(lastBase, s.end)
      ));
    }
    const fill = "rgba(255, 251, 7, 0.5)";
    const id = shortid.generate();
    const selReference = {
      id: id,
      start: s.start,
      end: s.end,
      type: "FIND",
      element: seqBlockRef
    };

    let y = indexYDiff - findProps.height / 2; // template row result
    if (s.direction < 0) {
      y = compYDiff - findProps.height / 2; // complement row result
    }

    return (
      <rect
        x={x}
        y={y}
        width={width}
        style={{ fill }}
        key={id}
        id={id}
        ref={inputRef(id, selReference)}
        {...findProps}
      />
    );
  });
};
