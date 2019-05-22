import { isEqual } from "lodash";
import * as React from "react";
import CircularViewer from "./Circular/Circular";
import LinearViewer from "./Linear/Linear";
import "./SeqViewer.scss";
import seqSearch from "../Find/Find";
import { cutSitesInRows } from "../../Utils/digest/digest";

export const CIRC_CONSTS = {
  DROP_YDIFF: 13,
  DROP_RADIUS_SCALE: 0.42
};

/**
 * a parent sequence viewer component that holds whatever is common between
 * the linear and circular sequence viewers. The Header is an example
 */
class SeqViewer extends React.Component {
  static WIDTH_MULTIPLIER = 0.97;

  constructor(props) {
    super(props);
    const resizing = false;

    this.state = {
      resizing
    }; // store the viewer settings in state
  }

  componentDidMount = () => {
    const {
      searchQuery: { query, mismatch },
      seq,
      setPartState,
      onSearch
    } = this.props;
    const { searchResults, searchIndex } = seqSearch(query, mismatch, seq);
    onSearch({ searchResults, searchIndex });
    setPartState({ findState: { searchResults, searchIndex } });
  };

  /** this is here because the size listener is returning a new "size" prop every time */
  shouldComponentUpdate = (nextProps, nextState) =>
    !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);

  unsub = () => {};

  /**
   * given the width of the screen, and the current zoom, how many basepairs should be displayed
   * on the screen at a given time and what should their size be
   */
  linearProps = () => {
    const { size, zoom: { linear: zoom } = 50 } = this.props;

    const seqFontSize = Math.min(Math.round(zoom * 0.1 + 9.5), 18); // max 18px

    // otherwise the sequence needs to be cut into smaller subsequences
    // a sliding scale in width related to the degree of zoom currently active
    let bpsPerBlock = Math.round((size.width / seqFontSize) * 1.6) || 1; // width / 1 * seqFontSize

    if (zoom <= 5) {
      bpsPerBlock *= 3;
    } else if (zoom <= 10) {
      // really ramp up the range, since at this zoom it'll just be a line
      bpsPerBlock *= 2;
    } else if (zoom > 70) {
      // keep font height the same but scale number of bps in one row
      bpsPerBlock = Math.round(bpsPerBlock * (70 / zoom));
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
      part: {
        seq: { length: seqLength }
      }
    } = this.props;

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
    return { radius, yDiff, Linear: false, size, bpsOnArc, center };
  };

  render() {
    const {
      Circular: CircularProp,
      part,
      enzymes,
      part: {
        seq: { length: seqLength }
      }
    } = this.props;

    const cutSites = enzymes.length ? cutSitesInRows(part.seq, enzymes) : [];

    return (
      <div
        className="SeqViewer-container"
        style={{ zIndex: CircularProp ? 2 : 3 }}
      >
        {CircularProp && (
          <CircularViewer
            {...this.props}
            {...part}
            {...this.state}
            {...this.circularProps()}
            cutSites={cutSites}
          />
        )}
        {!CircularProp && (
          <LinearViewer
            {...this.props}
            {...part}
            {...this.state}
            {...this.linearProps()}
            seqLength={seqLength}
            cutSites={cutSites}
          />
        )}
      </div>
    );
  }
}

export default SeqViewer;
