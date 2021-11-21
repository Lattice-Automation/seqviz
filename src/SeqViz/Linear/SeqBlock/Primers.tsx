import * as React from "react";

import randomid from "../../../utils/randomid";

import { reverse } from "../../../utils/sequence";

/**
 * a single row of primers. Multiple of these may be in one seqBlock
 * vertically stacked on top of one another in non-overlapping arrays
 */
class PrimerRow extends React.PureComponent {
  // Handles the rendering of a single Primer within a primer row
  renderPrimer = singlePrimer => {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'inputRef' does not exist on type 'Readon... Remove this comment to see the full error message
      inputRef,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seqBlockRef' does not exist on type 'Rea... Remove this comment to see the full error message
      seqBlockRef,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'findXAndWidth' does not exist on type 'R... Remove this comment to see the full error message
      findXAndWidth,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstBase' does not exist on type 'Reado... Remove this comment to see the full error message
      firstBase,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'lastBase' does not exist on type 'Readon... Remove this comment to see the full error message
      lastBase,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fullSeq' does not exist on type 'Readonl... Remove this comment to see the full error message
      fullSeq,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'charWidth' does not exist on type 'Reado... Remove this comment to see the full error message
      charWidth: characterWidth,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fontSize' does not exist on type 'Readon... Remove this comment to see the full error message
      fontSize,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'zoomed' does not exist on type 'Readonly... Remove this comment to see the full error message
      zoomed
    } = this.props;
    const primerUUID = randomid();
    const { direction, start = 0, end = 0, sequence, id } = singlePrimer;

    const primerLength = end < start ? fullSeq.length - start + end : end - start;

    let { x: origX, width } = findXAndWidth(start, end);

    // does the primer begin or end within this seqBlock with a directionality?
    const endFWD = direction === 1 && end > firstBase && end <= lastBase;
    const endREV = direction === -1 && start > firstBase && start <= lastBase;

    // does the primer overflow to the left or the right of this seqBlock?
    let primerOverflowLeft = start < firstBase;
    let primerOverflowRight = end > lastBase || start === end; // start === end means covers whole plasmid

    const primerPart = () => {
      if (!primerOverflowLeft && primerOverflowRight) return "TOP";
      if (primerOverflowLeft && !primerOverflowRight) return "BOTTOM";
      if (primerOverflowLeft && primerOverflowRight) return "MIDDLE";
      return "WHOLE";
    };

    const crossZero = start > end;
    const crossZeroPre = crossZero && lastBase > start;
    const crossZeroPost = crossZero && lastBase < start;

    if (crossZero) {
      ({ x: origX, width } = findXAndWidth(
        start > lastBase ? firstBase : Math.max(firstBase, start),
        end < firstBase ? lastBase : Math.min(lastBase, end)
      ));

      if (crossZeroPost) {
        primerOverflowLeft = true;
        primerOverflowRight = end > lastBase;
      }

      if (crossZeroPre) {
        primerOverflowLeft = start < firstBase;
        primerOverflowRight = true;
      }
    } else if (start === end) {
      // the primer circles the entire plasmid and we aren't currently in a SeqBlock
      // where the primer starts or ends
      ({ x: origX, width } = findXAndWidth(start, end + fullSeq.length));
    }

    // create padding on either side, vertically, of an primer
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'height' does not exist on type 'Readonly... Remove this comment to see the full error message
    let { height } = this.props;
    height *= 0.4;

    const rectProps = {
      shapeRendering: "geometricPrecision"
    };

    const textProps = {
      dominantBaseline: "middle",
      cursor: "pointer",
      lengthAdjust: "spacing",
      textRendering: "optimizeLegibility",
      style: {
        color: "black",
        fontWeight: 150
      }
    };

    const cW = 4; // jagged cutoff width
    const cH = height / 4; // jagged cutoff height
    const [x, w] = [origX, width];

    let { mismatches } = singlePrimer;

    const mismatchPathes = [];
    const forward = direction === 1;
    let name = forward ? sequence : reverse(sequence);

    // If there are mismatches, add "." into primer name
    if (mismatches && mismatches.length > 0) {
      mismatches.forEach(mismatch => {
        const { start: mismatchStart, end: mismatchEnd } = mismatch;
        const mismatchLength = mismatchEnd - mismatchStart;
        name = forward
          ? name.substring(0, mismatch.start) + " ".repeat(mismatchLength) + name.substring(mismatch.end)
          : reverse(
              reverse(name).substring(0, mismatch.start) +
                " ".repeat(mismatchLength) +
                reverse(name).substring(mismatch.end)
            );
      });
    }

    // create the SVG path, starting at the topLeft and working clockwise
    // there is additional logic here for if the primer overflows
    // to the left or right of this seqBlock, where a "jagged edge" is created
    const topLeft = "M 0 0";
    const topRight = endFWD
      ? `L ${w - 8} 0
      l -10 -10
      l 8 0
      l 10 10`
      : `L ${width} 0`; // forward arrow

    let bottomRight = `L ${w} ${height}`; // flat right edge
    if (primerOverflowRight && w > 10 * cW) {
      bottomRight = `
				L ${w - cW} ${cH}
				L ${w} ${2 * cH}
				L ${w - cW} ${3 * cH}
				L ${w} ${4 * cH}`; // jagged right edge
    } else if (endFWD) {
      bottomRight = `
        L ${w} ${height}`; // flat edge
    }

    let bottomLeft = `L 0 ${height} L 0 0`; // flat left edge
    if (primerOverflowLeft && w > 10 * cW) {
      bottomLeft = `
				L 0 ${height}
				L ${cW} ${3 * cH}
				L 0 ${2 * cH}
				L ${cW} ${cH}
				L 0 0`; // jagged left edge
    } else if (endREV) {
      bottomLeft = `
        L ${w} ${height}
        l ${8 - w} 0
        l 10 10
        l -8 0
        l -10 -10
        l 0 ${0 - height}
        `; // reverse arrow
    }
    const mismatchLength = mismatch => mismatch.end - mismatch.start;

    const mismatchOverflowLeft = mismatch => {
      if (crossZeroPost) {
        return forward
          ? mismatch.end - (fullSeq.length - start) > firstBase && mismatch.start - (fullSeq.length - start) < firstBase
          : end - mismatch.start - mismatchLength(mismatch) < firstBase &&
              end - mismatch.end + mismatchLength(mismatch) > firstBase;
      }
      return forward
        ? start + mismatch.end > firstBase && start + mismatch.start < firstBase
        : start + (primerLength - mismatch.end) < firstBase && start + (primerLength - mismatch.start) > firstBase;
    };

    const mismatchOverflowRight = mismatch => {
      if (crossZeroPost) {
        return forward
          ? mismatch.end - (fullSeq.length - start) > lastBase && mismatch.start - (fullSeq.length - start) < lastBase
          : end - mismatch.start - mismatchLength(mismatch) < lastBase &&
              end - mismatch.end + mismatchLength(mismatch) > lastBase;
      }
      return forward
        ? start + mismatch.end > lastBase && start + mismatch.start < lastBase
        : start + (primerLength - mismatch.end) < lastBase && start + (primerLength - mismatch.start) > lastBase;
    };

    const mismatchOverflow = mismatch => {
      if (mismatchOverflowLeft(mismatch)) return "LEFT";
      if (mismatchOverflowRight(mismatch)) return "RIGHT";
      return "NONE";
    };

    const charWidth = characters => characters * characterWidth;

    const drawMismatch = mismatch => {
      const mStart = mismatch.start; // relative to primer
      const mEnd = mismatch.end; // relative to primer
      let mismatchName = ""; // label for mismatch (base pairs)
      let mismatchPath = ""; // path for box enclosing mismatch
      // forward primers
      if (forward) {
        let mismatchStart = start + mStart; // relative to sequence
        let mismatchEnd = start + mEnd; // relative to sequence
        if (crossZeroPost) {
          mismatchStart = mStart - (fullSeq.length - start);
          mismatchEnd = mEnd - (fullSeq.length - start);
        }
        // generate mismatch label
        const overflowLeftAdjust = firstBase - mismatchStart;
        const overflowRightAdjust = lastBase - mismatchEnd;
        switch (mismatchOverflow(mismatch)) {
          // mismatch crosses into seqBlock above
          case "LEFT":
            mismatchName = sequence.substring(mStart + overflowLeftAdjust, mEnd);
            break;
          // mismatch crosses into seqBlock below
          case "RIGHT":
            mismatchName = sequence.substring(mStart, mEnd + overflowRightAdjust);
            break;
          // mismatch doesn't cross seqBlocks
          default:
            mismatchName = sequence.substring(mStart, mEnd);
        }
        // generate mismatch path
        const mNameLength = mismatchName.length; // length of part of this mismatch in this seqBlock
        const overflowNameAdjust = mismatchLength(mismatch) - mNameLength; // length of part of this mismatch in other seqBlock
        switch (mismatchOverflow(mismatch)) {
          // mismatch crosses into seqBlock above
          case "LEFT":
            mismatchPath = `M 0 0
            m ${charWidth(firstBase - mismatchStart - overflowNameAdjust)} 0
            l 0 ${0 - height}
            l ${charWidth(mNameLength)} 0
            l 0 ${height}`;
            break;
          // mismatch crosses into seqBlock below or doesn't cross seqBlocks
          default:
            // mismatch is in the top part of a multi-seqBlock primer
            if (primerPart() === "TOP") {
              mismatchPath = `M 0 0
              m ${charWidth(mStart)} 0
              l 0 ${0 - height}
              l ${charWidth(mNameLength)} 0
              l 0 ${height}`;
            } else {
              mismatchPath = `M 0 0
              m ${charWidth(mismatchStart - firstBase)} 0
              l 0 ${0 - height}
              l ${charWidth(mNameLength)} 0
              l 0 ${height}`;
            }
        }
        // reverse primers
      } else if (!forward) {
        let mismatchStart = end - mStart; // relative to sequence
        let mismatchEnd = end - mEnd; // relative to sequence
        if (crossZeroPre) {
          mismatchStart = start + (primerLength - mStart);
          mismatchEnd = start + (primerLength - mEnd);
        }
        // generate mismatch labels
        const overflowLeftAdjust = firstBase - mismatchEnd;
        const overflowRightAdjust = lastBase - mismatchStart;
        switch (mismatchOverflow(mismatch)) {
          // mismatch crosses into seqBlock above
          case "LEFT":
            mismatchName = reverse(sequence.substring(mEnd - overflowLeftAdjust, mStart));
            break;
          // mismatch crosses into seqBlock below
          case "RIGHT":
            mismatchName = reverse(sequence.substring(mEnd, mStart - overflowRightAdjust));
            break;
          // mismatch doesn't cross seqBlocks
          default:
            mismatchName = reverse(sequence.substring(mEnd, mStart));
        }

        // generate mismatch path
        const mNameLength = mismatchName.length; // length of part of this mismatch in this seqBlock
        const overflowNameAdjust = mismatchLength(mismatch) - mNameLength; // length of part of this mismatch in other seqBlock
        switch (mismatchOverflow(mismatch)) {
          // mismatch crosses into seqBlock below
          case "RIGHT":
            mismatchPath = `M 0 ${height}
            m ${width - charWidth(mismatchStart - lastBase - overflowNameAdjust)} 0
            l 0 ${height}
            l ${0 - charWidth(mNameLength)} 0
            l 0 ${0 - height}`;
            break;
          // mismatch crosses into seqBlock above or doesn't cross seqBlocks
          default:
            // mismatch is in the bottom part of a multi-seqBlock primer
            if (primerPart() === "BOTTOM") {
              mismatchPath = `M 0 ${height}
              m ${charWidth(name.length - mStart)} 0
              l 0 ${height}
              l ${0 - charWidth(mNameLength)} 0
              l 0 ${0 - height}`;
            } else {
              mismatchPath = `M 0 ${height}
              m ${width - charWidth(lastBase - mismatchStart)} 0
              l 0 ${height}
              l ${0 - charWidth(mNameLength)} 0
              l 0 ${0 - height}`;
            }
        }
      }
      return { mismatchName, mismatchPath };
    };

    // Iterate through mismatches
    // generate a path and add to path array
    // generate a name and add to mismatch array
    const drawMismatches = mismatchRow =>
      mismatchRow.map(mismatch => {
        const mismatchElement = mismatch;
        const { mismatchName, mismatchPath } = drawMismatch(mismatch);
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
        mismatchPathes.push(mismatchPath);
        mismatchElement.name = mismatchName;
        return mismatchElement;
      });

    // if primer crosses seqBlocks and this is the top row
    if (primerPart() === "TOP") {
      if (crossZeroPre) {
        name = name.substring(0, lastBase - start);
        if (mismatches && mismatches.length > 0) {
          mismatches = forward
            ? mismatches.filter(mismatch => mismatch.start - (fullSeq.length - start) < lastBase)
            : mismatches.filter(mismatch => primerLength - mismatch.end - (fullSeq.length - start) < lastBase);
          mismatches = drawMismatches(mismatches);
        }
      } else {
        name = name.substring(0, lastBase - start);
        if (mismatches && mismatches.length > 0) {
          mismatches = forward
            ? mismatches.filter(mismatch => start + mismatch.start < lastBase)
            : mismatches.filter(mismatch => start + (primerLength - mismatch.end) < lastBase);
          mismatches = drawMismatches(mismatches);
        }
      }
      // if primer crosses seqBlocks and this is a middle row
    } else if (primerPart() === "MIDDLE") {
      if (crossZeroPost) {
        name = name.substring(
          fullSeq.length - start + firstBase,
          fullSeq.length - start + firstBase + (lastBase - firstBase)
        );
        if (mismatches && mismatches.length > 0) {
          mismatches = forward
            ? mismatches.filter(
                mismatch =>
                  mismatch.end - (fullSeq.length - start) > firstBase &&
                  mismatch.start - (fullSeq.length - start) < lastBase
              )
            : mismatches.filter(
                mismatch =>
                  primerLength - mismatch.start - (fullSeq.length - start) > firstBase &&
                  primerLength - mismatch.end - (fullSeq.length - start) < lastBase
              );
        }
      } else {
        name = name.substring(firstBase - start, firstBase - start + lastBase - firstBase);
        if (mismatches && mismatches.length > 0) {
          mismatches = forward
            ? mismatches.filter(mismatch => start + mismatch.end > firstBase && start + mismatch.start < lastBase)
            : mismatches.filter(
                mismatch =>
                  start + (primerLength - mismatch.start) > firstBase &&
                  start + (primerLength - mismatch.end) < lastBase
              );
        }
      }
      mismatches = drawMismatches(mismatches);

      // if primer crosses seqBlocks and is this the bottom row
    } else if (primerPart() === "BOTTOM") {
      if (crossZeroPost) {
        name = name.substring(fullSeq.length - start + firstBase);
        if (mismatches && mismatches.length > 0) {
          mismatches = forward
            ? mismatches.filter(mismatch => mismatch.end - (fullSeq.length - start) > firstBase)
            : mismatches.filter(mismatch => primerLength - mismatch.start - (fullSeq.length - start) > firstBase);
        }
      } else {
        name = name.substring(firstBase - start);
        if (mismatches && mismatches.length > 0) {
          mismatches = forward
            ? mismatches.filter(mismatch => start + mismatch.end > firstBase)
            : mismatches.filter(mismatch => start + (primerLength - mismatch.start) > firstBase);
        }
      }

      mismatches = drawMismatches(mismatches);

      // if primer doesn't cross seqblocks
    } else {
      mismatches =
        mismatches && mismatches.length > 0
          ? mismatches.map(mismatch => {
              const mismatchElement = mismatch;
              mismatchElement.name = sequence.substring(mismatch.start, mismatch.end);
              if (forward) {
                // forward primers
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
                mismatchPathes.push(`M 0 0
              m ${charWidth(mismatch.start)} 0
              l 0 ${0 - height}
              l ${charWidth(mismatchLength(mismatch))} 0
              l 0 ${height}`);
              } else if (!forward) {
                // reverse primers
                mismatchElement.name = reverse(sequence.substring(mismatch.end, mismatch.start));
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
                mismatchPathes.push(`M 0 ${height}
              m ${charWidth(name.length - mismatch.start)} 0
              l 0 ${height}
              l ${charWidth(0 - mismatchLength(mismatch))} 0
              l 0 ${0 - height}`);
              }
              return mismatchElement;
            })
          : [];
    }

    const mismatchPath = mismatchPathes.join(" ");

    const linePath = `${topLeft} ${topRight} ${bottomRight} ${bottomLeft} ${mismatchPath}`;

    const primerPath = (
      <path
        id={id}
        ref={inputRef(`${id}`, {
          ref: `${id}`,
          start: start,
          end: end,
          type: "PRIMER",
          element: seqBlockRef
        })}
        className={id}
        style={{
          fillOpacity: 0.1,
          cursor: "pointer",
          stroke: "#1b1d21",
          strokeWidth: 0.5
        }}
        {...rectProps}
        d={linePath}
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'hoverOtherPrimerRows' does not exist on ... Remove this comment to see the full error message
        onMouseOver={() => this.hoverOtherPrimerRows(`${id}`, 0.2)}
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'hoverOtherPrimerRows' does not exist on ... Remove this comment to see the full error message
        onMouseOut={() => this.hoverOtherPrimerRows(`${id}`, 0.1)}
        onFocus={() => 0}
        onBlur={() => 0}
      />
    );

    const getMismatchX = mismatch => {
      const overflowL = mismatchOverflowLeft(mismatch);
      const overflowR = mismatchOverflowRight(mismatch);

      if (forward) {
        if (primerPart() === "BOTTOM" || primerPart() === "MIDDLE") {
          if (crossZeroPost && forward) {
            return overflowL ? 0 : charWidth(mismatch.start - (fullSeq.length - start) - firstBase);
          }
          return overflowL
            ? charWidth(mismatch.start - firstBase + start + (mismatchLength(mismatch) - mismatch.name.length))
            : charWidth(mismatch.start - firstBase + start);
        }
        return charWidth(mismatch.start);
      }
      if (primerPart() === "TOP" || primerPart() === "MIDDLE") {
        if (crossZeroPost) {
          if (overflowL) {
            return 0;
          }
          if (overflowR) {
            return width - charWidth(mismatch.end + lastBase - end);
          }
          return forward
            ? charWidth(mismatch.start - (fullSeq.length - start) - firstBase)
            : width - charWidth(mismatch.end + lastBase - end - (mismatchLength(mismatch) - mismatch.name.length));
        }
        if (crossZeroPre) {
          return overflowL
            ? width - charWidth(lastBase - (start + (primerLength - mismatch.start)) + mismatch.name.length)
            : width - charWidth(lastBase - (start + (primerLength - mismatch.start)) + mismatchLength(mismatch));
        }
        return overflowR
          ? width - charWidth(mismatch.end + lastBase - end)
          : width - charWidth(mismatch.end + lastBase - end - (mismatchLength(mismatch) - mismatch.name.length));
      }
      return width - charWidth(mismatch.end - (mismatchLength(mismatch) - mismatch.name.length));
    };
    return (
      <g key={`${id}_${primerUUID}-primer`} id={id} transform={`translate(${x}, 0)`}>
        <text
          key={`${id}_${primerUUID}-primer`}
          fontSize={fontSize}
          x={width / 2}
          y={height / 2 + 1.4}
          textAnchor="middle"
          {...textProps}
          textLength={width}
          id={id}
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'hoverOtherPrimerRows' does not exist on ... Remove this comment to see the full error message
          onMouseOver={() => this.hoverOtherPrimerRows(id, 0.2)}
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'hoverOtherPrimerRows' does not exist on ... Remove this comment to see the full error message
          onMouseOut={() => this.hoverOtherPrimerRows(id, 0.1)}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          {zoomed ? `${name}` : ""}
        </text>
        ,
        {mismatches &&
          mismatches.map(mismatch => (
            <text
              key={`mismatch_text_${id}_${primerUUID}`}
              fontSize={fontSize}
              x={getMismatchX(mismatch)}
              y={forward ? 0 - height / 2 : (height * 3) / 2 + 1.4}
              textAnchor="left"
              {...textProps}
              textLength={charWidth(mismatch.name.length)}
              id={id}
            >
              {zoomed ? `${mismatch.name}` : ""}
            </text>
          ))}
        ,{primerPath}
      </g>
    );
  };

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'y' does not exist on type 'Readonly<{}> ... Remove this comment to see the full error message
    const { y, primers } = this.props;
    const gTranslate = `translate(0, ${y - 5})`;
    return (
      <g transform={gTranslate} className="linear-primer-row">
        {primers.map(this.renderPrimer)}
      </g>
    );
  }
}

export default class PrimerRows extends React.PureComponent {
  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'showPrimers' does not exist on type 'Rea... Remove this comment to see the full error message
      showPrimers,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'forwardPrimerRows' does not exist on typ... Remove this comment to see the full error message
      forwardPrimerRows,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'reversePrimerRows' does not exist on typ... Remove this comment to see the full error message
      reversePrimerRows,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'direction' does not exist on type 'Reado... Remove this comment to see the full error message
      direction,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'yDiff' does not exist on type 'Readonly<... Remove this comment to see the full error message
      yDiff,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'findXAndWidth' does not exist on type 'R... Remove this comment to see the full error message
      findXAndWidth,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'inputRef' does not exist on type 'Readon... Remove this comment to see the full error message
      inputRef,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seqBlockRef' does not exist on type 'Rea... Remove this comment to see the full error message
      seqBlockRef,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onUnmount' does not exist on type 'Reado... Remove this comment to see the full error message
      onUnmount,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstBase' does not exist on type 'Reado... Remove this comment to see the full error message
      firstBase,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'lastBase' does not exist on type 'Readon... Remove this comment to see the full error message
      lastBase,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fullSeq' does not exist on type 'Readonl... Remove this comment to see the full error message
      fullSeq,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'charWidth' does not exist on type 'Reado... Remove this comment to see the full error message
      charWidth,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'zoomed' does not exist on type 'Readonly... Remove this comment to see the full error message
      zoomed,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fontSize' does not exist on type 'Readon... Remove this comment to see the full error message
      fontSize
    } = this.props;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'elementHeight' does not exist on type 'R... Remove this comment to see the full error message
    let { elementHeight } = this.props;
    elementHeight *= 3;

    if (!showPrimers) return null;
    const primerRows = direction === 1 ? forwardPrimerRows : reversePrimerRows;

    return (
      <g className="la-vs-linear-primers">
        {primerRows.map((primerRow, i) => {
          const id = randomid();

          let rowDiff = yDiff + i * elementHeight;
          if (direction === 1) {
            rowDiff += 0.35 * elementHeight;
          }

          return (
            <PrimerRow
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
              id={id}
              primers={primerRow}
              y={rowDiff}
              height={elementHeight}
              key={`${id}-primer-linear-row`}
              inputRef={inputRef}
              seqBlockRef={seqBlockRef}
              onUnmount={onUnmount}
              findXAndWidth={findXAndWidth}
              firstBase={firstBase}
              lastBase={lastBase}
              fullSeq={fullSeq}
              direction={direction}
              charWidth={charWidth}
              fontSize={fontSize}
              zoomed={zoomed}
            />
          );
        })}
      </g>
    );
  }
}
