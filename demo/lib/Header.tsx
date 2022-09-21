// @ts-nocheck
import * as React from "react";
import { Button, Icon, Image, Popup } from "semantic-ui-react";

export class Header extends React.Component {
  state = { active: false };

  handleMetaClick = () => this.setState(prevState => ({ active: !prevState.active }));

  render() {
    const { part, toggleSidebar } = this.props;
    // Hack to render a bottom margin for linear map when the meta bar is open

    if (this.state.active && document.getElementById("la-vz-seqblock-container")) {
      document.getElementById("la-vz-seqblock-container").style.marginBottom = "32px";
    } else if (document.getElementById("la-vz-seqblock-container")) {
      document.getElementById("la-vz-seqblock-container").style.marginBottom = "0";
    }

    return (
      <div className="header" id="app-header">
        <div id="header-primary">
          <Popup
            trigger={
              <Button
                id="sidebar-toggle-open"
                className="circular-button"
                circular
                icon="bars"
                onClick={toggleSidebar}
              />
            }
            className="popup-tooltip"
            inverted
            content="Options"
            position="bottom left"
          />
          <SelectionInfo {...this.props} active={this.state.active} handleMetaClick={this.handleMetaClick} />
          <a
            id="github-link"
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/Lattice-Automation/seqviz"
          >
            <Icon name="github" size="large" />
          </a>
          <Image id="brand" src="https://tools.latticeautomation.com/seqviz/seqviz-logo.png" floated="right" />
        </div>
        {this.state.active && part && (
          <div id="header-meta">
            <HeaderMeta {...this.props} />
          </div>
        )}
      </div>
    );
  }
}

export class SelectionInfo extends React.Component {
  render() {
    const { active, handleMetaClick, part } = this.props;

    return (
      <div className="meta-toggle">
        <Button id="meta-button" toggle active={active} disabled={part ? false : true} onClick={handleMetaClick}>
          {active ? "HIDE META" : "SHOW META"}
        </Button>
      </div>
    );
  }
}

export class HeaderMeta extends React.Component {
  render() {
    const { selection } = this.props;
    const { feature, start, end, length, gc, tm } = selection;
    const noneSelected = start === end;

    return (
      selection && (
        <div className="selection-meta">
          {noneSelected && (
            <div className="meta-datum" id="no-selection">
              <p>Make a selection on the circular or linear map.</p>
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
  }
}
