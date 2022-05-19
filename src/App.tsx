import { range } from "lodash";
import { useState } from "react";

import { SeqVizProps } from "./SeqViz/SeqViz";
import { SeqVizSelection } from "./SeqViz/handlers/selection";
import { SearchResult } from "./utils/search";
import { SeqViz } from "./viewer";

/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */
import React = require("react");

export const App = () => {
  const [search, setSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);

  const [seqvizProps, setSeqVizProps] = React.useState<SeqVizProps>({
    translations: [],
    seq: "TTATGAATTCGTATGCGTTGTCCTTGGAGTATTAATATTGTTCATGTGGGCAGGCTCAGGTTGAGGTTGAGGTTGAGGGAACTGCTGTTCCTGT".repeat(4),
    enzymesCustom: {
      topStrand: {
        rseq: "CCTTGG", // recognition sequence
        fcut: 0, // cut index on FWD strand, relative to start of rseq
        rcut: 1, // cut index on REV strand, relative to start of rseq - pass in negative offset
        highlightColor: "#E78587" /* pass in color */,
      },
      bottomStrand: {
        rseq: "AGCAG", // recognition sequence
        fcut: 0, // cut index on FWD strand, relative to start of rseq
        rcut: 1, // cut index on REV strand, relative to start of rseq - pass in negative offset
        highlightColor: "#D7E5F0" /* pass in color */,
      },
    },
    enzymes: ["topStrand", "bottomStrand"],
    rotateOnScroll: true,
    viewer: "both" as const,
    annotations: [
      { id: "sample annotation", color: "green", type: "enzyme", direction: 1, start: 8, end: 19, name: "test" },
    ],
    backbone: "pSB1C3",
    showAnnotations: true,
    showPrimers: true,
    showComplement: true,
    showIndex: true,
    zoom: { linear: 50, circular: 0 },
    colors: ["#8CDEBD"],
    onSelection: (selection: SeqVizSelection) => {
      console.error("HERE");
      seqvizProps.bpColors[selection.start] = "green";
    },
    onSearch: (results: SearchResult[]) => {
      setSearchResults(results);
    },
    bpColors: {},
    /* bpColors: {
     *   10: "green",
     *   11: "green",
     *   12: "green",
     *   200: "blue",
     *   201: "red",
     * }, */
    search: { query: "gtacc", mismatch: 0 },
    copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey),
    style: { height: "calc(100vh - 20px)", width: "calc(100vw)" },
    highlightedRegions: [
      { start: 36, end: 66, color: "magenta" },
      { start: 70, end: 80 },
    ],
  });
  const submitIndices = (start: number, end: number, color: string) => {
    const oldHighlightedRegions = seqvizProps.highlightedRegions ? seqvizProps.highlightedRegions : [];
    const newHighlightedRegions = [...oldHighlightedRegions, { start, end, color }];
    setSeqVizProps({ ...seqvizProps, highlightedRegions: newHighlightedRegions });
  };
  return (
    <>
      <HighlightBox submitIndices={submitIndices} />
      <SearchBox
        search={search}
        highlightSearch={() => {
          const newBPColors = { ...seqvizProps.bpColors };
          searchResults.forEach((res: SearchResult) => {
            range(res.start, res.end).map((bpIdx: number) => (newBPColors[bpIdx] = "orange"));
          });
          setSeqVizProps({ ...seqvizProps, bpColors: newBPColors });
        }}
        onSearch={(search: string) => {
          setSearch(search);
          setSeqVizProps({ ...seqvizProps, search: { query: search, mismatch: 0 } });
        }}
      />

      <SeqViz {...seqvizProps} />
    </>
  );
};

const HighlightBox = (props: { submitIndices: (start: number, end: number, color: string) => void }) => {
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [color, setColor] = useState("#ff6347");

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

const SearchBox = (props: { search: string; onSearch: (search: string) => void; highlightSearch: () => void }) => {
  return (
    <div>
      <input type="text" value={props.search} onChange={e => props.onSearch(e.target.value)} />
      <input type="button" value={"Highlight all searches"} onClick={props.highlightSearch} />
    </div>
  );
};
