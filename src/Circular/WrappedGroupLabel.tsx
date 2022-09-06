import * as React from "react";

import { CHAR_WIDTH, ILabel } from "./Circular";
import { GroupedLabelsWithCoors } from "./Labels";

interface WrappedGroupLabelProps {
  group: GroupedLabelsWithCoors;
  lineHeight: number;
  setHoveredGroup: (hoveredGroup: string) => void;
  size: {
    height: number;
    width: number;
  };
}

/**
 * a component that groups several other labels together so they're all viewable at once
 */
export default class WrappedGroupLabel extends React.Component<WrappedGroupLabelProps> {
  /**
   * given the currently active annotation block, with multiple annotations and enzymes,
   * render each in a single "block", which is a g element with a rect "containing" the
   * names. This is slightly tricky because we can't put the text elements inside
   * the rect as though it were a div and have them fill it. instead, we must calculate
   * the height and width of the resulting annotaiton block
   */
  render() {
    const {
      group,
      lineHeight,
      setHoveredGroup,
      size: { height, width },
    } = this.props;

    // utility function for calculating the width of the last row before this one
    // the +1 after name.length is for a comma
    const calcRowWidth = (row: ILabel[]) => row.reduce((acc, label) => acc + (label.name.length + 1) * CHAR_WIDTH, 0);

    // group the labels into rows with a preference with widths less than 200px
    const lastRow = (acc: ILabel[][]) => acc[acc.length - 1];
    const labelRows = group.labels.reduce((acc: ILabel[][], l: ILabel) => {
      const nameWidth = l.name.length * CHAR_WIDTH;
      if (nameWidth > width) {
        // handle an edge case where the annotation name is MASSIVE and
        // greater than the width of the sequence viewer
        // split the name into separate rows so it's at max 75% of the
        // seq viewer's width, but each still referencing the original label
        const maxCharPerRow = Math.floor((width * 0.75) / CHAR_WIDTH);
        const splitRegex = new RegExp(`.{1,${maxCharPerRow}}`, "g");
        const splitLabelNameRows = l.name.match(splitRegex) || [];
        if (splitLabelNameRows.length) {
          splitLabelNameRows.forEach(splitLabel => {
            acc.push([{ ...l, name: splitLabel.trim() }]);
          });
          return acc;
        }
      }
      if (lastRow(acc)) {
        // this isn't the first element, check width of last label row
        const lastRowWidth = calcRowWidth(lastRow(acc));
        if (lastRowWidth + nameWidth <= 200) {
          // there's space in the last row for this label as well
          acc[acc.length - 1].push(l);
          return acc;
        }
      }
      acc.push([l]); // need to make a new row for this label
      return acc;
    }, []);

    // find the grouping's height and width (max row width)
    const groupHeight = labelRows.length * lineHeight;
    const groupWidth = labelRows.reduce(
      (max, row, i) => Math.max(max, calcRowWidth(row) - (i === labelRows.length - 1 ? CHAR_WIDTH : 0)), // no comma on last row, correct
      0
    );
    // add one CHAR_WIDTH padding to all sides of label box
    const [rectHeight, rectWidth] = [groupHeight, groupWidth].map(x => x + 2 * CHAR_WIDTH);

    // generate the line between the name and plasmid surface
    const forkCoor = group.forkCoor || group.textCoor;
    const linePath = group.forkCoor
      ? `M${group.textCoor.x} ${group.textCoor.y} L${forkCoor.x} ${forkCoor.y}`
      : `M${group.lineCoor.x} ${group.lineCoor.y} L${forkCoor.x} ${forkCoor.y}`;

    // find the upper left coordinate for the group. if this is on the right
    // side of the plasmid, this is upper left. if it's on the left side of
    // the plasmid, it should be upper right
    let { x, y } = group.textCoor;
    x = group.textAnchor === "end" ? x - (group.labels[0].name.length + 3) * CHAR_WIDTH : x; // the +3) is for ",+#"
    y -= CHAR_WIDTH;
    x = Math.max(x, 2 * CHAR_WIDTH); // prevent overflow of left or right side
    x = Math.min(x, width - 2 * CHAR_WIDTH - groupWidth);
    y = Math.max(y, 2 * CHAR_WIDTH); // prevent overflow of top and bottom
    y = Math.min(y, height - 2 * CHAR_WIDTH - groupHeight);

    // add padding to the box by adding/subbing a CHAR_WIDTH from edges
    const groupCoor = { x, y };
    const rectCoor = { x: x - CHAR_WIDTH, y: y - CHAR_WIDTH - 2 };

    const key = `${group.labels[0].id}_overlay`;

    return (
      <g key={key} onMouseLeave={() => setHoveredGroup("")}>
        <path className="la-vz-label-line" d={linePath} />
        <rect fill="white" height={rectHeight} stroke="none" width={rectWidth} {...rectCoor} />
        <text {...groupCoor}>
          {labelRows.map((r, i) => (
            // turn each group of label rows into a text span
            // that's vertically spaced from the row above it
            // add a comma to all but the last label
            <tspan
              key={`${key}_${i}`}
              dominantBaseline="middle"
              x={groupCoor.x}
              y={groupCoor.y + (i + 0.5) * lineHeight}
            >
              {r.map((l, i2) => (
                // every label should have its own id (used by selection
                // handler) and trigger the hoverCutSite function
                // if it's an enzyme
                <React.Fragment key={l.id}>
                  <tspan
                    className="la-vz-circular-label"
                    dominantBaseline="middle"
                    id={l.id}
                    tabIndex={-1}
                    y={groupCoor.y + (i + 0.5) * lineHeight}
                  >
                    {l.name}
                  </tspan>
                  {i2 < r.length - 1 || i !== labelRows.length - 1 ? "," : ""}
                </React.Fragment>
              ))}
            </tspan>
          ))}
        </text>
        <rect fill="none" height={rectHeight} stroke="black" strokeWidth={1.5} width={rectWidth} {...rectCoor} />
      </g>
    );
  }
}
