import { isEqual } from "lodash";
import React, { Component } from "react";
import {
  Button,
  Checkbox,
  Container,
  Dropdown,
  Input,
  Menu,
  Sidebar
} from "semantic-ui-react";
import "./App.css";
import { Header } from "./Header";

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
        <br />
        <br />
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

export class SidebarHeader extends Component {
  render() {
    const { toggleSidebar } = this.props;
    return (
      <div className="sidebar-header">
        <h3>Viewer Options</h3>
        <Button
          onClick={toggleSidebar}
          id="sidebar-toggle-close"
          className="circular-button"
          circular
          floated="right"
          icon="angle left"
        />
      </div>
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
            <SidebarHeader toggleSidebar={this.toggleSidebar} />
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
              <Header {...this.props} toggleSidebar={this.toggleSidebar} />
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
