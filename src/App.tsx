/**
 * This module is only used for developing seqviz
 * See viewer.js for the library's entrypoint
 */
import React = require("react");
import { range } from "lodash";
import { SeqVizSelection } from "./SeqViz/handlers/selection";
import { SeqVizProps } from "./SeqViz/SeqViz";
import { SearchResult } from "./utils/search";
import { SeqViz } from "./viewer";

export const App = () => {
  const [search, setSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);

  const [seqvizProps, setSeqVizProps] = React.useState<SeqVizProps>({
    translations: [],
    seq: "TTATGAATTCGTATGCGTTGTCCTTGGAGTATTAATATTGTTCATGTGGGCAGGCTCAGGTTGAGGTTGAGGTTGAGGGAACTGCTGTTCCTGT",
    enzymesCustom: {
      Cas9: {
        rseq: "NGG", // recognition sequence
        fcut: 0, // cut index on FWD strand, relative to start of rseq
        rcut: 1, // cut index on REV strand, relative to start of rseq
      },
    },
    enzymes: ["Cas9"],
    rotateOnScroll: true,
    viewer: "both" as const,
    annotations: [
      { id: "sample annotation", color: "green", type: "unknown", direction: 0, start: 8, end: 9, name: "test" },
    ],
    backbone: "pSB1C3",
    showAnnotations: true,
    showPrimers: true,
    showComplement: true,
    showIndex: true,
    zoom: { linear: 50, circular: 0 },
    colors: ["#8CDEBD"],
    onSelection: (selection: SeqVizSelection) => {
      console.log("SELECTION", selection);
      seqvizProps.bpColors[selection.start] = "green";
    },
    onSearch: (results: SearchResult[]) => {
      setSearchResults(results);
    },
    bpColors: {
      10: "green",
      11: "green",
      12: "green",
      200: "blue",
      201: "red",
    },
    search: { query: "gtacc", mismatch: 0 },
    copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey),
    style: { height: "calc(100vh - 20px)", width: "calc(100vw)" },
  });

  return (
    <>
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

const SearchBox = (props: { search: string; onSearch: (search: string) => void; highlightSearch: () => void }) => {
  return (
    <div>
      <input type="text" value={props.search} onChange={e => props.onSearch(e.target.value)} />
      <input type="button" value={"Highlight all searches"} onClick={props.highlightSearch} />
    </div>
  );
};
