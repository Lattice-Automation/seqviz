import "babel-polyfill";
import VIEWER from "./App";
import PUC from "./DefaultParts/pUC";

/**
 * CODE TO TEST VIEWER WITH UI
 */
// import "./index.css";
// function showPart() {
//   //const bb = "BBa_E0040";
//   const part = document.getElementById("accession").value;
//   const backbone = document.getElementById("backbone").value;
//   const viewType = document.getElementById("viewer").value;

//   const annotate = document.getElementById("auto-annotate").checked;

//   const annotations = document.getElementById("annotations").checked;
//   const complement = document.getElementById("complement").checked;
//   const index = document.getElementById("index").checked;

//   const query = document.getElementById("query").value;

//   const enzymes = Array.prototype.map.call(
//     document.getElementById("enzymes").selectedOptions,
//     o => {
//       return o.value;
//     }
//   );

//   const lzoom = document.getElementById("lzoom").value;

//   const viewer = VIEWER("app-root", part, {
//     backbone: backbone,
//     viewer: viewType,
//     annotate: annotate,
//     showAnnotations: annotations,
//     showComplement: complement,
//     showIndex: index,
//     zoom: { linear: lzoom },
//     colors: [],
//     onSelection: selection => {
//       const dataDisplay = document.getElementById("select-data");
//       const { feature, selectionMeta, sequenceMeta } = selection;
//       console.log(feature);
//       dataDisplay.innerHTML = `<em><b>${
//         feature ? feature.name : ""
//       }</b></em><br/><em>${feature ? feature.type : ""}</em>  ${
//         selectionMeta.selectionLength
//       }bp (${selectionMeta.start} - ${
//         selectionMeta.end
//       }) <br/> <b>GC:</b> ${sequenceMeta.GC.toPrecision(
//         2
//       )}% <b>Tm:</b> ${sequenceMeta.Tm.toPrecision(2)}°C `;
//     },
//     onSearch: results => {
//       if (query.length) {
//         const dataDisplay = document.getElementById("search-data");
//         const { searchResults } = results;
//         dataDisplay.innerHTML = `<em>${searchResults.length} results</em>`;
//       }
//     },
//     searchNext: {
//       key: "a",
//       meta: false,
//       ctrl: false,
//       shift: false,
//       alt: false
//     },
//     searchQuery: { query: query },
//     enzymes: enzymes
//   });
//   viewer.render();
// }

// document.getElementById("submit").addEventListener("click", showPart);

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
//   searchQuery: { query: "GCGG" },
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

/**
 * Library exports
 */
export const pUC = () => {
  return PUC;
};

export const Viewer = (element = "root", ViewerOptions) => {
  const {
    part = null,
    annotate = false,
    viewer = "circular",
    showAnnotations = true,
    showComplement = true,
    showIndex = true,
    zoom = { circular: 0, linear: 50 },
    colors = [],
    onSelection = () => {
      console.log(
        "No custom selection functionality yet. Function passed as onSelection option will be applied to selected range."
      );
    },
    onSearch = () => {
      console.log(
        "No custom search functionality yet. Function passed as onSearch option will be applied to search results."
      );
    },
    searchNext = {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    searchQuery = { query: "", mismatch: 0 },
    backbone = "",
    enzymes = []
  } = ViewerOptions;
  return VIEWER(element, part, {
    annotate,
    viewer,
    showAnnotations,
    showComplement,
    showIndex,
    zoom,
    colors,
    onSelection,
    onSearch,
    searchNext,
    searchQuery,
    backbone,
    enzymes
  });
};
