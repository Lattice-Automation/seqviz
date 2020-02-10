/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */

import { Viewer } from "./viewer";

import "./index.css";

const viewerInput = {
  // name: "L09136",
  // seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca",
  viewer: "both",
  accession: "BBa_K1598008",
  backbone: "pSB1C3",
  showAnnotations: true,
  showPrimers: true,
  showComplement: true,
  showIndex: true,
  zoom: { linear: 50 },
  colors: [],
  onSearch: results => {
    console.log("Your Search Results: ", results);
  },
  search: { query: "gtacc" },
  enzymes: ["EcoRI"],
  copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey)
  // style: { height: "calc(100vh - 20px)", width: "calc(100vw)" }
};

// let viewer = window.seqviz.Viewer("app-root", viewerInput);
let viewer = Viewer("root", viewerInput);
viewer.render();
