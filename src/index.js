/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */

import { Viewer } from "./viewer";

import "./index.css";

// const { whyDidYouUpdate } = require("why-did-you-update");
// whyDidYouUpdate(React);

// const parts = [
//   "KJ668651.1",
//   "BBa_E0040",
//   pUC,
//   "ATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAA",
//   ""
// ];
// let part = parts[Math.floor(Math.random() * parts.length)];
// const part = "KJ668651.1";
// const part = "BBa_K1598008";
const part = "BBa_E0040";

// const types = ["circular", "linear", "both"];
const type = "both";

const annotations = true;
const primers = true;
const complement = true;
const index = true;

const viewerInput = {
  // part: part,
  part: {
    name: "test",
    seq: "ATGAT",
    annotations: [
      {
        start: 0,
        end: 5
      }
    ]
  },
  viewer: type,
  showAnnotations: annotations,
  showPrimers: primers,
  showComplement: complement,
  showIndex: index,
  zoom: { linear: 50 },
  colors: [],
  bpColors: {
    a: "#FF0000",
    t: "#00ff00"
  },
  //   onSelection: selection => {
  //     console.log("Your Selection: ", selection);
  //   },
  onSearch: results => {
    console.log("Your Search Results: ", results);
  },
  searchNext: {
    key: "a",
    meta: false,
    ctrl: false,
    shift: false,
    alt: false
  },
  copySeq: {
    key: "c",
    meta: true,
    ctrl: false,
    shift: false,
    alt: false
  },
  // searchQuery: { query: "GCGGX" },
  backbone: "pSB1C3",
  enzymes: [],
  translations: [{ start: 0, end: 89, direction: "FORWARD" }]
};

let viewer = Viewer("app-root", viewerInput);
viewer.render();

/**
 * CODE TO TEST VIEWER WITH FILE IMPORT
 */
// import "./index.css";
// import ReactDOM from "react-dom";
// import React from "react";
// const handleFileUpload = files => {
//   const type = "both";
//   const annotations = true;
//   const primers = true;
//   const complement = true;
//   const index = true;
//   console.log(type);
//   const viewer = VIEWER("app-root", files, {
//     viewer: type,
//     showComplement: complement,
//     showIndex: index,
//     showAnnotations: annotations,
//     showPrimers: primers,
//     zoom: { circular: 0, linear: 50 },
//     colors: [],
//     onSelection: selection => {
//       console.log("Your Selection: ", selection);
//     },
//     onSearch: results => {
//       console.log("Your Search Results: ", results);
//     },
//     searchNext: {
//       key: "a",
//       meta: false,
//       ctrl: false,
//       shift: false,
//       alt: false
//     },
//     copySeq: {
//       key: "c",
//       meta: true,
//       ctrl: false,
//       shift: false,
//       alt: false
//     },
//     searchQuery: { query: "attcc", mismatch: 1 },
//     backbone: "pSB1C3",
//     enzymes: []
//   });
//   viewer.render();
// };
// ReactDOM.render(
//   <input
//     type="file"
//     id="input"
//     multiple
//     onChange={e => handleFileUpload(e.target.files)}
//   />,
//   document.getElementById("app-root")
// );
