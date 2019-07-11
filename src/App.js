import React, { Component } from "react";
import {
  Button,
  Checkbox,
  Container,
  Dropdown,
  Icon,
  Image,
  Input,
  Label,
  Menu,
  Sidebar
} from "semantic-ui-react";
import SeqvizLogo from "../src/seqviz-brand-for-header.png";
import "./App.css";
import { isEqual } from "lodash";

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
      <div className="backbone-dropdown">
        <Dropdown
          text={this.state.value}
          icon="circle notched"
          labeled
          floating
          button
          className="icon"
          options={backBoneOptions}
          placeholder="Backbone"
          onChange={(event, data) => {
            this.setState({ value: data.value });
            setDemoState({ backbone: data.value });
          }}
        />
      </div>
    );
  }
}

const viewerTypeOptions = [
  { key: "both", value: "both", text: "Both" },
  { key: "circular", value: "circular", text: "Circular" },
  { key: "linear", value: "linear", text: "Linear" }
];

export class ViewerTypeInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <div>
        Viewer Type:
        <br />
        <br />
        <Dropdown
          defaultValue="both"
          fluid
          selection
          options={viewerTypeOptions}
          onChange={(event, data) => {
            setDemoState({ viewType: data.value });
          }}
        />
      </div>
    );
  }
}

export class LinearZoomInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <div>
        Zoom Linear:
        <br />
        <br />
        <input
          type="range"
          min="1"
          max="100"
          defaultValue="50"
          onChange={e => {
            setDemoState({ lzoom: e.target.value });
          }}
          className="slider"
          id="lzoom"
        />
      </div>
    );
  }
}

export class SearchQueryInput extends Component {
  render() {
    const {
      setDemoState,
      searchResults: { searchResults = [] }
    } = this.props;
    return (
      <div>
        <Input
          fluid
          icon="search"
          placeholder="Search..."
          onChange={(event, data) => {
            setDemoState({ query: data.value });
          }}
        />
        <br />
        {searchResults.length} results
      </div>
    );
  }
}

const enzymeOptions = [
  { key: "psti", value: "PstI", text: "PstI" },
  { key: "ecori", value: "EcoRI", text: "EcoRI" },
  { key: "xbai", value: "XbaI", text: "XbaI" },
  { key: "spei", value: "SpeI", text: "SpeI" }
];

export class EnzymeInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <div>
        Enzymes:
        <Dropdown
          placeholder="Select enzymes"
          fluid
          multiple
          selection
          options={enzymeOptions}
          onChange={(event, data) => {
            setDemoState({ enzymes: data.value });
          }}
        />
      </div>
    );
  }
}

export class CheckboxInput extends Component {
  render() {
    const { name, label, setDemoState } = this.props;
    return (
      <Checkbox
        toggle
        defaultChecked
        name={name}
        label={label}
        onChange={(event, data) => {
          setDemoState({ [name]: data.checked });
        }}
      />
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
        label={{ className: "input-label", content: "BBa_" }}
        labelPosition="left"
        name="accession"
        placeholder="Find a BioBrick ..."
        onChange={(event, data) => {
          setDemoState({ part: data.value });
        }}
      />
    );
  }
}

export class SequenceViewer extends Component {
  shouldComponentUpdate = nextProps => {
    const { searchResults, selection, ...rest } = this.props;
    const {
      searchResults: nextSearchResults,
      selection: nextSelection,
      ...nextRest
    } = nextProps;
    return !isEqual(rest, nextRest);
  };

  render() {
    const {
      part = "",
      backbone = "",
      viewType: view = "both",
      annotate = true,
      annotations = true,
      complement = true,
      index = true,
      query = "",
      enzymes = [],
      lzoom = 50,
      setDemoState
    } = this.props;
    const viewType = view || "both";
    const lattice = window.lattice;
    const viewer = lattice.Viewer("demo-root", {
      part: part,
      backbone: backbone,
      viewer: viewType,
      annotate: annotate,
      showAnnotations: annotations,
      showComplement: complement,
      showIndex: index,
      zoom: { linear: lzoom },
      onSelection: selection => {
        setDemoState({ selection: selection });
      },
      onSearch: results => {
        setDemoState({ searchResults: results });
      },
      searchQuery: { query: query },
      enzymes: Object.values(enzymes)
    });
    return part && viewer.viewer;
  }
}

// TODO: Fix me, please
export class OptionsButton extends Component {
  render() {
    const { toggleSidebar } = this.props;
    return (
      <Button style={{ height: "64px" }} basic fluid onClick={toggleSidebar}>
        <Label className="options-header-label" attached="top">
          SeqViz options
          <Label.Detail>
            <Icon tiny="true" name="angle left" />
          </Label.Detail>
        </Label>
      </Button>
    );
  }
}

export class SelectionInfo extends Component {
  render() {
    const { selection } = this.props;
    const { feature, selectionMeta, sequenceMeta } = selection;
    return (
      selection && (
        <div className="selection-meta">
          {feature && (
            <Label as="a" basic className="label-feature">
              Feature
              <Label.Detail>{feature ? feature.name : ""}</Label.Detail>
            </Label>
          )}
          {feature && feature.type && (
            <Label as="a" basic className="label-type">
              Type
              <Label.Detail>{feature.type}</Label.Detail>
            </Label>
          )}
          {selectionMeta && selectionMeta.selectionLength !== 0 && (
            <Label as="a" basic className="label-length">
              Length
              <Label.Detail>{selectionMeta.selectionLength}bp</Label.Detail>
            </Label>
          )}
          {selectionMeta && selectionMeta.start !== selectionMeta.end && (
            <Label as="a" basic className="label-range">
              Range
              <Label.Detail>
                {selectionMeta.start} - {selectionMeta.end}
              </Label.Detail>
            </Label>
          )}
          {sequenceMeta && sequenceMeta.GC !== 0 && (
            <Label as="a" basic className="label-gc">
              GC
              <Label.Detail>{sequenceMeta.GC.toPrecision(2)}%</Label.Detail>
            </Label>
          )}
          {sequenceMeta && sequenceMeta.Tm !== 0 && (
            <Label as="a" basic className="label-tm">
              Tm
              <Label.Detail>{sequenceMeta.Tm.toPrecision(2)}°C</Label.Detail>
            </Label>
          )}
        </div>
      )
    );
  }
}

export class SideBarMenu extends Component {
  state = { visible: false };

  toggleSidebar = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  handleHide = () => {
    this.setState({ visible: false });
  };

  render() {
    const { visible } = this.state;
    const { setDemoState } = this.props;
    return (
      <div style={{ height: "100vh" }}>
        <Sidebar.Pushable stylename="sidebar-container">
          <Sidebar
            stylename="sidebar-container"
            as={Menu}
            animation="overlay"
            vertical
            onHide={this.handleHide}
            visible={visible}
          >
            <OptionsButton {...this.props} toggleSidebar={this.toggleSidebar} />

            <Menu.Item as="a">
              <ViewerTypeInput setDemoState={setDemoState} />
            </Menu.Item>
            <Menu.Item as="a">
              <LinearZoomInput setDemoState={setDemoState} />
            </Menu.Item>
            <Menu.Item as="a">
              <SearchQueryInput
                setDemoState={setDemoState}
                searchResults={this.props.searchResults}
              />
            </Menu.Item>
            <Menu.Item as="a">
              <CheckboxInput
                setDemoState={setDemoState}
                name="annotate"
                label="Auto-annotate"
              />
            </Menu.Item>
            <Menu.Item as="a">
              <CheckboxInput
                setDemoState={setDemoState}
                name="annotations"
                label="Show annotations"
              />
            </Menu.Item>
            <Menu.Item as="a">
              <CheckboxInput
                setDemoState={setDemoState}
                name="complement"
                label="Show complement"
              />
            </Menu.Item>
            <Menu.Item as="a">
              <CheckboxInput
                setDemoState={setDemoState}
                name="index"
                label="Show axis"
              />
            </Menu.Item>
            <Menu.Item as="a">
              <EnzymeInput setDemoState={setDemoState} />
            </Menu.Item>
          </Sidebar>
          <Sidebar.Pusher as={Container} fluid dimmed={visible}>
            <div className="seqviz-container">
              <div id="header">
                <div className="control-panel">
                  <Button
                    id="sidebar-toggle-open"
                    icon="bars"
                    onClick={this.toggleSidebar}
                  />
                  <PartInput setDemoState={setDemoState} />
                  <BackBoneInput setDemoState={setDemoState} />
                  <SelectionInfo {...this.props} />
                  <Image
                    className="header-logo"
                    src={SeqvizLogo}
                    floated="right"
                  />
                </div>
              </div>
              <div id="seqviewer">
                <SequenceViewer {...this.props} />
              </div>
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

export class Demo extends Component {
  state = {
    part: "",
    backbone: "",
    viewType: "",
    annotate: true,
    annotations: true,
    complement: true,
    index: true,
    query: "",
    enzymes: [],
    lzoom: 50,
    selection: {},
    searchResults: {}
  };
  setDemoState = state => {
    let newState = Object.keys(state).reduce((newState, key) => {
      if (typeof state[key] === "object") {
        newState[key] = { ...this.state[key], ...state[key] };
      } else {
        newState[key] = state[key];
      }
      return newState;
    }, {});
    const { ...rest } = this.state;
    this.setState({ ...rest, ...newState });
  };
  render() {
    return <SideBarMenu {...this.state} setDemoState={this.setDemoState} />;
  }
}
