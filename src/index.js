/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */
import { Viewer } from "./viewer";

const viewerInput = {
  // name: "L09136",
  // seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca",
  // seq: "TTATGAATTCGTATGCGTTGTCCTTGGAGTATTAATATTGTTCATGTGGGCAGGCTCAGGTTGAGGTTGAGGTTGAGGGAACTGCTGTTCCTGT",
  // enzymesCustom: {
  //   Cas9: {
  //     rseq: "NGG", // recognition sequence
  //     fcut: 0, // cut index on FWD strand, relative to start of rseq
  //     rcut: 1, // cut index on REV strand, relative to start of rseq
  //   }
  // },

  seq: "TTATGTATGGCGTTGTCCTTGGAGTATTAATATTGTTCATGTGGGCAGGCTCAGGTTTATGTATGGCGTTGTCCTTGGAGTATTAATATTGTTCATGTGGGCAGGCTCAGGT",
  annotations: [
    {start: 50, end: 70, name: "test2 with long text inside", direction: 1},
    {start: 75, end: 95, name: "test2 with long text inside", direction: 1}
  ],
  viewer: "both",
  // accession: "NC_011521",
  // backbone: "pSB1C3",
  showAnnotations: true,
  showPrimers: true,
  showComplement: true,
  showIndex: true,
  zoom: { linear: 50 },
  colors: [],
  onSearch: results => {
    console.log("Your Search Results: ", results);
  },
  bpColors: {
    10: "green",
    200: "blue",
    201: "red"
  },
  search: { query: "gtacc" },
  enzymes: ["EcoRI"],
  copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey),
  style: { height: "calc(100vh - 20px)", width: "calc(100vw)" },
  // rotateOnScroll: false
};

// let viewer = window.seqviz.Viewer("app-root", viewerInput);
let viewer = Viewer("root", viewerInput);
viewer.render();

// setTimeout(() => {
//   viewer.setState({
//     annotations: [{start: 1, end: 7, color: "red", name: "test"}]
//   })
// }, 1250)
