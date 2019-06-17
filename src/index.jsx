import VIEWER from "./App";
import PUC from "./DefaultParts/pUC";

/**
 * CODE TO TEST VIEWER
 */
// import "./index.css";
// const parts = [
//   "KJ668651.1",
//   "BBa_E0040",
//   PUC,
//   "ATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAAATCGAAAAATTTTTGGGGGCCCCCAAAAAGGGGGGAAA",
//   ""
// ];
// const part = parts[Math.floor(Math.random() * parts.length)];

// const types = ["circular", "linear", "both"];

// // Store variable in localStorage for deterministically cycling through exampels
// if (
//   localStorage.getItem("iteration") &&
//   !isNaN(localStorage.getItem("iteration"))
// ) {
//   localStorage.setItem(
//     "iteration",
//     (parseInt(localStorage.getItem("iteration")) + 1).toString()
//   );
// } else {
//   localStorage.setItem("iteration", "0");
// }

// //const part = parts[localStorage.getItem("iteration") % parts.length];
// const type = types[localStorage.getItem("iteration") % types.length];

// const annotate = false;
// const annotations = true;
// const complement = true;
// const index = true;
// let viewer = VIEWER("app-root", part, {
//   annotate: annotate,
//   viewer: type,
//   showAnnotations: annotations,
//   showComplement: complement,
//   showIndex: index,
//   zoom: { linear: 50 },
//   colors: [],
//   onSelection: selection => {
//     console.log("Your Selection: ", selection);
//   },
//   onSearch: results => {
//     console.log("Your Search Results: ", results);
//   },
//   searchNext: {
//     key: "a",
//     meta: false,
//     ctrl: false,
//     shift: false,
//     alt: false
//   },
//   searchQuery: { query: "GCGGX" },
//   backbone: "pSB1C3",
//   enzymes: []
// });
// viewer.render();

/**
 * CODE TO TEST VIEWER WITH FILE IMPORT
 */
// import "./index.css";
// import ReactDOM from "react-dom";
// import React from "react";
// const handleFileUpload = files => {
//   const type = "both";
//   const annotate = false;
//   const annotations = true;
//   const complement = true;
//   const index = true;
//   console.log(type);
//   const viewer = VIEWER("app-root", files, {
//     annotate: annotate,
//     viewer: type,
//     showComplement: complement,
//     showIndex: index,
//     showAnnotations: annotations,
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
