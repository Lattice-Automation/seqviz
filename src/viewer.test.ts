import * as fs from "fs";
import * as path from "path";

import { SeqVizProps } from "./SeqViz/SeqViz";
import { Viewer } from "./viewer";

const defaultOptions: SeqVizProps = {
  annotations: [
    {
      direction: 1,
      end: 50,
      name: "test",
      start: 0,
    },
    {
      direction: "FORWARD",
      end: 15,
      name: "test_annotation",
      start: 0,
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
  style: { height: 500, width: 800 },
  viewer: "both",
  zoom: { linear: 50 },
};

describe("Viewer rendering (JS)", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    const viewer = Viewer(div, defaultOptions);

    viewer.render();
  });

  it("renders while querying an iGEM part", () => {
    const div = document.createElement("div");
    const viewer = Viewer(div, {
      ...defaultOptions,
      accession: "BBa_K1598008",
      backbone: "pSB1C3",
    });

    viewer.render();
  });

  it("updates props with setState", () => {
    const div = document.createElement("div");
    const viewer = Viewer(div, defaultOptions);

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
