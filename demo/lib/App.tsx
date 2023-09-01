import * as React from "react";
import { Menu as ContextMenu, Item, Separator, Submenu, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
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
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import { TextSpan } from "typescript";

import Circular from "../../src/Circular/Circular";
import Linear from "../../src/Linear/Linear";
import SeqViz from "../../src/SeqViz";
import { AnnotationProp } from "../../src/elements";
import { SEQVIZ_ELEMENTS_TYPES } from "../../src/seqvizElementsTypes";
import Header from "./Header";
import file from "./file";

const CONTEXT_MENU_ID = "menu-id";

const viewerTypeOptions = [
  { key: "both", text: "Both", value: "both" },
  { key: "circular", text: "Circular", value: "circular" },
  { key: "linear", text: "Linear", value: "linear" },
  { key: "both_flip", text: "Both Flip", value: "both_flip" },
];

interface AppState {
  annotations: AnnotationProp[];
  customChildren: boolean;
  enzymes: any[];
  name: string;
  hoveredBase: number;
  search: { query: string };
  searchResults: any;
  selection: any;
  seq: string;
  showComplement: boolean;
  showIndex: boolean;
  showSelectionMeta: boolean;
  showSidebar: boolean;
  translations: { direction?: 1 | -1; end: number; start: number }[];
  viewer: string;
  zoom: number;
}

export default class App extends React.Component<any, AppState> {
  state: AppState = {
    annotations: [],
    customChildren: true,
    enzymes: ["PstI", "EcoRI", "XbaI", "SpeI"],
    hoveredBase: 0,
    name: "",
    search: { query: "ttnnnaat" },
    searchResults: {},
    selection: {},
    seq: "",
    showComplement: true,
    showIndex: true,
    showSelectionMeta: false,
    showSidebar: false,
    translations: [
      { direction: -1, end: 630, start: 6 },
      { end: 1147, start: 736 },
      { end: 1885, start: 1165 },
    ],
    viewer: "both",
    zoom: 50,
  };
  linearRef: React.RefObject<HTMLDivElement> = React.createRef();
  circularRef: React.RefObject<HTMLDivElement> = React.createRef();

  showContextMenu: (params: any) => void = () => {
    //do nothing
  };

  componentDidMount = async () => {
    const seq = await seqparse(file);

    const { show } = useContextMenu({
      id: CONTEXT_MENU_ID,
    });

    this.showContextMenu = show;

    this.setState({ annotations: seq.annotations, name: seq.name, seq: seq.seq, hoveredBase: 0 });
  };

  handleContextMenuAddForwardTranslation = ({ event, props, triggerEvent, data }) => {
    // console.log(event, props, triggerEvent, data);
    console.log(this.state.selection);
    if (
      !this.state.selection.start ||
      !this.state.selection.end ||
      !this.state.selection.length ||
      this.state.selection.length === 0
    ) {
      this.state.translations.push({
        direction: 1,
        end: this.state.seq.length,
        start: 0,
      });
    } else {
      const { start, end, clockwise } = this.state.selection;
      this.state.translations.push({
        direction: 1,
        end: clockwise ? end : start,
        start: clockwise ? start : end,
      });
    }
    this.setState({
      translations: this.state.translations,
    });
  };

  handleContextMenuAddReverseTranslation = ({ event, props, triggerEvent, data }) => {
    // console.log(event, props, triggerEvent, data);
    // console.log(this.state.selection);
    if (
      !this.state.selection.start ||
      !this.state.selection.end ||
      !this.state.selection.length ||
      this.state.selection.length === 0
    ) {
      this.state.translations.push({
        direction: 1,
        end: this.state.seq.length,
        start: 0,
      });
    } else {
      const { start, end, clockwise } = this.state.selection;
      this.state.translations.push({
        direction: -1,
        end: clockwise ? end : start,
        start: clockwise ? start : end,
      });
    }
    this.setState({
      translations: this.state.translations,
    });
  };

  displayContextMenu(e) {
    // put whatever custom logic you need
    // you can even decide to not display the Menu
    this.showContextMenu({
      event: e,
    });
  }

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
    let customChildren = null;
    if (this.state.customChildren) {
      customChildren = ({ circularProps, linearProps, ...props }) => {
        if (this.state.viewer === "linear") {
          return (
            <div ref={this.linearRef} style={{ height: "100%", width: "100%" }}>
              <Linear {...linearProps} {...props} />
            </div>
          );
        } else if (this.state.viewer === "circular") {
          return (
            <div ref={this.circularRef} style={{ height: "100%", width: "100%" }}>
              <Circular {...circularProps} {...props} />
            </div>
          );
        } else if (this.state.viewer === "both") {
          return (
            <div style={{ display: "flex", flexDirection: "row", height: "100%", width: "100%" }}>
              <div ref={this.circularRef} style={{ height: "100%", width: "50%" }}>
                <Circular {...circularProps} {...props} />
              </div>
              <div ref={this.linearRef} style={{ height: "100%", width: "50%" }}>
                <Linear {...linearProps} {...props} />
              </div>
            </div>
          );
        } else if (this.state.viewer === "both_flip") {
          return (
            <div style={{ display: "flex", flexDirection: "row", height: "100%", width: "100%" }}>
              <div ref={this.linearRef} style={{ height: "100%", width: "50%" }}>
                <Linear {...linearProps} {...props} />
              </div>
              <div ref={this.circularRef} style={{ height: "100%", width: "50%" }}>
                <Circular {...circularProps} {...props} />
              </div>
            </div>
          );
        } else {
          return (
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              <div ref={this.linearRef} style={{ height: "25%", width: "100%" }}>
                <Linear {...linearProps} {...props} />
              </div>
              <div ref={this.circularRef} style={{ height: "75%", width: "100%" }}>
                <Circular {...circularProps} {...props} />
              </div>
            </div>
          );
        }
      };
    }

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
            <Menu.Item as="a" className="options-checkbox">
              <CheckboxInput
                label="Custom Children"
                name="customChildren"
                set={customChildren => this.setState({ customChildren })}
              />
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
                    key={`${this.state.viewer}${this.state.customChildren}`}
                    annotations={this.state.annotations}
                    enzymes={this.state.enzymes}
                    highlights={[{ start: 0, end: 10 }]}
                    name={this.state.name}
                    onClick={(element, circular, linear, container) => {
                      // console.log({ element, circular, linear, container });
                    }}
                    onContextMenu={(element, circular, linear, event) => {
                      // console.log({ element, circular, linear, event });
                      this.displayContextMenu(event);
                    }}
                    onDoubleClick={(element, circular, linear, container) => {
                      // console.log({ element, circular, linear, container });
                    }}
                    onHover={(element, hover, view, container) => {
                      // console.log({ element, hover, view, container });
                      if (element.type === SEQVIZ_ELEMENTS_TYPES.base) {
                        if (hover) {
                          this.setState({ hoveredBase: element.start + element.index + 1 });
                        } else {
                          this.setState({ hoveredBase: 0 });
                        }
                      } else if (element.type == SEQVIZ_ELEMENTS_TYPES.annotation) {
                        if (hover) {
                          if ((container as any)._tippy) {
                            (container as any)._tippy?.show();
                          } else {
                            // you can pass some details with annotations to display in tippy
                            tippy(container, {
                              content: `
                                <div>
                                  <div>
                                    <strong>Name</strong>: <span>${element.name}</span>
                                  </div>
                                  <div>
                                    <strong>position</strong>: <span>[${element.start}-${element.end}]</span>
                                  </div>
                                  <div>
                                    <strong>Length</strong>: <span>${element.end - element.start + 1}</span>
                                  </div>
                                </div>
                              `,
                              allowHTML: true,
                            }).show();
                          }
                        } else {
                          (container as any)._tippy?.hide();
                        }
                      }
                    }}
                    onSelection={selection => this.setState({ selection })}
                    // onKeyPress={(e, selection) => console.log(e, selection)}
                    refs={{ circular: this.circularRef, linear: this.linearRef }}
                    search={this.state.search}
                    selection={this.state.selection}
                    seq={this.state.seq}
                    showComplement={this.state.showComplement}
                    showIndex={this.state.showIndex}
                    translations={this.state.translations}
                    viewer={this.state.viewer as "linear" | "circular"}
                    zoom={{ linear: this.state.zoom }}
                  >
                    {customChildren}
                  </SeqViz>
                )}
              </div>
              <footer>
                <div>Over base {this.state.hoveredBase > 0 ? this.state.hoveredBase : "-"}</div>
              </footer>
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
        <ContextMenu id={CONTEXT_MENU_ID}>
          <Item onClick={this.handleContextMenuAddForwardTranslation}>Add forward translations</Item>
          <Item onClick={this.handleContextMenuAddReverseTranslation}>Add reverse translations</Item>
        </ContextMenu>
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
