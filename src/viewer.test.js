import PUC from "./parts/pUC";
import { Viewer } from "./viewer";

const defaultOptions = {
  viewer: "both",
  showAnnotations: true,
  showPrimers: true,
  showComplement: true,
  showIndex: true,
  zoom: { linear: 50 },
  bpColors: { A: "#FFF" },
  colors: [],
  onSelection: selection => {},
  onSearch: results => {},
  searchNext: {
    key: "a",
    meta: false,
    ctrl: false,
    shift: false,
    alt: false
  },
  searchQuery: { query: "GCGG" },
  backbone: "",
  enzymes: []
};

it("renders without crashing", () => {
  const div = document.createElement("div");
  let viewer = Viewer(div, { ...defaultOptions, part: PUC });

  viewer.render();
});

it("updates props with setState", () => {
  const div = document.createElement("div");
  let viewer = Viewer(div, { ...defaultOptions, part: PUC });

  viewer.render();

  viewer.setState({ bpColors: {} });
});
