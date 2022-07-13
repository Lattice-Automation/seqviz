/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */
import * as React from "react";

import { SeqVizProps } from "../SeqViz/SeqViz";
import { Ranged } from "../elements";
import { SeqViz } from "../viewer";

export const App = () => {
  const [search, setSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Ranged[]>([]);

  const [seqvizProps, setSeqVizProps] = React.useState<SeqVizProps>({
    annotations: [
      { color: "green", direction: 1, end: 19, name: "test", start: 8 },
      { direction: 1, end: 19, name: "test", start: 8 },
    ],
    backbone: "pSB1C3",
    bpColors: {},
    colors: ["#8CDEBD"],
    copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey),
    enzymes: [],
    enzymesCustom: {
      bottomStrand: {
        // recognition sequence
        fcut: 0,
        // cut index on REV strand, relative to start of rseq - pass in negative offset
        highlightColor: "#D7E5F0",

        // cut index on FWD strand, relative to start of rseq
        rcut: 1,

        rseq: "GTAC" /* pass in color */,
      },
      topStrand: {
        // recognition sequence
        fcut: 0,
        // cut index on FWD strand, relative to start of rseq
        rcut: 1,
        rseq: "CCTTGG", // cut index on REV strand, relative to start of rseq - pass in negative offset
        // highlightColor: "red" /* pass in color */,
      },
    },
    onSearch: (results: Ranged[]) => {
      setSearchResults(results);
    },
    rotateOnScroll: true,
    /* bpColors: {
     *   10: "green",
     *   11: "green",
     *   12: "green",
     *   200: "blue",
     *   201: "red",
     * }, */
    search: { mismatch: 0, query: "gtacc" },

    seq: "TTATGAATTCGTATGCGTTGTCCTTGGAGTATTACTGCTATATTGTTCAGCAGATGTGGGCAGGCTCAGACCAGAGATAGAGG".repeat(30),

    showAnnotations: true,

    showComplement: true,

    showIndex: true,

    showPrimers: true,

    style: { height: "calc(100vh - 20px)", width: "calc(100vw)" },

    translations: [{ direction: 1, end: 10, start: 0 }],

    viewer: "both_flip",
    zoom: { circular: 0, linear: 80 },
    // highlightedRegions: [
    //   { start: 36, end: 66, color: "magenta" },
    //   { start: 70, end: 80 },
    // ],
  });
  const submitIndices = (start: number, end: number, color: string) => {
    const oldHighlightedRegions = seqvizProps.highlightedRegions ? seqvizProps.highlightedRegions : [];
    const newHighlightedRegions = [...oldHighlightedRegions, { color, end, start }];
    setSeqVizProps({ ...seqvizProps, highlightedRegions: newHighlightedRegions });
  };
  return (
    <>
      <HighlightBox submitIndices={submitIndices} />
      <SearchBox
        highlightSearch={() => {
          const newBPColors = { ...seqvizProps.bpColors };
          searchResults.forEach((res: Ranged) => {
            for (let i = res.start; i < res.end; i++) {
              newBPColors[i] = "orange";
            }
          });
          setSeqVizProps({ ...seqvizProps, bpColors: newBPColors });
        }}
        search={search}
        onSearch={(search: string) => {
          setSearch(search);
          setSeqVizProps({ ...seqvizProps, search: { mismatch: 0, query: search } });
        }}
      />

      <SeqViz {...seqvizProps} />
    </>
  );
};

const HighlightBox = (props: { submitIndices: (start: number, end: number, color: string) => void }) => {
  const [start, setStart] = React.useState<number>(0);
  const [end, setEnd] = React.useState<number>(0);
  const [color, setColor] = React.useState("#ff6347");

  const onClick = () => {
    if (start >= 0 && end >= start) {
      props.submitIndices(start, end, color);
    }
    if (start) {
      setStart(0);
    }
    if (end) {
      setEnd(0);
    }
  };
  return (
    <div>
      <input type="number" value={start} onChange={e => setStart(parseInt(e.target.value))} />
      <input type="number" value={end} onChange={e => setEnd(parseInt(e.target.value))} />
      <select value={color} onChange={e => setColor(e.target.value)}>
        <option value="#ff6347">Red</option>
        <option value="#3cb371">Green</option>
        <option value="#87ceeb">Blue</option>
      </select>
      <input type="button" value={"Highlight Range"} onClick={onClick} />
    </div>
  );
};

const SearchBox = (props: { highlightSearch: () => void; onSearch: (search: string) => void; search: string }) => {
  return (
    <div>
      <input type="text" value={props.search} onChange={e => props.onSearch(e.target.value)} />
      <input type="button" value={"Highlight all searches"} onClick={props.highlightSearch} />
    </div>
  );
};
