import { isEqual } from "lodash";
import * as React from "react";
import CircularViewer from "./Circular/Circular";
import LinearViewer from "./Linear/Linear";
import "./SeqViewer.scss";

export const CIRC_CONSTS = {
  DROP_YDIFF: 13,
  DROP_RADIUS_SCALE: 0.42
};

/**
 * a parent sequence viewer component that holds whatever is common between
 * the linear and circular sequence viewers. The Header is an example
 */
class SeqViewer extends React.Component {
  static defaultProps = {
    Axis: true,
    Zoom: 50,
    Annotations: true,
    Circular: false
  };

  static options = {
    linear: {
      checkBoxes: ["Annotations", "Axis"],
      sliders: ["Zoom"]
    },
    circular: {
      checkBoxes: ["Annotations", "Axis"],
      sliders: ["centralIndex", "Zoom"]
    }
  };

  static WIDTH_MULTIPLIER = 0.97;

  constructor(props) {
    super(props);

    const { Axis, Annotations, Circular } = props;

    let { Zoom } = props;
    if (Circular) {
      Zoom = 0;
    }
    const resizing = false;

    this.state = {
      Axis,
      Zoom,
      Annotations,
      resizing
    }; // store the viewer settings in state
  }

  /** this is here because the size listener is returning a new "size" prop every time */
  shouldComponentUpdate = (nextProps, nextState) =>
    !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);

  unsub = () => {};

  /**
   * callbacks for the options dropdown to change viewer parameters
   * @param  {React.SyntheticEvent} e    callback value from a click or change to the react-slider
   */
  seqStateChange = e => {
    const { Circular } = this.props;
    let { Zoom } = this.state;
    const { name, type } = e.target;

    if (e.target && type === "slider") {
      const { value } = e.target;
      this.setState({ [name]: value });
    } else if (e.target && type === "checkbox") {
      const { checked } = e.target;
      this.setState({ [name]: checked });
    } else if (e.target && type === "submit") {
      const {
        part: { seq }
      } = this.props;

      if (seq.length < 200) {
        Zoom = Circular ? 0 : 50;
      }
      this.setState({ Zoom });
    }
  };

  unsub = () => {};

  /**
   * given the width of the screen, and the current Zoom, how many basepairs should be displayed
   * on the screen at a given time and what should their size be
   */
  linearProps = () => {
    const { Zoom = 50 } = this.state;

    const { size } = this.props;

    const seqFontSize = Math.min(Math.round(Zoom * 0.1 + 9.5), 18); // max 18px

    // otherwise the sequence needs to be cut into smaller subsequences
    // a sliding scale in width related to the degree of Zoom currently active
    let bpsPerBlock = Math.round((size.width / seqFontSize) * 1.6) || 1; // width / 1 * seqFontSize

    if (Zoom <= 5) {
      bpsPerBlock *= 3;
    } else if (Zoom <= 10) {
      // really ramp up the range, since at this zoom it'll just be a line
      bpsPerBlock *= 2;
    } else if (Zoom > 70) {
      // keep font height the same but scale number of bps in one row
      bpsPerBlock = Math.round(bpsPerBlock * (70 / Zoom));
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
   * Zoom of the plasmid viewer affect the radius of the circular viewer and its vertical shift
   *
   * minPixelPerBP = s / 50 where
   * s = theta * radius where
   * radius = h / 2 + c ^ 2 / 8 h    (https://en.wikipedia.org/wiki/Circular_segment)
   * and theta = 50 / seqLength
   */
  circularProps = () => {
    const { Zoom = 0 } = this.state;
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

    // find the number of currently shown basepairs along the arc, using an exponential curve
    // between (0, seqLength) and (100, 50) (Zoom, BPs shown on arc)
    // this curve was generated using desmos so that, at max zoom, there's always ~50 bps,
    // regardless of plasmid size and, at minimum zoom, the entire length of the plasmid.
    // this was originally a linear line, but too few bps were shown in the 15-70 range
    // curve params for future adjustment:
    // https://user-images.githubusercontent.com/13923102/36227188-43a80494-119e-11e8-8196-a173a96ebff8.png
    const exp = 0.83; // exponent... greater exp leads to flatter curve (c in fig)
    const beta = Math.exp(Math.log(50 / seqLength) / -(100 ** exp)); // beta coefficient (b in fig)
    const bpsOnArc = seqLength * beta ** -(Zoom ** exp); // calc using the full expression

    // scale the radius so only (bpsOnArc) many bps are shown
    let radius = limitingDim * 0.34;

    const maxPixelPerBP = limitingDim / 100.0; // fully zoomed on 50 bps; 1.1 is approximate
    // for bps on circular vs linear index line across the viewer
    const minPixelPerBP = (radius * Math.PI) / seqLength; // not zoomed at all, whole plasmid

    // slope from (0, minPixelPerBP) to (100, maxPixelPerBP)
    const pixelSlope = (maxPixelPerBP - minPixelPerBP) / 100.0; // from zero to 100 zoom
    const pixelPerBP = pixelSlope * Zoom + minPixelPerBP; // equation of a line
    const totalPixelsOfArc = pixelPerBP * bpsOnArc;

    // honestly I don't know the signif of this coefficent 0.84 (Josh)
    // slope from (0, y) to (100, 0)
    // trying to avoid dividing by 0
    const radiusAdjust = center.y / Math.max(0.1, 100 * (100 - Zoom + 1));
    radius = totalPixelsOfArc / (Math.PI * (bpsOnArc / seqLength));
    let yDiff = radius - radiusAdjust;
    if (Zoom === 0) {
      yDiff = 0; // stupid hack
    }
    return { radius, yDiff, Linear: false, size, bpsOnArc, center };
  };

  render() {
    const {
      Circular: CircularProp,
      part,
      part: {
        seq: { length: seqLength } // determine the length of the currently active part
      },
      size,
      showSearch,
      seqSelection,
      findState,
      circularCentralIndex,
      linearCentralIndex,
      setPartState,
      onSelection
    } = this.props;

    const partState = {
      showSearch,
      seqSelection,
      findState,
      circularCentralIndex,
      linearCentralIndex,
      setPartState,
      onSelection
    };

    return (
      <div
        className="SeqViewer-container"
        style={{ zIndex: CircularProp ? 2 : 3 }}
      >
        {CircularProp && (
          <CircularViewer
            {...part}
            {...this.state}
            {...this.circularProps()}
            {...partState}
            size={size}
          />
        )}
        {!CircularProp && (
          <LinearViewer
            {...part}
            {...this.state}
            {...this.linearProps()}
            seqLength={seqLength}
            {...partState}
            size={size}
          />
        )}
      </div>
    );
  }
}

export default SeqViewer;
