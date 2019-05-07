import { faCaretLeft } from "@fortawesome/free-solid-svg-icons/faCaretLeft";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons/faCaretRight";
import { faMinus } from "@fortawesome/free-solid-svg-icons/faMinus";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Slider from "rc-slider";
import * as React from "react";
import "./Sliders.scss";

class SingleSlider extends React.PureComponent {
  render() {
    const {
      max,
      min,
      value,
      increment,
      name,
      onChange,
      setResizing,
      leftIcon,
      rightIcon
    } = this.props;

    return (
      <div className="single-slider">
        <button
          className="slider-button"
          type="submit"
          onClick={() => onChange(value - increment)}
        >
          {leftIcon}
        </button>
        <Slider
          name={name}
          min={min}
          max={max}
          step={increment}
          value={value}
          onChange={onChange}
          onBeforeChange={() => setResizing(true)}
          onAfterChange={() => setResizing(false)}
        />
        <button
          className="slider-button"
          type="submit"
          onClick={() => onChange(value + increment)}
        >
          {rightIcon}
        </button>
      </div>
    );
  }
}

/**
 * render the seq viewer header sliders
 */
class SliderRow extends React.PureComponent {
  /**
   * during a plasmid resizing or scrolling event, tell SeqViewer that it's
   * resizing. This will prevent the annotation labels from being rendered,
   * which helps in terms of rendering performance
   */
  setResizing = resizing => {
    const { seqStateChange } = this.props;
    seqStateChange({
      target: {
        name: "resizing",
        value: resizing,
        type: "slider"
      }
    });
  };

  /**
   * set the updated centralIndex
   */
  setCentralIndex = index => {
    const { seqLength, setPartState } = this.props;
    // prevent from exceeding the sequence length or going negative
    let newIndex = index;
    if (newIndex < 0) newIndex += seqLength;
    if (newIndex > seqLength) newIndex -= seqLength;
    setPartState({ circularCentralIndex: newIndex });
  };

  /**
   * update the zoom level in SeqViewer
   */
  setZoom = value => {
    const { seqStateChange } = this.props;
    // prevent from exceeeding 100 of going negative
    let newValue = Math.min(value, 100);
    newValue = Math.max(newValue, 0);

    seqStateChange({
      target: {
        name: "Zoom",
        value: newValue,
        type: "slider"
      }
    });
  };

  render() {
    const {
      sliders,
      seqLength,
      Zoom,
      circularCentralIndex: centralIndex,
      Linear
    } = this.props;
    const centralIndexInc = seqLength > 200 ? Math.floor(seqLength / 50) : 1;
    const centralIndexMax = seqLength > 200 ? centralIndexInc * 50 : seqLength;

    return (
      <div
        className="slider-container"
        style={{
          width: `${120 * sliders.length}px`
        }}
      >
        {!Linear && (
          <SingleSlider
            name="centralIndex"
            value={centralIndex}
            increment={centralIndexInc}
            onChange={this.setCentralIndex}
            min={0}
            max={centralIndexMax}
            setResizing={this.setResizing}
            leftIcon={
              <FontAwesomeIcon icon={faCaretLeft} className="caretIcon" />
            }
            rightIcon={
              <FontAwesomeIcon icon={faCaretRight} className="caretIcon" />
            }
          />
        )}
        {seqLength > 200 && (
          <SingleSlider
            name="Zoom"
            value={Zoom}
            increment={5}
            onChange={this.setZoom}
            min={0}
            max={100}
            setResizing={this.setResizing}
            leftIcon={<FontAwesomeIcon icon={faMinus} className="zoomIcon" />}
            rightIcon={<FontAwesomeIcon icon={faPlus} className="zoomIcon" />}
          />
        )}
      </div>
    );
  }
}

export default SliderRow;
