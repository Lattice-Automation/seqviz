import * as React from "react";

import bindingSites from "../bindingSites";
import { Annotation, Coor, CutSite, Highlight, InputRefFuncType, Primer, Range, Size } from "../elements";
import { stackElements } from "../elementsToRows";
import withViewerHOCs from "../handlers";
import CentralIndexContext from "../handlers/centralIndex";
import { Selection as SelectionType } from "../handlers/selection";
import isEqual from "../isEqual";
import Annotations from "./Annotations";
import CutSites from "./CutSites";
import { Find } from "./Find";
import Index from "./Index";
import Labels from "./Labels";
import Selection from "./Selection";

// this will need to change whenever the css of the plasmid viewer text changes
// just divide the width of some rectangular text by it's number of characters
export const CHAR_WIDTH = 7.801;

/** Sequence length cutoff below which the circular viewer's sequence won't be rendered. */
export const RENDER_SEQ_LENGTH_CUTOFF = 250;

export interface ILabel {
  end: number;
  id?: string;
  name: string;
  start: number;
  type: "enzyme" | "annotation";
}

/** GenArcFunc is a method that makes an arc on the viewer for a Circular child. */
export type GenArcFunc = (args: {
  arrowFWD?: boolean;
  arrowREV?: boolean;
  innerRadius: number;
  largeArc: boolean;
  length: number;
  offset?: number;
  outerRadius: number;
  // see svg.arc large-arc-flag
  sweepFWD?: boolean;
}) => string;

interface CircularProps {
  Circular: boolean;
  Linear: boolean;
  annotations: Annotation[];
  center: { x: number; y: number };
  centralIndex: number;
  compSeq: string;
  cutSites: CutSite[];
  highlights: Highlight[];
  inputRef: InputRefFuncType;
  mouseEvent: (e: any) => void;
  name: string;
  onUnmount: (id: string) => void;
  primers: Primer[];
  radius: number;
  search: Range[];
  selection: SelectionType;
  seq: string;
  setCentralIndex: (type: "linear" | "circular", update: number) => void;
  setSelection: (selection: SelectionType) => void;
  showIndex: boolean;
  showPrimers: boolean;
  size: Size;
  yDiff: number;
}

interface CircularState {
  annotationsInRows: Annotation[][];
  inlinedLabels: string[];
  lineHeight: number;
  outerLabels: ILabel[];
  primersInRows: Primer[][];
  seqLength: number;
}

/** Circular is a circular viewer that contains a bunch of arcs. */
class Circular extends React.Component<CircularProps, CircularState> {
  static contextType = CentralIndexContext;
  declare context: React.ContextType<typeof CentralIndexContext>;

  constructor(props: CircularProps) {
    super(props);

    this.state = {
      annotationsInRows: [],
      inlinedLabels: [],
      lineHeight: 0,
      outerLabels: [],
      primersInRows: [],
      seqLength: 0,
    };
  }

  static getDerivedStateFromProps = (nextProps: CircularProps): CircularState => {
    const lineHeight = 14;
    const annotationsInRows = stackElements(nextProps.annotations, nextProps.seq.length);
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
    const inlinedLabels: string[] = [];
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
        ...c.enzyme,
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

  /**
   * Deep equality comparison
   */
  shouldComponentUpdate = (nextProps: CircularProps) => !isEqual(nextProps, this.props);

  /**
   * Return the SVG rotation transformation needed to put a child element in the
   * correct location around the plasmid. This func makes use of the centralIndex field in parent state
   * to rotate the plasmid viewer.
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
   * Given an index along the plasmid and its radius, find the coordinate
   * will be used in many of the child components
   *
   * In general, this is for lines and labels
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
   * Given a coordinate, and the degrees to rotate it, find the new coordinate
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
   * Given an inner and outer radius, and the length of the element, return the
   * path for an arc that circles the plasmid. The optional paramters sweepFWD and sweepREV
   * are needed for selection arcs (where the direction of the arc isn't known beforehand)
   * and arrowFWD and arrowREV are needed for annotations, where there may be directionality
   */
  genArc: GenArcFunc = (args: {
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

    const { findCoor, genArc, getRotation, rotateCoor } = this;

    // props contains props used in many/all children
    const props = {
      center,
      findCoor,
      genArc,
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
        height={size.height}
        id={plasmidId}
        width={size.width >= 0 ? size.width : 0}
        onMouseDown={mouseEvent}
        onMouseMove={mouseEvent}
        onMouseUp={mouseEvent}
      >
        <g className="la-vz-circular-root" transform={`translate(0, ${yDiff})`}>
          <Selection {...props} seq={seq} totalRows={totalRows} onUnmount={onUnmount} />
          <CutSites {...props} cutSites={cutSites} selectionRows={4} />
          <Index
            {...props}
            compSeq={compSeq}
            name={name}
            seq={seq}
            showIndex={showIndex}
            size={size}
            totalRows={totalRows}
            yDiff={yDiff}
          />
          <Find
            center={props.center}
            findCoor={props.findCoor}
            genArc={props.genArc}
            getRotation={props.getRotation}
            highlights={this.props.highlights}
            inputRef={props.inputRef}
            lineHeight={props.lineHeight}
            radius={props.radius}
            rotateCoor={props.rotateCoor}
            search={search}
            seq={seq}
            seqLength={props.seqLength}
            totalRows={totalRows}
            onUnmount={onUnmount}
          />
          <Annotations
            {...props}
            annotations={annotationsInRows}
            inlinedAnnotations={inlinedLabels}
            rowsToSkip={0}
            size={size}
          />
          <Labels {...props} labels={outerLabels} size={size} yDiff={yDiff} />
        </g>
      </svg>
    );
  }
}

/**
 * Create an SVG arc around a single element in the Circular Viewer.
 */
export const Arc = (props: {
  className: string;
  color?: string;
  direction: -1 | 1;
  end: number;
  genArc: GenArcFunc;
  getRotation: (index: number) => string;
  inputRef: InputRefFuncType;
  lineHeight: number;
  radius: number;
  seqLength: number;
  start: number;
}) => {
  const { className, color, direction, genArc, getRotation, inputRef, lineHeight, radius, seqLength, start } = props;

  let { end } = props;
  // crosses the zero index
  if (end < start) {
    end += seqLength;
  }

  const resultLength = Math.abs(end - start);
  const findPath = genArc({
    innerRadius: radius - lineHeight / 2,
    largeArc: resultLength > seqLength / 2,
    length: resultLength,
    outerRadius: radius + lineHeight / 2,
    sweepFWD: true,
  });

  const id = `${className}-circular-${start}-${end}-${direction}`;

  return (
    <path
      key={id}
      ref={inputRef(id, {
        end: end,
        ref: id,
        start: start,
        type: "FIND",
      })}
      className={className}
      cursor="pointer"
      d={findPath}
      fill={color}
      id={id}
      shapeRendering="auto"
      stroke="rgba(0, 0, 0, 0.5)"
      strokeWidth={1}
      transform={getRotation(start)}
    />
  );
};

export default withViewerHOCs(Circular);
