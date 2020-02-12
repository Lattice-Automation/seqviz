import * as React from "react";
import sizeMe from "react-sizeme";

import isEqual from "../utils/isEqual";
import CircularViewer from "./Circular/Circular.jsx";
import LinearViewer from "./Linear/Linear.jsx";
import CentralIndexContext from "./handlers/centralIndex";

import "./SeqViewer.scss";

/**
 * a parent sequence viewer component that holds whatever is common between
 * the linear and circular sequence viewers. The Header is an example
 */
class SeqViewer extends React.Component {
  constructor(props) {
    super(props);
    const { size } = props;

    if ((!size.height || !size.width) && process.env.NODE_ENV !== "test") {
      console.error(`SeqViz viewer rendered in an element without a height or width.
Generally, SeqViz expands to fill the height/width of its parent element.

The two solutions are to:
  1. render SeqViz within a container element with a defined height + width
  2. pass an options.style object to SeqViz with a height + width

See: https://github.com/Lattice-Automation/seqviz#optionsstyle-`);
    }
  }

  /** this is here because the size listener is returning a new "size" prop every time */
  shouldComponentUpdate = (nextProps, nextState) =>
    !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);

  /**
   * given the width of the screen, and the current zoom, how many basepairs should be displayed
   * on the screen at a given time and what should their size be
   */
  linearProps = () => {
    const { seq, size } = this.props;

    let zoom = this.props.zoom.linear || 0;
    zoom = Math.max(zoom, 0);
    zoom = Math.min(zoom, 100);

    const seqFontSize = Math.min(Math.round(zoom * 0.1 + 9.5), 18); // max 18px

    // otherwise the sequence needs to be cut into smaller subsequences
    // a sliding scale in width related to the degree of zoom currently active
    let bpsPerBlock = Math.round((size.width / seqFontSize) * 1.4) || 1; // width / 1 * seqFontSize

    if (zoom <= 5) {
      bpsPerBlock *= 3;
    } else if (zoom <= 10) {
      // really ramp up the range, since at this zoom it'll just be a line
      bpsPerBlock *= 2;
    } else if (zoom > 70) {
      // keep font height the same but scale number of bps in one row
      bpsPerBlock = Math.round(bpsPerBlock * (70 / zoom));
    }

    if (bpsPerBlock < seq.length) {
      size.width -= 28; // -28 px for the padding (10px) + scroll bar (18px)
    }

    const charWidth = size.width / bpsPerBlock; // width of each basepair

    const lineHeight = 1.4 * seqFontSize; // aspect ratio is 1.4 for roboto mono
    const elementHeight = 16; // the height, in pixels, of annotations, ORFs, etc

    return {
      seqFontSize,
      lineHeight,
      elementHeight,
      bpsPerBlock,
      charWidth,
      size,
      zoom: { linear: zoom },
      Linear: true
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
      size,
      seq: { length: seqLength }
    } = this.props;

    let zoom = this.props.zoom.circular || 0;
    zoom = Math.max(zoom, 0);
    zoom = Math.min(zoom, 100);

    const center = {
      x: size.width / 2,
      y: size.height / 2
    };

    const limitingDim = Math.min(size.height, size.width);

    const exp = 0.83; // exponent... greater exp leads to flatter curve (c in fig)
    const beta = Math.exp(Math.log(50 / seqLength) / -(100 ** exp)); // beta coefficient (b in fig)
    const bpsOnArc = seqLength * beta; // calc using the full expression

    // scale the radius so only (bpsOnArc) many bps are shown
    let radius = limitingDim * 0.34;

    const pixelPerBP = (radius * Math.PI) / seqLength;
    const totalPixelsOfArc = pixelPerBP * bpsOnArc;

    radius = totalPixelsOfArc / (Math.PI * (bpsOnArc / seqLength));
    radius = radius === 0 ? 1 : radius;
    const yDiff = 0;
    return {
      radius,
      yDiff,
      Linear: false,
      size,
      zoom: { circular: zoom },
      bpsOnArc,
      center
    };
  };

  render() {
    const { Circular: circular, seq, cutSites } = this.props;

    return (
      <div className="la-vz-viewer-container">
        {circular && (
          <CentralIndexContext.Consumer>
            {({ circular, setCentralIndex }) => (
              <CircularViewer
                {...this.props}
                {...this.state}
                {...this.circularProps()}
                centralIndex={circular}
                setCentralIndex={setCentralIndex}
                cutSites={cutSites}
              />
            )}
          </CentralIndexContext.Consumer>
        )}
        {!circular && (
          <LinearViewer
            {...this.props}
            {...this.state}
            {...this.linearProps()}
            seqLength={seq.length}
            cutSites={cutSites}
          />
        )}
      </div>
    );
  }
}

export default sizeMe({ monitorHeight: true })(SeqViewer);
