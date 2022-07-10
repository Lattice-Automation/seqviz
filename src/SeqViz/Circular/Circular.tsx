import * as React from "react";

import { Annotation, Coor, ICutSite, ISize, InputRefFuncType, Primer } from "../../elements";
import bindingSites from "../../utils/bindingSites";
import isEqual from "../../utils/isEqual";
import { SearchResult } from "../../utils/search";
import { HighlightRegion } from "../Linear/SeqBlock/LinearFind";
import { stackElements } from "../elementsToRows";
import withViewerHOCs from "../handlers";
import CentralIndexContext from "../handlers/centralIndex";
import { SeqVizSelection } from "../handlers/selection";
import Annotations from "./Annotations";
import { CircularFind } from "./CircularFind";
import Selection from "./CircularSelection";
import CutSites from "./CutSites";
import Index from "./Index";
import Labels, { ILabel } from "./Labels";

// this will need to change whenever the css of the plasmid viewer text changes
// just divide the width of some rectangular text by it's number of characters
export const CHAR_WIDTH = 7.801;

export interface CircularProps {
  Circular: boolean;
  Linear: boolean;
  annotations: Annotation[];
  center: { x: number; y: number };
  centralIndex: number;
  compSeq: string;
  cutSites: ICutSite[];
  highlightedRegions: HighlightRegion[];
  inputRef: InputRefFuncType;
  mouseEvent: (e: any) => void;
  name: string;
  onUnmount: (id: string) => void;
  primers: Primer[];
  radius: number;
  search: SearchResult[];
  selection: SeqVizSelection;
  seq: string;
  setCentralIndex: (type: "linear" | "circular", update: number) => void;
  setSelection: (selection: SeqVizSelection) => void;
  showIndex: boolean;
  showPrimers: boolean;
  size: ISize;
  yDiff: number;
}

interface CircularState {
  annotationsInRows: Annotation[][];
  inlinedLabels: ILabel[];
  lineHeight: number;
  outerLabels: ILabel[];
  primersInRows: Primer[][];
  seqLength: number;
}

class Circular extends React.Component<CircularProps, CircularState> {
  static contextType = CentralIndexContext;

  static getDerivedStateFromProps = (
    nextProps: CircularProps
  ): {
    annotationsInRows: Annotation[][];
    inlinedLabels: ILabel[];
    lineHeight: number;
    outerLabels: ILabel[];
    primersInRows: Primer[][];
    seqLength: number;
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
    const inlinedLabels: ILabel[] = [];
    const outerLabels: ILabel[] = [];
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
          const { end, id, name, start } = ann;
          const type = "annotation";
          outerLabels.push({ end, id, name, start, type });
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
      annotationsInRows: annotationsInRows,
      inlinedLabels: inlinedLabels,
      lineHeight: lineHeight,
      outerLabels: outerLabels,
      primersInRows: primersInRows,
      seqLength: nextProps.seq.length,
    };
  };

  // null arrays on initial load
  state = {
    annotationsInRows: [],
    inlinedLabels: [],
    lineHeight: 0,
    outerLabels: [],
    primersInRows: [],
    seqLength: 0,
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
   */
  generateArc = (args: {
    arrowFWD?: boolean;
    arrowREV?: boolean;
    innerRadius: number;
    largeArc: boolean;
    length: number;
    offset?: number;
    outerRadius: number;
    // see svg.arc large-arc-flag
    sweepFWD?: boolean;
  }): string => {
    const { arrowFWD, arrowREV, innerRadius, largeArc, length, outerRadius, sweepFWD } = args;
    const { radius } = this.props;
    const { lineHeight, seqLength } = this.state;
    const offset = args.offset === undefined ? 0 : args.offset;
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
      center,
      compSeq,
      cutSites,
      inputRef,
      mouseEvent,
      name,
      onUnmount,
      radius,
      search,
      seq,
      showIndex,
      showPrimers,
      size,
      yDiff,
    } = this.props;

    const { annotationsInRows, inlinedLabels, lineHeight, outerLabels, primersInRows, seqLength } = this.state;

    const { findCoor, generateArc, getRotation, rotateCoor } = this;

    // general values/functions used in many/all children
    const general = {
      center,
      findCoor,
      generateArc,
      getRotation,
      inputRef,
      lineHeight,
      radius,
      rotateCoor,
      seqLength,
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
        ref={inputRef(plasmidId, { type: "SEQ" })}
        className="la-vz-circular-viewer"
        id={plasmidId}
        onMouseDown={mouseEvent}
        onMouseMove={mouseEvent}
        onMouseUp={mouseEvent}
        {...size}
      >
        <g className="la-vz-circular-root" transform={`translate(0, ${yDiff})`}>
          <Selection {...general} seq={seq} totalRows={totalRows} onUnmount={onUnmount} />
          <Index
            {...general}
            compSeq={compSeq}
            name={name}
            seq={seq}
            showIndex={showIndex}
            size={size}
            totalRows={totalRows}
            yDiff={yDiff}
          />
          <CircularFind
            center={general.center}
            findCoor={general.findCoor}
            generateArc={general.generateArc}
            getRotation={general.getRotation}
            highlightedRegions={this.props.highlightedRegions}
            inputRef={general.inputRef}
            lineHeight={general.lineHeight}
            radius={general.radius}
            rotateCoor={general.rotateCoor}
            search={search}
            seq={seq}
            seqLength={general.seqLength}
            totalRows={totalRows}
            onUnmount={onUnmount}
          />
          <CutSites {...general} cutSites={cutSites} selectionRows={4} />
          <Annotations
            {...general}
            annotations={annotationsInRows}
            inlinedAnnotations={inlinedLabels}
            rowsToSkip={0}
            size={size}
          />
          <Labels {...general} labels={outerLabels} size={size} yDiff={yDiff} />
        </g>
      </svg>
    );
  }
}

export default withViewerHOCs(Circular);
