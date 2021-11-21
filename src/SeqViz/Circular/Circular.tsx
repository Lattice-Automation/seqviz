import * as React from "react";

import bindingSites from "../../utils/bindingSites";
import isEqual from "../../utils/isEqual";
import { stackElements } from "../elementsToRows";
import withViewerHOCs from "../handlers";
import CentralIndexContext from "../handlers/centralIndex";
import Annotations from "./Annotations";
import CutSites from "./CutSites";
import Find from "./Find";
import Index from "./Index";
import Labels from "./Labels";
import Selection from "./Selection";

// this will need to change whenever the css of the plasmid viewer text changes
// just divide the width of some rectangular text by it's number of characters
export const CHAR_WIDTH = 7.801;

class Circular extends React.Component {
  static contextType = CentralIndexContext;

  static getDerivedStateFromProps = nextProps => {
    const lineHeight = 14;
    const annotationsInRows = stackElements(
      nextProps.annotations.filter(ann => ann.type !== "insert"),
      nextProps.seq.length
    );
    const primers = bindingSites(nextProps.primers, nextProps.seq);
    const primersInRows = stackElements(primers, nextProps.seq.length);

    /**
     * find the element labels that need to be rendered outside the plasmid. This is done for
     * annotation names/etc for element titles that don't fit within the width of the element
     * they represent. For example, an annotation might be named "Transcription Factor XYZ"
     * but be only 20bps long on a plasmid that's 20k bps. Obviously that name doesn't fit.
     * But, a gene that's 15k on the same plasmid shouldn't have it's label outside the plasmid
     * when it can easily fit on top of the annotation itself
     */
    const seqLength = nextProps.seq.length;
    const cutSiteLabels = nextProps.cutSites;
    const { radius } = nextProps;
    let innerRadius = radius - 3 * lineHeight;
    const inlinedLabels = [];
    const outerLabels = [];
    annotationsInRows.forEach(r => {
      const circumf = innerRadius * Math.PI;
      r.forEach(ann => {
        // how large is the name of the annotation horizontally (with two char padding)
        const annNameLengthPixels = (ann.name.length + 2) * CHAR_WIDTH;
        // how large would part be if it were wrapped around the plasmid
        let annLengthBases = ann.end - ann.start;
        if (ann.start >= ann.end) annLengthBases += seqLength; // crosses zero-index
        const annLengthPixels = 2 * circumf * (annLengthBases / seqLength);
        if (annNameLengthPixels < annLengthPixels) {
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'any' is not assignable to parame... Remove this comment to see the full error message
          inlinedLabels.push(ann.id);
        } else {
          const { id, name, start, end } = ann;
          const type = "annotation";
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
          outerLabels.push({ id, name, start, end, type });
        }
      });
      innerRadius -= lineHeight;
    });

    cutSiteLabels.forEach(c =>
      outerLabels.push({
        ...c,
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
        start: c.fcut,
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
        type: "enzyme"
      })
    );

    // sort all the labels so they're in ascending order
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'start' does not exist on type 'never'.
    outerLabels.sort((a, b) => Math.min(a.start, a.end) - Math.min(b.start, b.end));

    return {
      seqLength: nextProps.seq.length,
      lineHeight: lineHeight,
      annotationsInRows: annotationsInRows,
      primersInRows: primersInRows,
      inlinedLabels: inlinedLabels,
      outerLabels: outerLabels
    };
  };

  // null arrays on initial load
  state = {
    seqLength: 0,
    lineHeight: 0,
    annotationsInRows: [],
    primersInRows: [],
    inlinedLabels: [],
    outerLabels: []
  };

  /**
   * Deep equality comparison
   */
  shouldComponentUpdate = nextProps => !isEqual(nextProps, this.props);

  /**
   * find the rotation transformation needed to put a child element in the
   * correct location around the plasmid
   *
   * this func makes use of the centralIndex field in parent state
   * to rotate the plasmid viewer
   *
   * @return {Coor}
   */
  getRotation = index => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'center' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { center } = this.props;
    const { seqLength } = this.state;
    const centralIndex = this.context.circular;

    // how many degrees should it be rotated?
    const adjustedIndex = index - centralIndex;
    const startPerc = adjustedIndex / seqLength;
    const degrees = startPerc * 360;

    return `rotate(${degrees || 0}, ${center.x}, ${center.y})`;
  };

  /**
   * given an index along the plasmid and its radius, find the coordinate
   * will be used in many of the child components
   *
   * in general this is for lines and labels
   *
   * @param {boolean} rotate	should the central index be taken into account
   * 							when calculating the current coordinate?
   * @return {Coor}
   */
  findCoor = (index, radius, rotate = false) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'center' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { center } = this.props;
    const { seqLength } = this.state;
    const rotatedIndex = rotate ? index - this.context.circular : index;
    const lengthPerc = rotatedIndex / seqLength;
    const lengthPercCentered = lengthPerc - 0.25;
    const radians = lengthPercCentered * Math.PI * 2;
    const xAdjust = Math.cos(radians) * radius;
    const yAdjust = Math.sin(radians) * radius;

    return {
      x: center.x + xAdjust,
      y: center.y + yAdjust
    };
  };

  /**
   * given a coordinate, and the degrees to rotate it, find the new coordinate
   * (assuming that the rotation is around the center)
   *
   * in general this is for text and arcs
   *
   * @return {Coor}
   */
  rotateCoor = (coor, degrees) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'center' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { center } = this.props;

    // find coordinate's current angle
    const angle = degrees * (Math.PI / 180); // degrees to radians
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // find the new coordinate
    const xDiff = coor.x - center.x;
    const yDiff = coor.y - center.y;
    const cosX = cos * xDiff;
    const cosY = cos * yDiff;
    const sinX = sin * xDiff;
    const sinY = sin * yDiff;
    const xAdjust = cosX - sinY;
    const yAdjust = sinX + cosY;

    return {
      x: center.x + xAdjust,
      y: center.y + yAdjust
    };
  };

  /**
   * given an inner and outer radius, and the length of the element, return the
   * path for an arc that circles the plasmid. the optional paramters sweepFWD and sweepREV
   * are needed for selection arcs (where the direction of the arc isn't known beforehand)
   * and arrowFWD and arrowREV are needed for annotations, where there may be directionality
   *
   * @return {string}
   */
  generateArc = ({
    innerRadius,
    outerRadius,
    length,
    largeArc, // see svg.arc large-arc-flag
    sweepFWD = false,
    arrowFWD = false,
    arrowREV = false,
    offset = 0
  }) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'radius' does not exist on type 'Readonly... Remove this comment to see the full error message
    const { radius } = this.props;
    const { seqLength, lineHeight } = this.state;
    // build up the six default coordinates
    let leftBottom = this.findCoor(offset, innerRadius);
    let leftTop = this.findCoor(offset, outerRadius);
    let rightBottom = this.findCoor(length + offset, innerRadius);
    let rightTop = this.findCoor(length + offset, outerRadius);
    let leftArrow = "";
    let rightArrow = "";

    // create arrows by making a midpoint along edge and shifting corners inwards
    if (arrowREV || arrowFWD) {
      // one quarter of lineHeight in px is the shift inward for arrows
      const inwardShift = lineHeight / 4;
      // given the arc length (inwardShift) and the radius (from SeqViewer),
      // we can find the degrees to rotate the corners
      const centralAngle = inwardShift / radius;
      // Math.min here is to make sure the arrow it's larger than the element
      const centralAnglePerc = Math.min(centralAngle / 2, length / seqLength);
      const centralAngleDeg = centralAnglePerc * 360;

      if (arrowREV) {
        leftBottom = this.rotateCoor(leftBottom, centralAngleDeg);
        leftTop = this.rotateCoor(leftTop, centralAngleDeg);
        const lArrowC = this.findCoor(0, (innerRadius + outerRadius) / 2);
        leftArrow = `L ${lArrowC.x} ${lArrowC.y}`;
      } else {
        rightBottom = this.rotateCoor(rightBottom, -centralAngleDeg);
        rightTop = this.rotateCoor(rightTop, -centralAngleDeg);
        const rArrowC = this.findCoor(length, (innerRadius + outerRadius) / 2);
        rightArrow = `L ${rArrowC.x} ${rArrowC.y}`;
      }
    }

    const lArc = largeArc ? 1 : 0;
    const sFlagF = sweepFWD ? 1 : 0;
    const sFlagR = sweepFWD ? 0 : 1;

    return `M ${rightBottom.x} ${rightBottom.y}
      A ${innerRadius} ${innerRadius}, 0, ${lArc}, ${sFlagR}, ${leftBottom.x} ${leftBottom.y}
      L ${leftBottom.x} ${leftBottom.y}
      ${leftArrow}
      L ${leftTop.x} ${leftTop.y}
      A ${outerRadius} ${outerRadius}, 0, ${lArc}, ${sFlagF}, ${rightTop.x} ${rightTop.y}
      ${rightArrow}
      Z`;
  };

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'showPrimers' does not exist on type 'Rea... Remove this comment to see the full error message
      showPrimers,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'showIndex' does not exist on type 'Reado... Remove this comment to see the full error message
      showIndex,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      name,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'inputRef' does not exist on type 'Readon... Remove this comment to see the full error message
      inputRef,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mouseEvent' does not exist on type 'Read... Remove this comment to see the full error message
      mouseEvent,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onUnmount' does not exist on type 'Reado... Remove this comment to see the full error message
      onUnmount,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'center' does not exist on type 'Readonly... Remove this comment to see the full error message
      center,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'radius' does not exist on type 'Readonly... Remove this comment to see the full error message
      radius,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'yDiff' does not exist on type 'Readonly<... Remove this comment to see the full error message
      yDiff,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'Readonly<{}... Remove this comment to see the full error message
      seq,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'compSeq' does not exist on type 'Readonl... Remove this comment to see the full error message
      compSeq,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'cutSites' does not exist on type 'Readon... Remove this comment to see the full error message
      cutSites,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'search' does not exist on type 'Readonly... Remove this comment to see the full error message
      search
    } = this.props;

    const { seqLength, lineHeight, annotationsInRows, primersInRows, inlinedLabels, outerLabels } = this.state;

    const { getRotation, generateArc, findCoor, rotateCoor } = this;

    // general values/functions used in many/all children
    const general = {
      radius,
      center,
      lineHeight,
      seqLength,
      findCoor,
      getRotation,
      generateArc,
      rotateCoor,
      inputRef
    };

    // an inward shift is needed for primers if the annotations are shown
    let primerRowsToSkip = annotationsInRows.length + 1;

    // calculate the selection row height based on number of annotation and primers
    let totalRows = 4 + annotationsInRows.length;

    if (showPrimers) {
      totalRows += primersInRows.length;
    }

    const plasmidId = `la-vz-${name}-viewer-circular`;
    if (!size.height) return null;

    return (
      <svg
        id={plasmidId}
        className="la-vz-circular-viewer"
        onMouseDown={mouseEvent}
        onMouseUp={mouseEvent}
        onMouseMove={mouseEvent}
        ref={inputRef(plasmidId, { type: "SEQ" })}
        {...size}
      >
        <g className="la-vz-circular-root" transform={`translate(0, ${yDiff})`}>
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. // @ts-expect-error */}
          <Selection {...general} onUnmount={onUnmount} totalRows={totalRows} seq={seq} />
          <Annotations
            {...general}
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            annotations={annotationsInRows}
            size={size}
            rowsToSkip={0}
            inlinedAnnotations={inlinedLabels}
          />
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. // @ts-expect-error */}
          <Find {...general} search={search} />
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. // @ts-expect-error */}
          <CutSites {...general} selectionRows={4} cutSites={cutSites} />
          <Index
            {...general}
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            name={name}
            size={size}
            yDiff={yDiff}
            seq={seq}
            compSeq={compSeq}
            totalRows={totalRows}
            showIndex={showIndex}
          />
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. // @ts-expect-error */}
          <Labels {...general} labels={outerLabels} size={size} yDiff={yDiff} />
        </g>
      </svg>
    );
  }
}

export default withViewerHOCs(Circular);
