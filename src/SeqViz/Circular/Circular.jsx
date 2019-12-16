import * as React from "react";

import findAllBindingSites from "../findAllBindingSites";
import withViewerHOCs from "../handlers";
import { stackElements } from "../elementsToRows";
import Annotations from "./Annotations/Annotations.jsx";
import Index from "./Index/Index.jsx";
import Labels from "./Labels/Labels.jsx";
import Selection from "./Selection/Selection.jsx";
import CutSites from "./CutSites/CutSites.jsx";
import Primers from "./Primers/Primers.jsx";

import "./Circular.scss";

// this will need to change whenever the css of the plasmid viewer text changes
// just divide the width of some rectangular text by it's number of characters
export const CHAR_WIDTH = 7.801;

class Circular extends React.PureComponent {
  static getDerivedStateFromProps = nextProps => {
    const lineHeight = 14;
    const annotationsInRows = stackElements(
      nextProps.annotations.filter(ann => ann.type !== "insert"),
      nextProps.seq.length
    );
    const primers = findAllBindingSites(nextProps.primers, nextProps.seq);
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
          inlinedLabels.push(ann.id);
        } else {
          const { id, name, start, end } = ann;
          const type = "annotation";
          outerLabels.push({ id, name, start, end, type });
        }
      });
      innerRadius -= lineHeight;
    });

    cutSiteLabels.forEach(c =>
      outerLabels.push({
        ...c,
        start: c.sequenceCutIdx,
        type: "enzyme"
      })
    );

    // sort all the labels so they're in ascending order
    outerLabels.sort(
      (a, b) => Math.min(a.start, a.end) - Math.min(b.start, b.end)
    );

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
   * find the rotation transformation needed to put a child element in the
   * correct location around the plasmid
   *
   * this func makes use of the centralIndex field in parent state
   * to rotate the plasmid viewer
   *
   * @return {Coor}
   */

  getRotation = index => {
    const { center, circularCentralIndex: centralIndex } = this.props;
    const { seqLength } = this.state;
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
    const { center, circularCentralIndex } = this.props;
    const { seqLength } = this.state;
    const rotatedIndex = rotate ? index - circularCentralIndex : index;
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
      showPrimers,
      showIndex,
      name,
      inputRef,
      mouseEvent,
      onUnmount,
      center,
      radius,
      yDiff,
      resizing,
      size,

      seq,
      compSeq,
      cutSites
    } = this.props;

    const {
      seqLength,
      lineHeight,
      annotationsInRows,
      primersInRows,
      inlinedLabels,
      outerLabels
    } = this.state;

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
      inputRef,
      resizing
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
          <Selection
            {...this.props}
            {...general}
            onUnmount={onUnmount}
            totalRows={totalRows}
            seq={seq}
          />
          <Annotations
            {...this.props}
            {...general}
            annotations={annotationsInRows}
            size={size}
            rowsToSkip={0}
            inlinedAnnotations={inlinedLabels}
          />
          {showPrimers && primersInRows.length && (
            <Primers
              {...general}
              primers={primersInRows}
              size={size}
              rowsToSkip={primerRowsToSkip}
            />
          )}
          {cutSites.length && (
            <CutSites {...general} selectionRows={4} cutSites={cutSites} />
          )}
          {showIndex && (
            <Index
              {...this.props}
              {...general}
              name={name}
              size={size}
              yDiff={yDiff}
              seq={seq}
              compSeq={compSeq}
              totalRows={totalRows}
            />
          )}
          {!resizing && (
            <Labels
              {...this.props}
              {...general}
              labels={outerLabels}
              size={size}
              yDiff={yDiff}
            />
          )}
        </g>
      </svg>
    );
  }
}

export default withViewerHOCs(Circular);
