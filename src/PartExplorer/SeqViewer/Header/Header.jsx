import * as React from "react";
import Find from "../../Find/Find";
import "./Header.scss";
import OptionsDropdown from "./OptionsDropdown/OptionsDropdown";
import Sliders from "./Sliders/Sliders";

/**
 * Header
 *
 * Options for the linear sequence viewer. Includes, right now:
 * 		a slider for zoom between 0 and 100
 * 		a checkbox for whether or not to show the axis
 * 		a checkbox for whether or not to show the complement sequence
 *
 * If this should only be one row, pull the name of the part way to the left
 * of the sequence, as well as the dropdown box. There should be no slider
 * on with one row (there should be a draggable width view)
 *
 */
class Header extends React.PureComponent {
  render() {
    const {
      seq,
      compSeq,
      name,
      sliders,
      seqLength,
      type,
      Zoom,
      seqStateChange,
      showSearch,
      seqSelection,
      findSelection,
      circularCentralIndex,
      linearCentralIndex,
      setPartState
    } = this.props;

    const partState = {
      showSearch,
      seqSelection,
      findSelection,
      circularCentralIndex,
      linearCentralIndex,
      setPartState
    };

    const headerSliders =
      seqLength < 200 ? sliders.filter(s => s !== "Zoom") : sliders;
    return (
      <div className="Seq-Header-container">
        <div
          className={`header-name-container ${headerSliders.length < 1 &&
            "extra"}`}
        >
          <div>{name}</div>
        </div>
        <div className="header-sliders-container">
          {headerSliders.length > 0 ? (
            <Sliders
              type={type}
              Zoom={Zoom}
              sliders={headerSliders}
              seqLength={seqLength}
              seqStateChange={seqStateChange}
              {...partState}
            />
          ) : null}
        </div>
        <div className="header-options-container">
          <OptionsDropdown {...this.props} />
        </div>
        <div className="header-find-container">
          <Find
            seq={seq}
            compSeq={compSeq}
            seqLength={seqLength}
            {...partState}
          />
        </div>
      </div>
    );
  }
}

export default Header;
