/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */
import * as React from "react";

import { SeqVizProps } from "../SeqViz/SeqViz";
import { SeqViz } from "../viewer";

export const App = () => {
  const props: SeqVizProps = {
    // accession: "BBa_J23100",
    annotations: [
      { direction: 60, end: 300, name: "test", start: 25 },
      { direction: -1, end: 70, name: "test", start: 270 },
    ],
    bpColors: {
      10: "green",
      11: "green",
      12: "green",
      16: "blue",
    },
    // colors: ["#8CDEBD"],
    copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey),
    enzymes: [
      {
        // color: "rgba(0,0,250,0.25)",
        fcut: 2,
        name: "custom",
        rcut: 5,
        rseq: "ngatagn",
      },
      // {
      //   fcut: 1,
      //   name: "custom",
      //   range: {
      //     end: 300,
      //     start: 80,
      //   },
      //   rcut: 3,
      //   rseq: "nacgn",
      // },
    ],
    name: "Development Plasmid",
    onSelection: console.log,
    rotateOnScroll: true,
    search: { mismatch: 0, query: "gtacc" },
    seq: "AGATAGAGATACACGACTAGCATCACGATCGCTAGCTACTAGCATCAGCTACTATCTTCAGCTACGACTATCGGACTACATTACGACGAT".repeat(5),
    showAnnotations: true,
    showComplement: true,
    showIndex: true,
    style: { height: "calc(100vh - 20px)", width: "calc(100vw)" },
    translations: [{ direction: 1, end: 69, start: 0 }],
    viewer: "both_flip",
    zoom: { circular: 90, linear: 50 },
  };

  const [search, setSearch] = React.useState("");
  const [start, setStart] = React.useState(0);
  const [end, setEnd] = React.useState(1);
  const [accession, setAccession] = React.useState("");

  return (
    <>
      <div>
        <input type="number" value={start} onChange={e => setStart(parseInt(e.target.value))} />
        <input type="number" value={end} onChange={e => setEnd(parseInt(e.target.value))} />
      </div>

      <div className="test-input-fields">
        <input placeholder="search" type="text" value={search} onChange={e => setSearch(e.target.value)} />
        <input placeholder="accession" type="text" value={accession} onChange={e => setAccession(e.target.value)} />
      </div>

      <SeqViz {...props} highlights={[{ end, start }]} search={{ mismatch: 0, query: search }} />
    </>
  );
};
