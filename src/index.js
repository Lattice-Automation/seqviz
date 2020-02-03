/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */

import { Viewer } from "./viewer";

import "./index.css";

const type = "both";

const annotations = true;
const primers = true;
const complement = true;
const index = true;

const viewerInput = {
  accession: "BBa_K1598008",
  viewer: type,
  showAnnotations: annotations,
  showPrimers: primers,
  showComplement: complement,
  showIndex: index,
  zoom: { linear: 50 },
  colors: [],
  onSearch: results => {
    console.log("Your Search Results: ", results);
  },
  search: { query: "gtacc" },
  backbone: "pSB1C3",
  enzymes: ["EcoRI"],
  copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey)
};

// const viewerInput = {
//   name: "BCDRBS_alt1_BD14",
//   seq:
//     "gcgaaaaatcaataaggaggcaacaagatgtgcgaaaaacatcttaatcatgcggtggagggtttctaatg",
//   annotations: [
//     {
//       start: 0,
//       end: 71,
//       direction: 1,
//       name: "RBS",
//       type: "RBS",
//       color: "#80D849"
//     },
//     {
//       start: 1,
//       end: 70,
//       direction: 1,
//       name: "RBS",
//       type: "RBS",
//       color: "#80D849"
//     }
//   ],
//   annotate: false,
//   searchQuery: {
//     query: "",
//     mismatch: 0
//   },
//   translations: [],
//   viewer: "linear",
//   showComplement: true,
//   bpColors: {
//     a: "#000000",
//     t: "#000000",
//     c: "#000000",
//     g: "#000000"
//   },
//   zoom: {
//     linear: 50
//   },
//   accession: "",
//   backbone: "",
//   colors: [],
//   copySeq: {
//     key: "",
//     meta: false,
//     ctrl: false,
//     shift: false,
//     alt: false
//   },
//   compSeq: "",
//   enzymes: [],
//   file: null,
//   searchNext: {
//     key: "",
//     meta: false,
//     ctrl: false,
//     shift: false,
//     alt: false
//   },
//   showAnnotations: true,
//   showIndex: true,
//   showPrimers: true
// };

let viewer = Viewer("app-root", viewerInput);
viewer.render();
