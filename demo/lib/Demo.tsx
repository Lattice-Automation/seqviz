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
import { Header } from "./Header";

const viewerTypeOptions = [
  { key: "both", value: "both", text: "Both" },
  { key: "circular", value: "circular", text: "Circular" },
  { key: "linear", value: "linear", text: "Linear" },
];

interface AppProps {}
interface AppState {
  enzymes: any[];
  primers: boolean;
  name: string;
  search: { query: string };
  searchResults: any;
  selection: any;
  annotations: AnnotationProp[];
  seq: string;
  showComplement: boolean;
  showIndex: boolean;
  showSidebar: boolean;
  viewType: string;
  zoom: number;
}

export default class App extends React.Component<AppProps, AppState> {
  state: AppState = {
    annotations: [],
    enzymes: [],
    primers: true,
    name: "",
    search: { query: "" },
    searchResults: {},
    seq: "",
    selection: {},
    showComplement: true,
    showIndex: true,
    showSidebar: false,
    viewType: "",
    zoom: 50,
  };

  componentDidMount = async () => {
    const seq = await seqparse("NC_011521");

    this.setState({ seq: seq.seq, annotations: seq.annotations, name: seq.name });
  };

  toggleSidebar = () => {
    const { showSidebar } = this.state;
    this.setState({ showSidebar: !showSidebar });
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
            stylename="sidebar-container"
            id="options-sidebar"
            as={Menu}
            animation="overlay"
            vertical
            onHide={this.handleHide}
            visible={this.state.showSidebar}
          >
            <SidebarHeader toggleSidebar={this.toggleSidebar} />
            <Menu.Item as="a">
              <ViewerTypeInput
                setType={(viewType: string) => {
                  this.setState({ viewType });
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
                set={(showComplement: boolean) => this.setState({ showComplement })}
                name="showComplement"
                label="Show complement"
              />
            </Menu.Item>
            <Menu.Item as="a" className="options-checkbox">
              <CheckboxInput set={showIndex => this.setState({ showIndex })} name="index" label="Show axis" />
            </Menu.Item>
            <Menu.Item as="a">
              <EnzymeInput enzymes={this.state.enzymes} toggleEnzyme={this.toggleEnzyme} />
            </Menu.Item>
            <SidebarFooter />
          </Sidebar>
          <Sidebar.Pusher as={Container} fluid dimmed={this.state.showSidebar}>
            <div id="seqviz-container">
              {/* @ts-ignore */}
              <Header {...this.props} toggleSidebar={this.toggleSidebar} />
              <div id="seqviewer">
                {this.state.seq && (
                  // @ts-ignore
                  <SeqViz
                    annotations={this.state.annotations}
                    enzymes={this.state.enzymes}
                    name={this.state.name}
                    onSelection={selection => this.setState({ selection })}
                    search={this.state.search}
                    seq={this.state.seq}
                    showComplement={this.state.showComplement}
                    showIndex={this.state.showIndex}
                    viewer={this.state.viewType as "linear" | "circular"}
                    zoom={{ linear: this.state.zoom }}
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
      selection
      options={viewerTypeOptions}
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
      type="range"
      min="1"
      max="100"
      defaultValue="50"
      onChange={e => {
        setZoom(parseInt(e.target.value));
      }}
      className="slider"
      id="zoom"
    />
  </div>
);

const SearchQueryInput = ({ setQuery }: { setQuery: (query: string) => void }) => (
  <div className="option" id="options-search">
    <Input icon="search" placeholder="Search..." onChange={(_, data) => setQuery(data.value)} />
  </div>
);

const CheckboxInput = ({ name, label, set }: { name: string; label: string; set: (v: any) => void }) => (
  <Checkbox toggle defaultChecked name={name} label={label} onChange={(_, data) => set(data.checked)} />
);

const EnzymeInput = ({ enzymes, toggleEnzyme }: { enzymes: string[]; toggleEnzyme: (e: string) => void }) => (
  <div className="option" id="enzymes">
    <span>Enzymes</span>
    <Grid id="enzyme-grid" columns={2}>
      <Grid.Row className="enzyme-grid-row">
        <Grid.Column className="enzyme-grid-column">
          <Button
            fluid
            className="enzyme-button"
            active={enzymes.includes("PstI")}
            color={enzymes.includes("PstI") ? "blue" : null}
            onClick={() => toggleEnzyme("PstI")}
          >
            PstI
          </Button>
        </Grid.Column>
        <Grid.Column className="enzyme-grid-column">
          <Button
            fluid
            className="enzyme-button"
            active={enzymes.includes("EcoRI")}
            color={enzymes.includes("EcoRI") ? "blue" : null}
            onClick={() => toggleEnzyme("EcoRI")}
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
            active={enzymes.includes("XbaI")}
            color={enzymes.includes("XbaI") ? "blue" : null}
            onClick={() => toggleEnzyme("XbaI")}
          >
            XbaI
          </Button>
        </Grid.Column>
        <Grid.Column className="enzyme-grid-column">
          <Button
            fluid
            className="enzyme-button"
            active={enzymes.includes("SpeI")}
            color={enzymes.includes("SpeI") ? "blue" : null}
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
      onClick={toggleSidebar}
      id="sidebar-toggle-close"
      className="circular-button"
      circular
      floated="right"
      icon="angle left"
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
        <a target="_blank" rel="noopener noreferrer" href="https://latticeautomation.com/">
          Lattice Automation
        </a>
      </span>
    </p>
    <p>
      <Icon name="github" />
      <span>
        <a target="_blank" rel="noopener noreferrer" href="https://github.com/Lattice-Automation/seqviz">
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
