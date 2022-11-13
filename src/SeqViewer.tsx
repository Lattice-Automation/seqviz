import * as React from "react";
import { withResizeDetector } from "react-resize-detector";

import Circular from "./Circular/Circular";
import Linear from "./Linear/Linear";
import { Annotation, CutSite, Highlight, NameRange, Range, SeqType } from "./elements";
import CentralIndexContext from "./handlers/centralIndex";
import { Selection, SelectionContext } from "./handlers/selection";
import isEqual from "./isEqual";

interface SeqViewerProps {
  Circular: boolean;
  annotations: Annotation[];
  bpColors: { [key: number | string]: string };
  compSeq: string;
  cutSites: CutSite[];
  height: number;
  highlights: Highlight[];
  name: string;
  search: NameRange[];
  seq: string;
  seqType: SeqType;
  setSelection: (update: Selection) => void;
  showComplement: boolean;
  showIndex: boolean;
  targetRef: React.LegacyRef<HTMLDivElement>;
  /** testSize is a forced height/width that overwrites anything from sizeMe. For testing */
  testSize?: { height: number; width: number };
  translations: Range[];
  viewer: string;
  width: number;
  zoom: { circular: number; linear: number };
}

/**
 * A parent sequence viewer component that holds whatever is common between
 * the linear and circular sequence viewers. The Header is an example
 */
class SeqViewer extends React.Component<SeqViewerProps> {
  static contextType = SelectionContext;
  declare context: React.ContextType<typeof SelectionContext>;

  /** this is here because the size listener is returning a new size prop every time */
  shouldComponentUpdate = (nextProps: SeqViewerProps, nextState: any) =>
    !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);

  /**
   * given the width of the screen, and the current zoom, how many basepairs should be displayed
   * on the screen at a given time and what should their size be
   */
  linearProps = () => {
    const { seq, seqType } = this.props;
    const size = this.props.testSize || { height: this.props.height, width: this.props.width };
    const zoom = this.props.zoom.linear;

    const seqFontSize = Math.min(Math.round(zoom * 0.1 + 9.5), 18); // max 18px

    // otherwise the sequence needs to be cut into smaller subsequences
    // a sliding scale in width related to the degree of zoom currently active
    let bpsPerBlock = Math.round((size.width / seqFontSize) * 1.4) || 1; // width / 1 * seqFontSize
    if (seqType === "aa") {
      bpsPerBlock = Math.round(bpsPerBlock / 3); // more space for each amino acid
    }

    if (zoom <= 5) {
      bpsPerBlock *= 3;
    } else if (zoom <= 10) {
      // really ramp up the range, since at this zoom it'll just be a line
      bpsPerBlock *= 2;
    } else if (zoom > 70) {
      // keep font height the same but scale number of bps in one row
      bpsPerBlock = Math.round(bpsPerBlock * (70 / zoom));
    }

    if (size.width && bpsPerBlock < seq.length) {
      size.width -= 28; // -28 px for the padding (10px) + scroll bar (18px)
    }

    const charWidth = size.width / bpsPerBlock; // width of each basepair

    const lineHeight = 1.4 * seqFontSize; // aspect ratio is 1.4 for roboto mono
    const elementHeight = 16; // the height, in pixels, of annotations, ORFs, etc

    return {
      Circular: false,
      Linear: true,
      bpsPerBlock,
      charWidth,
      elementHeight,
      lineHeight,
      seqFontSize,
      size,
      zoom: { linear: zoom },
    };
  };

  /**
   * given the length of the sequence and the dimensions of the viewbox, how should
   * zoom of the plasmid viewer affect the radius of the circular viewer and its vertical shift
   *
   * minPixelPerBP = s / 50 where
   * s = theta * radius where
   * radius = h / 2 + c ^ 2 / 8 h    (https://en.wikipedia.org/wiki/Circular_segment)
   * and theta = 50 / seqLength
   */
  circularProps = () => {
    const {
      seq: { length: seqLength },
    } = this.props;
    const size = this.props.testSize || { height: this.props.height, width: this.props.width };
    const zoom = this.props.zoom.circular;

    const center = {
      x: size.width / 2,
      y: size.height / 2,
    };

    const limitingDim = Math.min(size.height, size.width);

    const exp = 0.83; // exponent... greater exp leads to flatter curve (c in fig)
    const beta = Math.exp(Math.log(50 / seqLength) / -(100 ** exp)); // beta coefficient (b in fig)
    const bpsOnArc = seqLength * beta; // calc using the full expression

    // scale the radius so only (bpsOnArc) many bps are shown
    const radius = limitingDim * 0.34;

    return {
      Circular: true,
      Linear: false,
      bpsOnArc,
      center,
      radius: radius === 0 ? 1 : radius,
      size,
      yDiff: 0,
      zoom: { circular: zoom },
    };
  };

  render() {
    return (
      <div ref={this.props.targetRef} className="la-vz-viewer" data-testid="la-vz-seq-viewer">
        {this.props.Circular ? (
          <CentralIndexContext.Consumer>
            {({ circular, setCentralIndex }) => (
              <Circular
                {...this.props}
                {...this.circularProps()}
                centralIndex={circular}
                selection={this.context}
                setCentralIndex={setCentralIndex}
              />
            )}
          </CentralIndexContext.Consumer>
        ) : (
          <Linear {...this.props} {...this.linearProps()} selection={this.context} />
        )}
      </div>
    );
  }
}

export default withResizeDetector(SeqViewer);
