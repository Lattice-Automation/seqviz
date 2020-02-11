import fs from "fs";
import path from "path";

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
  onSelection: () => {},
  onSearch: () => {},
  search: { query: "GCGG" },
  backbone: "",
  enzymes: [],
  annotations: [
    {
      name: "test_annotation",
      start: 0,
      end: 15,
      direction: "FORWARD" // old prop-type, still supported; now using -1, 0, 1
    }
  ],
  style: { height: 500, width: 800 }
};

describe("Viewer rendering (JS)", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    let viewer = Viewer(div, { ...defaultOptions, ...PUC });

    viewer.render();
  });

  it("renders while querying an iGEM part", () => {
    const div = document.createElement("div");
    let viewer = Viewer(div, {
      ...defaultOptions,
      part: "BBa_K1598008",
      backbone: "pSB1C3"
    });

    viewer.render();
  });

  it("updates props with setState", () => {
    const div = document.createElement("div");
    let viewer = Viewer(div, { ...defaultOptions, ...PUC });

    viewer.render();

    viewer.setState({ bpColors: {} });
  });

  it("renders with just a sequence and name", () => {
    const div = document.createElement("div");
    let viewer = Viewer(div, {
      name: "seq_name",
      seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca"
    });

    viewer.render();
  });

  it("renders with zoom outside 0-100", () => {
    const div = document.createElement("div");
    let viewer = Viewer(div, {
      name: "seq_name",
      seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca",
      zoom: { linear: -10, circular: 150 }
    });

    viewer.render();
  });

  it("renders from a Genbank file", () => {
    const div = document.createElement("div");
    const gbContents = fs.readFileSync(
      path.join(__dirname, "io", "examples", "genbank", "pBbE0c-RFP_1.gb"),
      "utf8"
    );

    let viewer = Viewer(div, { file: gbContents });

    viewer.render();
  });
});
