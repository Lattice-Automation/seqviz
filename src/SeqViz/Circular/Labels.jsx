import * as React from "react";

import { CHAR_WIDTH } from "./Circular.jsx";
import WrappedGroupLabel from "./WrappedGroupLabel.jsx";

/**
 * used to build up all plasmid labels, for annotations, enzymes, etc
 *
 * a caveat to take into account here is that the names, outside the
 * map, might also overlap with one another. There will need to be a check, given
 * the dimensions of each name, calculated by the font, and the size
 * of the viewer, for scaling these names and positioning in the Y-direction
 * to avoid this overlap problem
 *
 * @type {Function}
 */
export default class Labels extends React.Component {
  static getDerivedStateFromProps = (nextProps, prevState) => {
    // I'm storing the name position groups in state because hovering and
    // leaving a hover both trigger a change in whether to render and show
    // the annotation block, it would be expensive to regroup labels
    // on every hover event
    return {
      labelGroups: Labels.groupOverlappingLabels(nextProps),
      hoveredGroup: prevState.hoveredGroup
    };
  };

  /**
   * need to avoid having overlapping names. if names
   * overlap with one another, they should be grouped together and
   * just show the first name of the group. Ex: "M13-rev,GTP,+3"
   *
   * On hover over this group, all the other names should be shown
   *
   * this should return all the informaiton needed to render the
   * name by itself or in a grouping
   */
  static groupOverlappingLabels = props => {
    const {
      radius,
      labels,
      center,
      seqLength,
      findCoor,
      lineHeight,
      size,
      yDiff
    } = props;

    // create a radius outside the plasmid map for placing the names
    const textRadiusAdjust =
      seqLength > 200 ? lineHeight * 2 : lineHeight * 3.5;
    const textRadius = radius + textRadiusAdjust;

    /**
     * add positional information to each label. this includes the coordinates
     * for the textCoor (starting point for text), line (starting point
     * for the line connecting plasmid to name) and the textAnchor (does the name
     * get positioned so it starts at the textCoor or ends at the textCoor?)
     */
    const labelsWithCoordinates = labels
      .reduce((acc, labelRow) => acc.concat(labelRow), []) // flatten the rows
      .map(a => {
        // find the mid-point, vertically, for the label, correcting for entities
        // that cross the zero-index
        let annCenter;
        if (a.type === "enzyme") {
          annCenter = a.start;
        } else if (a.end > a.start) {
          const annMidSum = a.end + a.start;
          annCenter = annMidSum / 2;
        } else {
          const annStart = a.start - seqLength;
          const annMidSum = annStart + a.end;
          annCenter = annMidSum / 2;
        }

        // find the seed-points
        const lineCoor = findCoor(annCenter, radius, true);
        const textCoor = findCoor(annCenter, textRadius, true);
        const left = textCoor.x <= center.x;

        // find the textAnchor, based on which side of plasmid it's on
        const textAnchor = left ? "end" : "start";
        const label = a; // just to keep short-hand in return
        return { label, lineCoor, textCoor, textAnchor };
      });

    // a utility function for checking whether a label and textCoor will overflow
    const groupOverflows = (label, textCoor) => {
      const nameLength = (label.name.length + 4) * CHAR_WIDTH; // +4 for ",+#" and padding
      let overflow = false;

      const heightYPos = textCoor.y + yDiff;
      if (heightYPos < 0 || heightYPos > size.height) {
        overflow = true; // vertical overflow
      } else if (
        textCoor.x - nameLength < 0 ||
        textCoor.x + nameLength > size.width
      ) {
        overflow = true; // horizontal overflow
      }
      return overflow;
    };

    /**
     * merge overlapping names into groupings. If multiple of the labels
     * will overlap with one another, create an array of them and generate an
     * overview name to show for all of them (ex above)
     */
    let labelsGrouped = labelsWithCoordinates.reduce((acc, n) => {
      // search through the other names and check whether any would overlap
      const overlapIndex = acc.findIndex(g => {
        // first check whether the two labels are on the same side of the plasmid
        if (g.textAnchor === n.textAnchor) {
          // characters are 13px high, this is creating 2px of padding
          return Math.abs(g.textCoor.y - n.textCoor.y) < 15;
        }
        return false;
      });

      if (overlapIndex > -1) {
        // add this label to an already existing group
        acc[overlapIndex].labels.push(n.label);
        acc[overlapIndex].grouped = true;
        return acc;
      }

      // this name doesn't overlap with any others
      // check whether the its name overflows the side of the viewer
      const overflow = groupOverflows(n.label, n.textCoor);

      // create a new "group" from this single label
      return acc.concat({
        textAnchor: n.textAnchor,
        textCoor: n.textCoor,
        lineCoor: n.lineCoor,
        labels: [n.label],
        grouped: overflow,
        overflow: overflow
      });
    }, []);

    /**
     * we now want to *ungroup* labels that we can do overlap avoidance for by doing small vertical
     * adjustments. So for every group that is grouped but doesn't overlap (ie, the labels
     * overlap but the group doesn't overflow the viewer's edge), try to spread out the
     * labels so the user can see all of them at once and by default
     *
     * to do this we need to create a forkCoor, where the textCoors of the constituent
     * labels will connect. That forkCoor, in turn, will be what connects to the edge of
     * the plasmid
     */
    labelsGrouped = labelsGrouped.reduce((acc, g, i) => {
      // wasn't grouped or overflows the side of viewer or too many labels to try and help
      if (!g.grouped || g.overflow || g.labels.length > 4) return acc.concat(g);

      // since the labels are sorted (see circular.filterOutsideLabels), we can just check the
      // coordinate of this group's neighbors to see whether we can spread out
      let leftNeighbor = acc[acc.length - 1];
      let rightNeighbor = labelsGrouped[i + 1];
      if (leftNeighbor && leftNeighbor.textAnchor !== g.textAnchor) {
        leftNeighbor = undefined;
      }
      if (rightNeighbor && rightNeighbor.textAnchor !== g.textAnchor) {
        rightNeighbor = undefined;
      }

      // try and split/shift labels horizontally
      const newLabels = g.labels.map((l, i2) => {
        // if on right side of the viewer, shfit rightward
        let xDelta = i2 * (3 * CHAR_WIDTH);
        if (g.textAnchor === "end") xDelta = -xDelta; // otherwise shift leftward

        let yDelta = (g.labels.length - i2) * -15; // start off by shifting upwards 15px if on top half
        if (g.textCoor.y > center.y) yDelta = (g.labels.length - i2) * 15; // otherwise shift down

        const newTextCoor = {
          x: g.textCoor.x + xDelta, // try to make the adjustment to the left/right
          y: g.textCoor.y + yDelta // try ot make the adjustment to the top/bottom
        };
        const overflow = groupOverflows(l, newTextCoor);

        return {
          ...g,
          textCoor: newTextCoor,
          grouped: overflow, // only "grouped" (misnomer) if it overlaps
          overflow: overflow,
          labels: [l], // single label now
          forkCoor: g.textCoor // fork point becomes the old textCoor
        };
      });

      // check whether any of these attempted new labels overlaps with the neighbors
      const overlapWithNeighbors = newLabels.some(l =>
        [leftNeighbor, rightNeighbor].some(
          n => n && Math.abs(n.textCoor.y - l.textCoor.y) < 15
        )
      );
      if (overlapWithNeighbors) return acc.concat(g); // just bail and return the original grouping
      return acc.concat(...newLabels); // add the newly created labels
    }, []);

    /**
     * give actual names. this is in a separate loop because the group name
     * is going to indicate how many other sub labels are in a block/grouping
     * and it's easier to make them once than to update continually in the reduce above
     */
    labelsGrouped = labelsGrouped.map(a => {
      const firstName = a.labels[0].name;
      const restLength = a.labels.length - 1;
      if (a.overflow) {
        // would extend outside the viewer if we included the group name
        return { ...a, name: `+${restLength + 1}` };
      } else if (a.grouped) {
        // does not extend outside width/height of the viewer with group name
        return { ...a, name: `${firstName},+${restLength}` };
      }
      // didn't have to be grouped at all
      return { ...a, name: firstName };
    });

    /**
     * prevent the labels from overflowing the side of the viewer
     * even the small "+1" labels can overflow the sides if the viewer is small enough
     * this pushes their textCoors inward to prevent that
     */
    return labelsGrouped.map(g => {
      let { x, y } = g.textCoor;
      // prevent the text label from overflowing the sides (w/ one char padding)
      x = Math.max(CHAR_WIDTH * (g.name.length + 1), x);
      x = Math.min(size.width - (g.name.length + 1) * CHAR_WIDTH, x);
      y = Math.max(CHAR_WIDTH, y);
      y = Math.min(size.height - CHAR_WIDTH - 13, y); // assuming 13px font-size w/ padding
      return { ...g, textCoor: { x, y } };
    });
  };

  // empty arrays on first load
  state = {
    labelGroups: [],
    hoveredGroup: ""
  };

  // set the currently hovered group
  setHoveredGroup = hoveredGroup => {
    if (hoveredGroup !== this.state.hoveredGroup) {
      this.setState({ hoveredGroup });
    }
  };

  render() {
    const { labelGroups, hoveredGroup } = this.state;
    const { size, lineHeight } = this.props;

    // find the currently hovered group
    const hovered = labelGroups.find(g => g.labels[0].id === hoveredGroup);

    return (
      <g
        className="la-vz-circular-labels"
        onMouseLeave={() => this.setHoveredGroup("")}
      >
        {labelGroups.map(g => {
          const [first] = g.labels;
          // generate the line between the name and plasmid surface
          const fC = g.forkCoor || g.textCoor;
          const labelLines = (
            <React.Fragment>
              <path
                d={`M${g.lineCoor.x} ${g.lineCoor.y} L${fC.x} ${fC.y}`}
                className="la-vz-label-line"
              />
              {g.forkCoor && (
                <path
                  d={`M${fC.x} ${fC.y} L${g.textCoor.x} ${g.textCoor.y}`}
                  className="la-vz-label-line"
                />
              )}
            </React.Fragment>
          );

          if (!g.grouped) {
            // just a single name in this position
            return (
              <g key={first.id}>
                {labelLines}
                <text
                  id={first.id}
                  className="la-vz-circular-label"
                  {...g.textCoor}
                  textAnchor={g.textAnchor}
                  dominantBaseline="middle"
                >
                  {g.name}
                </text>
              </g>
            );
          } else if (first.id === hoveredGroup) {
            // return nothing, this group block needs to be rendered last to be
            // on top of the other elements in the SVG
            return null;
          }
          // a group of names which should render an overlap block
          return (
            <g key={`${first.id}_listener`} id={`${first.id}-label`}>
              {labelLines}
              <text
                id={first.id}
                className="la-vz-circular-label"
                textAnchor={g.textAnchor}
                onMouseEnter={() => this.setHoveredGroup(first.id)}
                dominantBaseline="middle"
                {...g.textCoor}
              >
                {g.name}
              </text>
            </g>
          );
        })}
        {hovered && (
          <WrappedGroupLabel
            group={hovered}
            size={size}
            setHoveredGroup={this.setHoveredGroup}
            lineHeight={lineHeight}
          />
        )}
      </g>
    );
  }
}
