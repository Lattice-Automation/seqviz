// @ts-nocheck
import * as fs from "fs";
import * as path from "path";

import { SeqVizProps } from "./SeqViz/SeqViz";
import PUC from "./parts/pUC";
import { Viewer } from "./viewer";

const defaultOptions: SeqVizProps = {
  annotations: [
    {
      direction: "FORWARD",
      end: 15,
      name: "test_annotation",
      start: 0, // old prop-type, still supported; now using -1, 0, 1
    },
  ],
  backbone: "",
  bpColors: { A: "#FFF" },
  colors: [],
  enzymes: [],
  onSearch: () => {},
  onSelection: () => {},
  search: { query: "GCGG" },
  showAnnotations: true,
  showComplement: true,
  showIndex: true,
  showPrimers: true,
  style: { height: 500, width: 800 },
  viewer: "both",
  zoom: { linear: 50 },
};

describe("Viewer rendering (JS)", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    const viewer = Viewer(div, { ...defaultOptions, ...PUC });

    viewer.render();
  });

  it("renders while querying an iGEM part", () => {
    const div = document.createElement("div");
    const viewer = Viewer(div, {
      ...defaultOptions,
      backbone: "pSB1C3",
      part: "BBa_K1598008",
    });

    viewer.render();
  });

  it("updates props with setState", () => {
    const div = document.createElement("div");
    const viewer = Viewer(div, { ...defaultOptions, ...PUC });

    viewer.render();

    viewer.setState({ bpColors: {} });
  });

  it("renders with just a sequence and name", () => {
    const div = document.createElement("div");
    const viewer = Viewer(div, {
      name: "seq_name",
      seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca",
    });

    viewer.render();
  });

  it("renders with zoom outside 0-100", () => {
    const div = document.createElement("div");
    const viewer = Viewer(div, {
      name: "seq_name",
      seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca",
      zoom: { circular: 150, linear: -10 },
    });

    viewer.render();
  });

  it("renders from a Genbank file", () => {
    const div = document.createElement("div");
    const gbContents = fs.readFileSync(path.join(__dirname, "io", "examples", "genbank", "pBbE0c-RFP_1.gb"), "utf8");

    const viewer = Viewer(div, { file: gbContents });

    viewer.render();
  });
});
