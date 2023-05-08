import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { CHAR_WIDTH } from "../SeqViewerContainer";
import CentralIndexContext from "../centralIndexContext";
import { Annotation, Coor, CutSite, Highlight, Range, Size } from "../elements";
import { stackElements } from "../elementsToRows";
import { isEqual } from "../isEqual";
import { viewerCircular } from "../style";
import { Annotations } from "./Annotations";
import { CutSites } from "./CutSites";
import { Find } from "./Find";
import { Index } from "./Index";
import { Labels } from "./Labels";
import { Selection } from "./Selection";

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

export interface CircularProps {
  annotations: Annotation[];
  center: { x: number; y: number };
  compSeq: string;
  cutSites: CutSite[];
  handleMouseEvent: (e: any) => void;
  highlights: Highlight[];
  inputRef: InputRefFunc;
  name: string;
  onUnmount: (id: string) => void;
  radius: number;
  rotateOnScroll: boolean;
  search: Range[];
  seq: string;
  showIndex: boolean;
  size: Size;
  yDiff: number;
}

interface CircularState {
  annotationsInRows: Annotation[][];
  inlinedLabels: string[];
  lineHeight: number;
  outerLabels: ILabel[];
  seqLength: number;
}

/** Circular is a circular viewer that contains a bunch of arcs. */
export default class Circular extends React.Component<CircularProps, CircularState> {
  static contextType = CentralIndexContext;
  static context: React.ContextType<typeof CentralIndexContext>;
  declare context: React.ContextType<typeof CentralIndexContext>;

  constructor(props: CircularProps) {
    super(props);

    this.state = {
      annotationsInRows: [],
      inlinedLabels: [],
      lineHeight: 0,
      outerLabels: [],
      seqLength: 0,
    };
  }

  static getDerivedStateFromProps = (nextProps: CircularProps): CircularState => {
    const lineHeight = 14;
    const annotationsInRows = stackElements(nextProps.annotations, nextProps.seq.length);

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

  /**
   * handle a scroll event and, if it's a CIRCULAR viewer, update the
   * current central index
   */
  handleScrollEvent = (e: React.WheelEvent<SVGElement>) => {
    const { rotateOnScroll, seq } = this.props;
    if (!rotateOnScroll) return;

    // a "large scroll" (1000) should rotate through 20% of the plasmid
    let delta = seq.length * (e.deltaY / 5000);
    delta = Math.floor(delta);

    // must scroll by *some* amount (only matters for very small plasmids)
    if (delta === 0) {
      if (e.deltaY > 0) delta = 1;
      else delta = -1;
    }

    let newCentralIndex = this.context.circular + delta;
    newCentralIndex = (newCentralIndex + seq.length) % seq.length;

    this.context.setCentralIndex("CIRCULAR", newCentralIndex);
  };

  render() {
    const { center, compSeq, cutSites, handleMouseEvent, inputRef, name, radius, search, seq, showIndex, size, yDiff } =
      this.props;
    const { annotationsInRows, inlinedLabels, lineHeight, outerLabels, seqLength } = this.state;

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

    // calculate the selection row height based on number of annotation
    const totalRows = 4 + annotationsInRows.length;
    const plasmidId = `la-vz-${name}-viewer-circular`;
    if (!size.height) return null;

    return (
      <svg
        ref={inputRef(plasmidId, { type: "SEQ", viewer: "CIRCULAR" })}
        className="la-vz-viewer-circular"
        data-testid="la-vz-viewer-circular"
        height={size.height}
        id={plasmidId}
        overflow="visible"
        style={viewerCircular}
        width={size.width >= 0 ? size.width : 0}
        onMouseDown={handleMouseEvent}
        onMouseMove={handleMouseEvent}
        onMouseUp={handleMouseEvent}
        onWheel={this.handleScrollEvent}
      >
        <g className="la-vz-circular-root" transform={`translate(0, ${yDiff})`}>
          <Selection {...props} seq={seq} totalRows={totalRows} />
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
            genArc={props.genArc}
            getRotation={props.getRotation}
            highlights={this.props.highlights}
            inputRef={props.inputRef}
            lineHeight={props.lineHeight}
            radius={props.radius}
            search={search}
            seqLength={props.seqLength}
          />
          <Annotations {...props} annotations={annotationsInRows} inlinedAnnotations={inlinedLabels} rowsToSkip={0} />
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
  inputRef: InputRefFunc;
  lineHeight: number;
  radius: number;
  seqLength: number;
  start: number;
  style: React.CSSProperties;
}) => {
  const { className, color, direction, genArc, getRotation, inputRef, lineHeight, radius, seqLength, start, style } =
    props;

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

  const id = `circular-${start}-${end}-${direction}`;

  return (
    <path
      key={id}
      ref={inputRef(id, {
        end: end,
        ref: id,
        start: start,
        type: "FIND",
        viewer: "CIRCULAR",
      })}
      className={className}
      cursor="pointer"
      d={findPath}
      fill={color}
      id={id}
      shapeRendering="auto"
      stroke="rgba(0, 0, 0, 0.5)"
      strokeWidth={1}
      style={style}
      transform={getRotation(start)}
    />
  );
};
