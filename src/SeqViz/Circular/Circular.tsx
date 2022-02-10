import * as React from "react";
import { Annotation, Label } from "../../part";
import bindingSites from "../../utils/bindingSites";
import isEqual from "../../utils/isEqual";
import { SearchResult } from "../../utils/search";
import { stackElements } from "../elementsToRows";
import withViewerHOCs from "../handlers";
import CentralIndexContext from "../handlers/centralIndex";
import { InputRefFuncType } from "../Linear/SeqBlock/SeqBlock";
import Annotations from "./Annotations";
import Selection from "./CircularSelection";
import CutSites from "./CutSites";
import Find from "./Find";
import Index from "./Index";
import Labels from "./Labels";

// this will need to change whenever the css of the plasmid viewer text changes
// just divide the width of some rectangular text by it's number of characters
export const CHAR_WIDTH = 7.801;

export interface Primer {
  direction: 1 | -1;
}
export interface ICutSite {
  fcut: number;
  rcut: number;
  start: number;
  end: number;

  type?: "enzyme" | "annotation";
  name: string;
  id: string;
  recogStart: number;
  recogEnd: number;
  recogStrand: unknown;
}

export interface SizeType {
  height: number;
  width: number;
}

interface CircularProps {
  annotations: Annotation[];
  seq: string;
  primers: Primer[];
  cutSites: ICutSite[];
  radius: number;
  center: { x: number; y: number };
  showPrimers: boolean;
  showIndex: boolean;
  name: string;
  inputRef: InputRefFuncType;
  mouseEvent: React.MouseEventHandler;
  onUnmount: () => void;
  yDiff: number;
  size: SizeType;
  compSeq: string;
  search: SearchResult[];
  centralIndex: number;
  setCentralIndex: (update: number) => void;
}
interface CircularState {
  seqLength: number;
  lineHeight: number;
  annotationsInRows: Annotation[];
  primersInRows: Primer[];
  inlinedLabels: Label[];
  outerLabels: Label[];
}

export interface Coor {
  x: number;
  y: number;
}

class Circular extends React.Component<CircularProps, CircularState> {
  static contextType = CentralIndexContext;

  static getDerivedStateFromProps = (
    nextProps: CircularProps
  ): {
    seqLength: number;
    lineHeight: number;
    annotationsInRows: unknown[];
    primersInRows: unknown[];
    inlinedLabels: Label[];
    outerLabels: Label[];
  } => {
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
    const inlinedLabels: Label[] = [];
    const outerLabels: Label[] = [];
    annotationsInRows.forEach((r: Annotation[]) => {
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
          outerLabels.push({ id, name, start, end, type });
        }
      });
      innerRadius -= lineHeight;
    });

    cutSiteLabels.forEach(c =>
      outerLabels.push({
        ...c,
        start: c.fcut,
        type: "enzyme",
      })
    );

    // sort all the labels so they're in ascending order
    outerLabels.sort((a, b) => Math.min(a.start, a.end) - Math.min(b.start, b.end));

    return {
      seqLength: nextProps.seq.length,
      lineHeight: lineHeight,
      annotationsInRows: annotationsInRows,
      primersInRows: primersInRows,
      inlinedLabels: inlinedLabels,
      outerLabels: outerLabels,
    };
  };

  // null arrays on initial load
  state = {
    seqLength: 0,
    lineHeight: 0,
    annotationsInRows: [],
    primersInRows: [],
    inlinedLabels: [],
    outerLabels: [],
  };

  /**
   * Deep equality comparison
   */
  shouldComponentUpdate = (nextProps: CircularProps) => !isEqual(nextProps, this.props);

  /**
   * find the rotation transformation needed to put a child element in the
   * correct location around the plasmid
   *
   * this func makes use of the centralIndex field in parent state
   * to rotate the plasmid viewer
   */
  getRotation = (index: number): string => {
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
   */
  findCoor = (index: number, radius: number, rotate?: boolean): Coor => {
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
      y: center.y + yAdjust,
    };
  };

  /**
   * given a coordinate, and the degrees to rotate it, find the new coordinate
   * (assuming that the rotation is around the center)
   *
   * in general this is for text and arcs
   */
  rotateCoor = (coor: Coor, degrees: number): Coor => {
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
      y: center.y + yAdjust,
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
  generateArc = (args: {
    innerRadius: number;
    outerRadius: number;
    length: number;
    largeArc: boolean; // see svg.arc large-arc-flag
    sweepFWD?: boolean;
    arrowFWD?: boolean;
    arrowREV?: boolean;
    offset?: number;
  }): string => {
    const { innerRadius, outerRadius, length, largeArc, sweepFWD, arrowFWD, arrowREV, offset } = args;
    const { radius } = this.props;
    const { seqLength, lineHeight } = this.state;
    const _offset = offset === undefined ? 0 : offset;
    // build up the six default coordinates
    let leftBottom = this.findCoor(_offset, innerRadius);
    let leftTop = this.findCoor(_offset, outerRadius);
    let rightBottom = this.findCoor(length + _offset, innerRadius);
    let rightTop = this.findCoor(length + _offset, outerRadius);
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
      size,
      seq,
      compSeq,
      cutSites,
      search,
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
      inputRef,
    };

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
          <Selection {...general} onUnmount={onUnmount} totalRows={totalRows} seq={seq} />
          <Annotations
            {...general}
            annotations={annotationsInRows}
            size={size}
            rowsToSkip={0}
            inlinedAnnotations={inlinedLabels}
          />
          <Find {...general} search={search} onUnmount={onUnmount} totalRows={totalRows} seq={seq} />
          <CutSites {...general} selectionRows={4} cutSites={cutSites} />
          <Index
            {...general}
            name={name}
            size={size}
            yDiff={yDiff}
            seq={seq}
            compSeq={compSeq}
            totalRows={totalRows}
            showIndex={showIndex}
          />
          <Labels {...general} labels={outerLabels} size={size} yDiff={yDiff} />
        </g>
      </svg>
    );
  }
}

export default withViewerHOCs(Circular);
