import * as React from "react";
import { Button, Icon, Image, Popup } from "semantic-ui-react";

const Header = ({ selection, showSelectionMeta, toggleShowSelectionMeta, toggleSidebar }) => (
  <div className="header" id="app-header">
    <div id="header-primary">
      <Popup
        className="popup-tooltip"
        content="Options"
        inverted
        position="bottom left"
        trigger={
          <Button circular className="circular-button" icon="bars" id="sidebar-toggle-open" onClick={toggleSidebar} />
        }
      />
      <ToggleSelectionMetaButton
        showSelectionMeta={showSelectionMeta}
        toggleShowSelectionMeta={toggleShowSelectionMeta}
      />
      <a href="https://github.com/Lattice-Automation/seqviz" id="github-link" rel="noopener noreferrer" target="_blank">
        <Icon name="github" size="large" />
      </a>
      <Image floated="right" id="brand" src="https://tools.latticeautomation.com/seqviz/seqviz-logo.png" />
    </div>
    {showSelectionMeta && (
      <div id="header-meta">
        <SelectionMetaRow selection={selection} />
      </div>
    )}
  </div>
);

export default Header;

const ToggleSelectionMetaButton = ({ showSelectionMeta, toggleShowSelectionMeta }) => (
  <div className="meta-toggle">
    <Button active={showSelectionMeta} id="meta-button" toggle onClick={toggleShowSelectionMeta}>
      {showSelectionMeta ? "HIDE META" : "SHOW META"}
    </Button>
  </div>
);

const SelectionMetaRow = ({ selection }) => {
  const { end, feature, gc, length, start, tm } = selection;
  const noneSelected = start === end;

  return (
    selection && (
      <div className="selection-meta">
        {noneSelected && (
          <div className="meta-datum" id="no-selection">
            <p>Make a selection on the circular or linear viewer.</p>
          </div>
        )}
        {feature && (
          <div className="meta-datum" id="feature-name">
            <p id="field">FEATURE</p>
            <p id="value">{feature ? feature.name : ""}</p>
          </div>
        )}
        {feature && feature.type && (
          <div className="meta-datum" id="feature-type">
            <p id="field">TYPE</p>
            <p id="value">{feature.type}</p>
          </div>
        )}
        {length !== 0 && (
          <div className="meta-datum">
            <p id="field">LENGTH</p>
            <p id="value">{length}bp</p>
          </div>
        )}
        {start !== end && (
          <div className="meta-datum">
            <p id="field">RANGE</p>
            <p id="value">
              {start} - {end}
            </p>
          </div>
        )}
        {gc !== 0 && (
          <div className="meta-datum">
            <p id="field">GC</p>
            <p id="value">{gc}%</p>
          </div>
        )}
        {tm !== 0 && (
          <div className="meta-datum">
            <p id="field">TM</p>
            <p id="value">{tm}°C</p>
          </div>
        )}
      </div>
    )
  );
};
