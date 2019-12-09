import * as React from "react";
import shortid from "shortid";

class LinearFind extends React.PureComponent {
  render() {
    const {
      filteredRows: searchRows,
      findXAndWidth,
      indexYDiff,
      compYDiff,
      currSearchIndex,
      seqBlockRef,
      inputRef,
      firstBase,
      lastBase,
      listenerOnly = false
    } = this.props;

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
      const fill =
        s.index === currSearchIndex
          ? "rgba(255, 165, 7, 0.5)"
          : "rgba(255, 251, 7, 0.5)";
      const id = shortid.generate();
      const selReference = {
        id: id,
        start: s.start,
        end: s.end,
        type: "FIND",
        element: seqBlockRef
      };

      return (
        <rect
          x={x}
          y={s.row > 0 ? compYDiff - 10 : indexYDiff - 10}
          width={width}
          style={{ fill }}
          key={id}
          id={id}
          ref={inputRef(id, selReference)}
          {...findProps}
        />
      );
    });
  }
}
export default LinearFind;
