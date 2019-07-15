import React, { Component } from "react";
import {
  Button,
  Dropdown,
  Image,
  Input,
  Label,
  Popup
} from "semantic-ui-react";
import SeqvizLogo from "../src/seqviz-brand-for-header.png";
import "./Header.css";

const backBoneOptions = [
  { key: "psb1c3", value: "pSB1C3", text: "pSB1C3" },
  { key: "psb1a3", value: "pSB1A3", text: "pSB1A3" },
  { key: "psb1ac3", value: "pSB1AC3", text: "pSB1AC3" },
  { key: "psb1ak3", value: "pSB1AK3", text: "pSB1AK3" },
  { key: "psb1at3", value: "pSB1AT3", text: "pSB1AT3" },
  { key: "psb1k3", value: "pSB1K3", text: "pSB1K3" },
  { key: "psb1t3", value: "pSB1T3", text: "pSB1T3" },
  { key: "psb1a7", value: "pSB1A7", text: "pSB1A7" },
  { key: "bba_k1362091", value: "BBa_K1362091", text: "BBa_K1362091" },
  { key: "bba_k823055", value: "BBa_K823055", text: "BBa_K823055" }
];
export class BackBoneInput extends Component {
  state = { value: "pSB1C3" }; // default backbone
  componentDidMount = () => {
    const { setDemoState } = this.props;
    setDemoState({ backbone: this.state.value });
  };
  render() {
    const { setDemoState } = this.props;
    return (
      <div className="backbone-picker">
        <Label>Backbone</Label>
        <Dropdown
          id="dropdown"
          text={this.state.value}
          floating
          options={backBoneOptions}
          placeholder="Select Backbone"
          onChange={(event, data) => {
            this.setState({ value: data.value });
            setDemoState({ backbone: data.value });
          }}
        />
      </div>
    );
  }
}

export class PartInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <Input
        icon="search"
        className="part-input"
        id="part-input"
        label={{ className: "input-label", content: "BioBrick" }}
        labelPosition="left"
        name="accession"
        placeholder="Search iGEM..."
        onChange={(event, data) => {
          setDemoState({ part: data.value });
        }}
      />
    );
  }
}

export class SelectionInfo extends Component {
  render() {
    const { active, handleMetaClick } = this.props;
    return (
      <div className="meta-toggle">
        <Button
          id="meta-button"
          toggle
          active={active}
          onClick={handleMetaClick}
        >
          {active ? "Hide Meta" : "Show Meta"}
        </Button>
      </div>
    );
  }
}

export class HeaderMeta extends Component {
  render() {
    const { selection } = this.props;
    const { feature, selectionMeta, sequenceMeta } = selection;
    const noneSelected =
      !selectionMeta || selectionMeta.start === selectionMeta.end;
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
          {selectionMeta && selectionMeta.selectionLength !== 0 && (
            <div className="meta-datum">
              <p id="field">LENGTH</p>
              <p id="value">{selectionMeta.selectionLength}bp</p>
            </div>
          )}
          {selectionMeta && selectionMeta.start !== selectionMeta.end && (
            <div className="meta-datum">
              <p id="field">RANGE</p>
              <p id="value">
                {selectionMeta.start} - {selectionMeta.end}
              </p>
            </div>
          )}
          {sequenceMeta && sequenceMeta.GC !== 0 && (
            <div className="meta-datum">
              <p id="field">GC</p>
              <p id="value">{sequenceMeta.GC.toPrecision(2)}%</p>
            </div>
          )}
          {sequenceMeta && sequenceMeta.Tm !== 0 && (
            <div className="meta-datum">
              <p id="field">TM</p>
              <p id="value">{sequenceMeta.Tm.toPrecision(2)}°C</p>
            </div>
          )}
        </div>
      )
    );
  }
}

export class Header extends Component {
  state = {};
  handleMetaClick = () =>
    this.setState(prevState => ({ active: !prevState.active }));
  render() {
    const { setDemoState, toggleSidebar } = this.props;

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
          <BackBoneInput setDemoState={setDemoState} />
          <PartInput setDemoState={setDemoState} />
          <SelectionInfo
            {...this.props}
            active={this.state.active}
            handleMetaClick={this.handleMetaClick}
          />
          <Image id="brand" src={SeqvizLogo} floated="right" />
        </div>
        {this.state.active && (
          <div id="header-meta">
            <HeaderMeta {...this.props} />
          </div>
        )}
      </div>
    );
  }
}
