import * as React from "react";
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
  Sidebar,
} from "semantic-ui-react";
import seqparse from "seqparse";

import SeqViz from "../../src/SeqViz";
import { AnnotationProp } from "../../src/elements";
import Header from "./Header";
import file from "./file";

const viewerTypeOptions = [
  { key: "both", text: "Both", value: "both" },
  { key: "circular", text: "Circular", value: "circular" },
  { key: "linear", text: "Linear", value: "linear" },
];

interface AppState {
  annotations: AnnotationProp[];
  enzymes: any[];
  name: string;
  primers: boolean;
  search: { query: string };
  searchResults: any;
  selection: any;
  seq: string;
  showComplement: boolean;
  showIndex: boolean;
  showSelectionMeta: boolean;
  showSidebar: boolean;
  translations: { end: number; start: number; direction?: 1 | -1 }[];
  viewer: string;
  zoom: number;
}

export default class App extends React.Component<any, AppState> {
  state: AppState = {
    annotations: [],
    enzymes: ["PstI", "EcoRI", "XbaI", "SpeI"],
    name: "",
    primers: true,
    search: { query: "ttnnnaat" },
    searchResults: {},
    selection: {},
    seq: "",
    showComplement: true,
    showIndex: true,
    showSelectionMeta: false,
    showSidebar: false,
    translations: [
      { end: 630, start: 6, direction: -1 },
      { end: 1147, start: 736 },
      { end: 1885, start: 1165 },
    ],
    viewer: "",
    zoom: 50,
  };

  componentDidMount = async () => {
    const seq = await seqparse(file);
    this.setState({ annotations: seq.annotations, name: seq.name, seq: seq.seq });
  };

  toggleSidebar = () => {
    const { showSidebar } = this.state;
    this.setState({ showSidebar: !showSidebar });
  };

  toggleShowSelectionMeta = () => {
    const { showSelectionMeta } = this.state;
    this.setState({ showSelectionMeta: !showSelectionMeta });
  };

  handleHide = () => {
    this.setState({ showSidebar: false });
  };

  toggleEnzyme = (e: string) => {
    const { enzymes } = this.state;

    if (enzymes.includes(e)) {
      this.setState({ enzymes: enzymes.filter(enz => enz !== e) });
    } else {
      this.setState({ enzymes: [...enzymes, e] });
    }
  };

  render() {
    return (
      <div style={{ height: "100vh" }}>
        <Sidebar.Pushable className="sidebar-container">
          <Sidebar
            animation="overlay"
            as={Menu}
            id="options-sidebar"
            stylename="sidebar-container"
            vertical
            visible={this.state.showSidebar}
            onHide={this.handleHide}
          >
            <SidebarHeader toggleSidebar={this.toggleSidebar} />
            <Menu.Item as="a">
              <ViewerTypeInput
                setType={(viewer: string) => {
                  this.setState({ viewer });
                }}
              />
            </Menu.Item>
            <Menu.Item as="a">
              <LinearZoomInput setZoom={zoom => this.setState({ zoom })} />
            </Menu.Item>
            <Menu.Item as="a">
              <SearchQueryInput setQuery={query => this.setState({ search: { query } })} />
            </Menu.Item>
            <Menu.Item as="a" className="options-checkbox">
              <CheckboxInput
                label="Show complement"
                name="showComplement"
                set={(showComplement: boolean) => this.setState({ showComplement })}
              />
            </Menu.Item>
            <Menu.Item as="a" className="options-checkbox">
              <CheckboxInput label="Show index" name="index" set={showIndex => this.setState({ showIndex })} />
            </Menu.Item>
            <Menu.Item as="a">
              <EnzymeInput enzymes={this.state.enzymes} toggleEnzyme={this.toggleEnzyme} />
            </Menu.Item>
            <SidebarFooter />
          </Sidebar>
          <Sidebar.Pusher as={Container} dimmed={this.state.showSidebar} fluid>
            <div id="seqviz-container">
              <Header
                selection={this.state.selection}
                showSelectionMeta={this.state.showSelectionMeta}
                toggleShowSelectionMeta={this.toggleShowSelectionMeta}
                toggleSidebar={this.toggleSidebar}
              />
              <div id="seqviewer">
                {this.state.seq && (
                  <SeqViz
                    // accession="MN623123"
                    annotations={this.state.annotations}
                    enzymes={this.state.enzymes}
                    name={this.state.name}
                    search={this.state.search}
                    seq={this.state.seq}
                    showComplement={this.state.showComplement}
                    showIndex={this.state.showIndex}
                    translations={this.state.translations}
                    viewer={this.state.viewer as "linear" | "circular"}
                    zoom={{ linear: this.state.zoom }}
                    selection={this.state.selection}
                    onSelection={selection => this.setState({ selection })}
                  />
                )}
              </div>
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

const ViewerTypeInput = ({ setType }: { setType: (viewType: string) => void }) => (
  <div className="option" id="topology">
    <span>Topology</span>
    <Dropdown
      defaultValue="both"
      fluid
      options={viewerTypeOptions}
      selection
      onChange={(_, data) => {
        setType(`${data.value}`);
      }}
    />
  </div>
);

const LinearZoomInput = ({ setZoom }: { setZoom: (zoom: number) => void }) => (
  <div className="option" id="zoom">
    <span>Zoom</span>
    <input
      className="slider"
      defaultValue="50"
      id="zoom"
      max="100"
      min="1"
      type="range"
      onChange={e => {
        setZoom(parseInt(e.target.value));
      }}
    />
  </div>
);

const SearchQueryInput = ({ setQuery }: { setQuery: (query: string) => void }) => (
  <div className="option" id="options-search">
    <Input icon="search" placeholder="Search..." onChange={(_, data) => setQuery(data.value)} />
  </div>
);

const CheckboxInput = ({ label, name, set }: { label: string; name: string; set: (v: any) => void }) => (
  <Checkbox defaultChecked label={label} name={name} toggle onChange={(_, data) => set(data.checked)} />
);

const EnzymeInput = ({ enzymes, toggleEnzyme }: { enzymes: string[]; toggleEnzyme: (e: string) => void }) => (
  <div className="option" id="enzymes">
    <span>Enzymes</span>
    <Grid columns={2} id="enzyme-grid">
      <Grid.Row className="enzyme-grid-row">
        <Grid.Column className="enzyme-grid-column">
          <Button
            active={enzymes.includes("PstI")}
            className="enzyme-button"
            color={enzymes.includes("PstI") ? "blue" : null}
            fluid
            onClick={() => toggleEnzyme("PstI")}
          >
            PstI
          </Button>
        </Grid.Column>
        <Grid.Column className="enzyme-grid-column">
          <Button
            active={enzymes.includes("EcoRI")}
            className="enzyme-button"
            color={enzymes.includes("EcoRI") ? "blue" : null}
            fluid
            onClick={() => toggleEnzyme("EcoRI")}
          >
            EcoRI
          </Button>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row className="enzyme-grid-row">
        <Grid.Column className="enzyme-grid-column">
          <Button
            active={enzymes.includes("XbaI")}
            className="enzyme-button"
            color={enzymes.includes("XbaI") ? "blue" : null}
            fluid
            onClick={() => toggleEnzyme("XbaI")}
          >
            XbaI
          </Button>
        </Grid.Column>
        <Grid.Column className="enzyme-grid-column">
          <Button
            active={enzymes.includes("SpeI")}
            className="enzyme-button"
            color={enzymes.includes("SpeI") ? "blue" : null}
            fluid
            onClick={() => toggleEnzyme("SpeI")}
          >
            SpeI
          </Button>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
);

const SidebarHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => (
  <div className="sidebar-header">
    <div id="header-left">
      <Image id="seqviz-graphic" src="https://tools.latticeautomation.com/seqviz/seqviz-logo.png" />
      <h3>Settings</h3>
    </div>
    <Button
      circular
      className="circular-button"
      floated="right"
      icon="angle left"
      id="sidebar-toggle-close"
      onClick={toggleSidebar}
    />
  </div>
);

const SidebarFooter = () => (
  <div className="sidebar-footer">
    <Divider clearing />
    <Image id="lattice-brand" src="https://tools.latticeautomation.com/seqviz/lattice-brand.png" />
    <p>
      Created by{" "}
      <span>
        <a href="https://latticeautomation.com/" rel="noopener noreferrer" target="_blank">
          Lattice Automation
        </a>
      </span>
    </p>
    <p>
      <Icon name="github" />
      <span>
        <a href="https://github.com/Lattice-Automation/seqviz" rel="noopener noreferrer" target="_blank">
          seqviz
        </a>
      </span>
      <span>{"  |  "}</span>
      <Icon name="medium" />
      <span>
        <a
          href="https://medium.com/@lattice.core/visualize-your-dna-sequences-with-seqviz-b1d945eb9684"
          rel="noopener noreferrer"
          target="_blank"
        >
          Story
        </a>
      </span>
      <span>{"  |  "}</span>
      <Icon name="edit outline" />
      <span>
        <a
          href="https://docs.google.com/forms/d/1ILD3UwPvdkQlM06En7Pl9VqVpN_-g5iWs-B6gjKh9b0/viewform?edit_requested=true"
          rel="noopener noreferrer"
          target="_blank"
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
