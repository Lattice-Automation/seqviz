import { isEqual } from "lodash";
import React, { Component } from "react";
import {
  Button,
  Checkbox,
  Container,
  Divider,
  Dropdown,
  Grid,
  Icon,
  Image,
  Input,
  Menu,
  Sidebar
} from "semantic-ui-react";
import { SeqViz } from "seqviz";

import LatticeLogo from "../src/lattice-brand.png";
import SeqvizLogo from "../src/seqviz-brand-small.png";
import seqvizGraphic from "../src/seqviz-logo.png";
import { Header } from "./Header";
import { history, urlParams, updateUrl } from "./utils";

import "./App.css";

const viewerTypeOptions = [
  { key: "both", value: "both", text: "Both" },
  { key: "circular", value: "circular", text: "Circular" },
  { key: "linear", value: "linear", text: "Linear" }
];

export class Demo extends Component {
  state = {
    part: urlParams().biobrick,
    backbone: urlParams().backbone,
    viewType: "",
    annotations: true,
    primers: true,
    complement: true,
    index: true,
    query: "",
    enzymes: [],
    lzoom: 50,
    selection: {},
    searchResults: {}
  };

  constructor(props) {
    super(props);

    // on changes to backbone or part, update that in state
    history.listen(() => {
      const { backbone, biobrick } = urlParams();

      if (
        backbone !== this.state.backbone ||
        biobrick !== this.state.biobrick
      ) {
        this.setState({ backbone: backbone, part: biobrick });
      }
    });
  }

  setDemoState = state => {
    let newState = Object.keys(state).reduce((newState, key) => {
      if (state[key].constructor === "Object") {
        newState[key] = { ...this.state[key], ...state[key] };
      } else {
        newState[key] = state[key];
      }
      return newState;
    }, {});

    this.setState({ ...this.state, ...newState });
  };

  render() {
    return <SideBarMenu {...this.state} setDemoState={this.setDemoState} />;
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
    const { setDemoState, part, enzymes } = this.props;
    const { visible } = this.state;

    return (
      <div style={{ height: "100vh" }}>
        <Sidebar.Pushable className="sidebar-container">
          <Sidebar
            stylename="sidebar-container"
            id="options-sidebar"
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
            {/* <Menu.Item as="a" className="options-checkbox">
              <CheckboxInput
                setDemoState={setDemoState}
                name="annotations"
                label="Show annotations"
              />
            </Menu.Item> */}
            {/* <Menu.Item as="a" className="options-checkbox">
              <CheckboxInput
                setDemoState={setDemoState}
                name="primers"
                label="Show primers"
              />
            </Menu.Item> */}
            <Menu.Item as="a" className="options-checkbox">
              <CheckboxInput
                setDemoState={setDemoState}
                name="complement"
                label="Show complement"
              />
            </Menu.Item>
            <Menu.Item as="a" className="options-checkbox">
              <CheckboxInput
                setDemoState={setDemoState}
                name="index"
                label="Show axis"
              />
            </Menu.Item>
            <Menu.Item as="a">
              <EnzymeInput setDemoState={setDemoState} enzymes={enzymes} />
            </Menu.Item>
            <SidebarFooter />
          </Sidebar>
          <Sidebar.Pusher as={Container} fluid dimmed={visible}>
            <div className="seqviz-container">
              <Header {...this.props} toggleSidebar={this.toggleSidebar} />
              {part ? (
                <div id="seqviewer">
                  <SequenceViewer {...this.props} />
                </div>
              ) : (
                <div id="landing-zone">
                  <div id="getting-started-card" className="card">
                    <Image
                      id="seqviz-brand-getting-started"
                      src={SeqvizLogo}
                      floated="right"
                    />
                  </div>
                  <div id="landing-card" className="card">
                    <div id="starting-instructions">
                      Type a <strong>BioBrick ID</strong> from <br />
                      iGEM's{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="http://parts.igem.org/Main_Page"
                      >
                        Registry of Standard Biological Parts
                      </a>{" "}
                      <br />
                      into the search above to get started
                    </div>
                    <Divider horizontal>Or</Divider>
                    <StartButton setDemoState={setDemoState} />
                  </div>
                  <div id="lattice-card" className="card">
                    <p>
                      Created by{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://latticeautomation.com/"
                      >
                        Lattice Automation
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

export class ViewerTypeInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <div className="option" id="topology">
        <span>Topology</span>
        <Dropdown
          defaultValue="both"
          fluid
          selection
          options={viewerTypeOptions}
          onChange={(_, data) => {
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
      <div className="option" id="zoom">
        <span>Zoom</span>
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
      <div className="option" id="options-search">
        <span>{`${searchResults.length} results`}</span>
        <Input
          icon="search"
          placeholder="Search..."
          onChange={(_, data) => {
            setDemoState({ query: data.value });
          }}
        />
      </div>
    );
  }
}

export class EnzymeInput extends Component {
  state = { PstI: false, EcoRI: false, XbaI: false, SpeI: false };

  handleChange = enzyme => {
    const { setDemoState, enzymes } = this.props;
    let newEnzymes = [];
    if (enzymes.includes(enzyme)) {
      newEnzymes = enzymes.filter(e => e !== enzyme);
      this.setState({ [enzyme]: false });
    } else {
      newEnzymes = enzymes.concat([enzyme]);
      this.setState({ [enzyme]: true });
    }
    setDemoState({ enzymes: newEnzymes });
  };

  render() {
    return (
      <div className="option" id="enzymes">
        <span>Enzymes</span>
        <Grid id="enzyme-grid" columns={2}>
          <Grid.Row className="enzyme-grid-row">
            <Grid.Column className="enzyme-grid-column">
              <Button
                fluid
                className="enzyme-button"
                active={this.state.PstI}
                color={this.state.PstI ? "blue" : null}
                onClick={() => this.handleChange("PstI")}
              >
                PstI
              </Button>
            </Grid.Column>
            <Grid.Column className="enzyme-grid-column">
              <Button
                fluid
                className="enzyme-button"
                active={this.state.EcoRI}
                color={this.state.EcoRI ? "blue" : null}
                onClick={() => this.handleChange("EcoRI")}
              >
                EcoRI
              </Button>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row className="enzyme-grid-row">
            <Grid.Column className="enzyme-grid-column">
              <Button
                fluid
                className="enzyme-button"
                active={this.state.XbaI}
                color={this.state.XbaI ? "blue" : null}
                onClick={() => this.handleChange("XbaI")}
              >
                XbaI
              </Button>
            </Grid.Column>
            <Grid.Column className="enzyme-grid-column">
              <Button
                fluid
                className="enzyme-button"
                active={this.state.SpeI}
                color={this.state.SpeI ? "blue" : null}
                onClick={() => this.handleChange("SpeI")}
              >
                SpeI
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
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
        onChange={(_, data) => {
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
      annotations = true,
      // primers = true,
      complement = true,
      index = true,
      query = "",
      enzymes = [],
      lzoom = 50,
      setDemoState
    } = this.props;

    const viewType = view || "both";

    return (
      <SeqViz
        accession={part}
        backbone={backbone}
        viewer={viewType}
        showAnnotations={annotations}
        showComplement={complement}
        showIndex={index}
        onSelection={selection => {
          setDemoState({ selection: selection });
        }}
        onSearch={results => {
          setDemoState({ searchResults: results });
        }}
        searchQuery={{ query: query }}
        copySeq={{
          key: "c",
          meta: true,
          ctrl: false,
          shift: false,
          alt: false
        }}
        enzymes={enzymes}
        zoom={{ linear: lzoom }}
      />
    );
  }
}

export class SidebarHeader extends Component {
  render() {
    const { toggleSidebar } = this.props;

    return (
      <div className="sidebar-header">
        <div id="header-left">
          <Image id="seqviz-graphic" src={seqvizGraphic} />
          <h3>Settings</h3>
        </div>
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

export class SidebarFooter extends Component {
  render() {
    return (
      <div className="sidebar-footer">
        <Divider clearing />
        <Image id="lattice-brand" src={LatticeLogo} />
        <p>
          Created by{" "}
          <span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://latticeautomation.com/"
            >
              Lattice Automation
            </a>
          </span>
        </p>
        <p>
          <Icon name="github" />
          <span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/Lattice-Automation/seqviz"
            >
              seqviz
            </a>
          </span>
          <span>{"  |  "}</span>
          <Icon name="medium" />
          <span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://medium.com/@lattice.core/visualize-your-dna-sequences-with-seqviz-b1d945eb9684"
            >
              Story
            </a>
          </span>
          <span>{"  |  "}</span>
          <Icon name="edit outline" />
          <span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://docs.google.com/forms/d/1ILD3UwPvdkQlM06En7Pl9VqVpN_-g5iWs-B6gjKh9b0/viewform?edit_requested=true"
            >
              Survey
            </a>
          </span>
        </p>
        <p>
          <span>contact@latticeautomation.com</span>
        </p>
      </div>
    );
  }
}

export class StartButton extends Component {
  render() {
    return (
      <div id="easy-start">
        <Button
          id="default-part-button"
          onClick={() => {
            updateUrl({ backbone: "pSB1C3", biobrick: "BBa_K1598008" });
          }}
        >
          CLICK
        </Button>
        <span>
          to load default part (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="http://parts.igem.org/Part:BBa_K1598008"
          >
            BBa_K1598008
          </a>
          )
        </span>
      </div>
    );
  }
}
