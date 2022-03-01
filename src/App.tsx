/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */
import * as React from "react";
import SeqViz from "./SeqViz/SeqViz";

export const App = () => {
  /* useEffect(() => {
   *   setTimeout(() => {
   *     viewer.setState({
   *       // zoom: { circular: 50 },
   *       enzymesCustom: {
   *         TestEnzyme: {
   *           rseq: "GGT", // recognition sequence
   *           fcut: 0, // cut index on FWD strand, relative to start of rseq
   *           rcut: 1, // cut index on REV strand, relative to start of rseq
   *         },
   *       },
   *     });
   *   }, 2000);
   * }, []); */
  let viewerInput = {
    // name: "L09136",
    // seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca",
    seq: "TTATGAATTCGTATGCGTTGTCCTTGGAGTATTAATATTGTTCATGTGGGCAGGCTCAGGTTGAGGTTGAGGTTGAGGGAACTGCTGTTCCTGT",
    // enzymesCustom: {
    //   Cas9: {
    //     rseq: "NGG", // recognition sequence
    //     fcut: 0, // cut index on FWD strand, relative to start of rseq
    //     rcut: 1, // cut index on REV strand, relative to start of rseq
    //   }
    // },

    // seq: "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTFSYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK",
    viewer: "both" as const,
    annotations: [
      { id: "sample annotation", color: "green", type: "unknown", direction: 0, start: 8, end: 9, name: "test" },
    ],
    // accession: "NC_011521",
    // backbone: "pSB1C3",
    showAnnotations: true,
    showPrimers: true,
    showComplement: true,
    showIndex: true,
    zoom: { linear: 50, circular: 0 },
    colors: ["#8CDEBD"],
    onSelection: console.log,
    onSearch: results => {
      console.log("Your Search Results: ", results);
    },
    bpColors: {
      10: "green",
      200: "blue",
      201: "red",
    },
    search: { query: "gtacc", mismatch: 0 },
    enzymes: ["EcoRI"],
    copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey),
    style: { height: "calc(100vh - 20px)", width: "calc(100vw)" },
  };

  return <SeqViz {...viewerInput} />;
};
