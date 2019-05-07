import * as React from "react";
import Find from "../../Find/Find";
import "./Header.scss";
import OptionsDropdown from "./OptionsDropdown/OptionsDropdown";
import Sliders from "./Sliders/Sliders";
class Header extends React.PureComponent {
  render() {
    const {
      seq,
      compSeq,
      name,

      sliders,
      seqLength,
      Linear,
      Zoom,
      seqStateChange,

      showSearch,
      seqSelection,
      findState,
      circularCentralIndex,
      linearCentralIndex,
      setPartState
    } = this.props;

    const partState = {
      showSearch,
      seqSelection,
      findState,
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
          <h3>{name}</h3>
        </div>
        <div className="header-sliders-container">
          {headerSliders.length > 0 ? (
            <Sliders
              Linear={Linear}
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
