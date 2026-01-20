import * as React from "react";
import {
  Box,
  Button,
  Drawer,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SearchIcon from "@mui/icons-material/Search";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArticleIcon from "@mui/icons-material/Article";
import EditIcon from "@mui/icons-material/Edit";
import seqparse from "seqparse";

import Circular from "../../src/Circular/Circular";
import Linear from "../../src/Linear/Linear";
import SeqViz from "../../src/SeqViz";
import { chooseRandomColor } from "../../src/colors";
import { AnnotationProp, Primer, TranslationProp } from "../../src/elements";
import Header from "./Header";
import file from "./file";

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
  primers: Primer[];
  search: { query: string };
  searchResults: any;
  selection: any;
  seq: string;
  showComplement: boolean;
  showIndex: boolean;
  showSelectionMeta: boolean;
  showSidebar: boolean;
  translations: TranslationProp[];
  viewer: string;
  zoom: number;
}

export default class App extends React.Component<any, AppState> {
  state: AppState = {
    annotations: [],
    customChildren: true,
    enzymes: ["PstI", "EcoRI", "XbaI", "SpeI"],
    name: "",
    primers: [
      {
        color: chooseRandomColor(),
        direction: 1,
        end: 653,
        id: "527923581",
        name: "pLtetO-1 fw primer",
        start: 633,
      },
      {
        color: chooseRandomColor(),
        direction: -1,
        end: 706,
        id: "5279asdf582",
        name: "pLtetO-1 rev primer",
        start: 686,
      },
      {
        color: chooseRandomColor(),
        direction: 1,
        end: 535,
        id: "5279fd582",
        name: "pLtetO-1 fwd primer",
        start: 512,
      },
      {
        color: chooseRandomColor(),
        direction: -1,
        end: 535,
        id: "527923dfd582",
        name: "pLtetO-1 rev primer",
        start: 512,
      },
    ],
    search: { query: "ttnnnaat" },
    searchResults: {},
    selection: {},
    seq: "",
    showComplement: true,
    showIndex: true,
    showSelectionMeta: false,
    showSidebar: false,
    translations: [
      { color: chooseRandomColor(), direction: -1, end: 630, name: "ORF 1", start: 6 },
      { end: 1147, name: "", start: 736 },
      { end: 1885, name: "ORF 2", start: 1165 },
    ],
    viewer: "both",
    zoom: 50,
  };

  linearRef: React.RefObject<HTMLDivElement | null> = React.createRef();
  circularRef: React.RefObject<HTMLDivElement | null> = React.createRef();

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
    let customChildren: any = undefined;
    if (this.state.customChildren) {
      customChildren = ({ circularProps, linearProps, ...props }: any) => {
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
      <Box sx={{ height: "100vh", display: "flex" }}>
        <Drawer
          anchor="left"
          open={this.state.showSidebar}
          onClose={this.handleHide}
          sx={{
            width: 320,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 320,
              boxSizing: "border-box",
            },
          }}
        >
          <SidebarHeader toggleSidebar={this.toggleSidebar} />
          <List sx={{ px: 2 }}>
            <ListItem sx={{ px: 0, py: 1, mb: 0 }}>
              <ViewerTypeInput
                setType={(viewer: string) => {
                  this.setState({ viewer });
                }}
              />
            </ListItem>
            <Divider sx={{ my: 0 }} />
            
            <ListItem sx={{ px: 0, py: 1, mb: 0 }}>
              <LinearZoomInput setZoom={zoom => this.setState({ zoom })} />
            </ListItem>
            <Divider sx={{ my: 0 }} />
            
            <ListItem sx={{ px: 0, py: 1, mb: 0 }}>
              <SearchQueryInput setQuery={query => this.setState({ search: { query } })} />
            </ListItem>
            <Divider sx={{ my: 0 }} />
            
            <ListItem sx={{ px: 0, py: 1, mb: 0 }}>
              <CheckboxInput
                label="Show complement"
                name="showComplement"
                checked={this.state.showComplement}
                set={(showComplement: boolean) => this.setState({ showComplement })}
              />
            </ListItem>
            <Divider sx={{ my: 0 }} />
            
            <ListItem sx={{ px: 0, py: 1, mb: 0 }}>
              <CheckboxInput
                label="Show index"
                name="index"
                checked={this.state.showIndex}
                set={showIndex => this.setState({ showIndex })}
              />
            </ListItem>
            <Divider sx={{ my: 0 }} />
            
            <ListItem sx={{ px: 0, py: 1, mb: 0 }}>
              <CheckboxInput
                label="Custom Children"
                name="customChildren"
                checked={this.state.customChildren}
                set={customChildren => this.setState({ customChildren })}
              />
            </ListItem>
            <Divider sx={{ my: 0 }} />
            
            <ListItem sx={{ px: 0, py: 1, mb: 0 }}>
              <EnzymeInput enzymes={this.state.enzymes} toggleEnzyme={this.toggleEnzyme} />
            </ListItem>
            <Divider sx={{ my: 0 }} />
          </List>
          <SidebarFooter />
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <Header
            selection={this.state.selection}
            showSelectionMeta={this.state.showSelectionMeta}
            toggleShowSelectionMeta={this.toggleShowSelectionMeta}
            toggleSidebar={this.toggleSidebar}
          />
          <Box
            id="seqviewer"
            sx={{
              height: "calc(100% - 64px)",
              width: "100%",
              flex: 1,
            }}
          >
            {this.state.seq && (
              <SeqViz
                key={`${this.state.viewer}${this.state.customChildren}`}
                annotations={this.state.annotations}
                primers={this.state.primers}
                enzymes={this.state.enzymes}
                highlights={[{ start: 0, end: 10 }]}
                name={this.state.name}
                onSelection={selection => this.setState({ selection })}
                    refs={{ circular: this.circularRef as any, linear: this.linearRef as any }}
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
          </Box>
        </Box>
      </Box>
    );
  }
}

const ViewerTypeInput = ({ setType }: { setType: (viewType: string) => void }) => (
  <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
    <Typography variant="caption" sx={{ mr: 1, minWidth: "80px", fontSize: "0.85rem" }}>
      Topology
    </Typography>
    <Select
      defaultValue="both"
      fullWidth
      size="small"
      onChange={(e: SelectChangeEvent) => {
        setType(e.target.value);
      }}
    >
      {viewerTypeOptions.map(option => (
        <MenuItem key={option.key} value={option.value}>
          {option.text}
        </MenuItem>
      ))}
    </Select>
  </Box>
);

const LinearZoomInput = ({ setZoom }: { setZoom: (zoom: number) => void }) => (
  <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
    <Typography variant="caption" sx={{ mr: 1, minWidth: "80px", fontSize: "0.85rem" }}>
      Zoom
    </Typography>
    <Slider
      defaultValue={50}
      min={1}
      max={100}
      onChange={(_, value) => {
        setZoom(value as number);
      }}
      valueLabelDisplay="auto"
      sx={{ flex: 1 }}
    />
  </Box>
);

const SearchQueryInput = ({ setQuery }: { setQuery: (query: string) => void }) => (
  <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
    <TextField
      fullWidth
      size="small"
      placeholder="Search..."
      onChange={e => setQuery(e.target.value)}
      InputProps={{
        startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
      }}
    />
  </Box>
);

const CheckboxInput = ({
  label,
  name,
  checked,
  set,
}: {
  label: string;
  name: string;
  checked: boolean;
  set: (v: any) => void;
}) => (
  <FormControlLabel
    control={<Switch checked={checked} name={name} onChange={(_, checked) => set(checked)} />}
    label={label}
    sx={{ 
      width: "100%", 
      ml: 0,
      "& .MuiFormControlLabel-label": {
        fontSize: "0.85rem"
      }
    }}
  />
);

const EnzymeInput = ({ enzymes, toggleEnzyme }: { enzymes: string[]; toggleEnzyme: (e: string) => void }) => (
  <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
    <Typography variant="caption" sx={{ mr: 1, minWidth: "80px", fontSize: "0.85rem" }}>
      Enzymes
    </Typography>
    <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
      <Button
        fullWidth
        variant={enzymes.includes("PstI") ? "contained" : "outlined"}
        onClick={() => toggleEnzyme("PstI")}
        sx={{
          textTransform: "none",
          py: 0.75,
          fontSize: "0.85rem",
          color: enzymes.includes("PstI") ? "white" : "primary",
        }}
      >
        PstI
      </Button>
      <Button
        fullWidth
        variant={enzymes.includes("EcoRI") ? "contained" : "outlined"}
        onClick={() => toggleEnzyme("EcoRI")}
        sx={{
          textTransform: "none",
          py: 0.75,
          fontSize: "0.85rem",
          color: enzymes.includes("EcoRI") ? "white" : "primary",
        }}
      >
        EcoRI
      </Button>
      <Button
        fullWidth
        variant={enzymes.includes("XbaI") ? "contained" : "outlined"}
        onClick={() => toggleEnzyme("XbaI")}
        sx={{
          textTransform: "none",
          py: 0.75,
          fontSize: "0.85rem",
          color: enzymes.includes("XbaI") ? "white" : "primary",
        }}
      >
        XbaI
      </Button>
      <Button
        fullWidth
        variant={enzymes.includes("SpeI") ? "contained" : "outlined"}
        onClick={() => toggleEnzyme("SpeI")}
        sx={{
          textTransform: "none",
          py: 0.75,
          fontSize: "0.85rem",
          color: enzymes.includes("SpeI") ? "white" : "primary",
        }}
      >
        SpeI
      </Button>
    </Box>
  </Box>
);

const SidebarHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => (
  <Box
    sx={{
      height: "64px",
      p: 2,
      boxShadow: "0 2px 8px #f0f1f2",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <img
        src="https://tools.latticeautomation.com/seqviz/seqviz-logo.png"
        alt="SeqViz"
        style={{ height: "36px", marginRight: "16px" }}
      />
      <Typography variant="h6">Settings</Typography>
    </Box>
    <IconButton onClick={toggleSidebar}>
      <ChevronLeftIcon />
    </IconButton>
  </Box>
);

const SidebarFooter = () => (
  <Box
    sx={{
      width: "100%",
      textAlign: "center",
      position: "absolute",
      bottom: 0,
      p: 1,
    }}
  >
    <Divider sx={{ mb: 2 }} />
    <img
      src="https://tools.latticeautomation.com/seqviz/lattice-brand.png"
      alt="Lattice Automation"
      style={{ height: "64px", margin: "0 auto 8px auto" }}
    />
    <Typography variant="caption" display="block" sx={{ mb: 1 }}>
      Created by{" "}
      <a
        href="https://latticeautomation.com/"
        rel="noopener noreferrer"
        target="_blank"
        style={{ fontWeight: "bold", color: "#1976d2" }}
      >
        Lattice Automation
      </a>
    </Typography>
    <Typography variant="caption" display="block" sx={{ mb: 1 }}>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <GitHubIcon sx={{ fontSize: "0.85rem" }} />
        <a
          href="https://github.com/Lattice-Automation/seqviz"
          rel="noopener noreferrer"
          target="_blank"
          style={{ fontWeight: "bold", color: "#1976d2" }}
        >
          seqviz
        </a>
      </Box>
      {" | "}
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <ArticleIcon sx={{ fontSize: "0.85rem" }} />
        <a
          href="https://medium.com/@lattice.core/visualize-your-dna-sequences-with-seqviz-b1d945eb9684"
          rel="noopener noreferrer"
          target="_blank"
          style={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Story
        </a>
      </Box>
      {" | "}
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <EditIcon sx={{ fontSize: "0.85rem" }} />
        <a
          href="https://docs.google.com/forms/d/1ILD3UwPvdkQlM06En7Pl9VqVpN_-g5iWs-B6gjKh9b0/viewform?edit_requested=true"
          rel="noopener noreferrer"
          target="_blank"
          style={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Survey
        </a>
      </Box>
    </Typography>
    <Typography variant="caption" display="block">
      contact@latticeautomation.com
    </Typography>
  </Box>
);

