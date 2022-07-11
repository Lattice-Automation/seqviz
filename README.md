<div align="center">
  <img height="110" src="https://imgur.com/rkJ1irF.png">
</div>

&nbsp;

<div align="center">
  <img src="./demo/seqviz-gif-v2.gif">
</div>

&nbsp;

## SeqViz

`SeqViz` is a sequence viewer. It supports multiple input formats, display settings, and callbacks for integration into any JavaScript app.

- [Features](#features)
- [Usage](#usage)
  - [Installation](#installation)
  - [Instantiation](#instantiation)
  - [Props](#props)
  - [Viewer without React](#viewer-without-react)
- [Demo](#demo)
- [Contact Us](#contact-us)

### Features

#### Multiple input formats

- Raw sequence and annotations
- File (FASTA, GenBank, SBOL, SnapGene)
- Accession (NCBI or iGEM)

#### Linear and/or Circular sequence viewer

- Display as a linear viewer, circular viewer, or both
- Annotations with names and colors
- Amino acid translations
- Enzyme cut sites
- Sequence basepair indexing
- Sequence searching and highlighting

#### Sequence and element selection

- Selecting a sequence range -- or clicking an `annotation`, `translation`, `enzyme` or `searchElement` -- will highlight that section of the viewer(s) and pass the selection to the `onSelection()` callback

## Usage

### Installation

#### npm

```bash
npm install seqviz
```

#### CDN

<!-- cdn-example(cmd:) -->
```html
<script src="https://unpkg.com/seqviz"></script>
```
<!-- /cdn-example -->

### Instantiation

#### React

```jsx
import { SeqViz } from "seqviz";

export default () => (
  <SeqViz
    name="J23100"
    seq="TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC"
    annotations={[{ name: "promoter", start: 0, end: 34, direction: 1, color: "blue" }]}
  />
);
```

#### Non-React

More details are in the [Viewer without React](#viewer-without-react) section.

```html
<script>
  window.seqviz
    .Viewer("root", {
      name: "L09136",
      seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca",
      style: { height: "100vh", width: "100vw" },
    })
    .render();
</script>
```

### Props

All the following are usable as props for the React component (`seqviz.SeqViz`) or as options for the plain JS implementation (`seqviz.Viewer()`).

#### Required (one of)

#### `seq (='')`

The DNA sequence to render.

#### `accession (='')`

An NCBI accession ID or iGEM part ID. Populates `name`, `seq`, and `annotations`.

#### `file (=null)`

A [File](https://developer.mozilla.org/en-US/docs/Web/API/File), [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), or body (string/utf8) from a FASTA, Genbank, SnapGene, or SBOL file. Populates `name`, `seq`, and `annotations`.

#### Optional

#### `viewer (='both')`

One of `"linear" | "circular" | "both" | "both_flip"`. The type and orientation of the sequence viewers. `both` means the circular viewer fills the left side of SeqViz and the linear viewer fills the right. `both_flip` is the opposite: the linear viewer is on the left and the circular viewer is on the right.

#### `name (='')`

The name of the sequence/plasmid.

#### `compSeq (='')`

The complement sequence. Inferred from `seq` by default.

#### `showComplement (=true)`

Whether to show the complement sequence.

#### `showIndex (=true)`

Whether to show the index line and ticks below the sequence.

#### `annotations (=[])`

An array of `annotation` objects for the viewer. Each `annotation` requires 0-based start (inclusive) and end
(exclusive) indexes. For forward arrows, set the annotation's direction to `1` and `-1` for reverse arrows. A direction
of `0` or no direction produces annotations without arrows. Names (optional) are rendered on top the annotation.

```js
[
  { start: 0, end: 22, name: "Strong promoter", direction: 1 }, // [0, 22)
  { start: 23, end: 273, name: "GFP" },
  { start: 300, end: 325, name: "Weak promoter", direction: -1, color: "#FAA887" },
];
```

In the example above, the "Strong promoter" would span the first to twenty-second basepair.

#### `translations (=[])`

An array of `translation` objects for rendering ranges of amino acids beneath the DNA sequence. Like `annotation`'s,
`translation` objects requires 0-based start (inclusive) and end (exclusive) indexes relative the DNA sequence. A
direction is required: 1 (FWD) or -1 (REV).

```js
[
  { start: 0, end: 90, direction: 1 }, // [0, 90)
  { start: 191, end: 522, direction: -1 },
];
```

#### `enzymes (=[])`

An array of restriction enzyme names whose recognition sites should be shown. Example: `["PstI", "EcoRI"]`. This is
case-insensitive. The list of supported enzymes is in [src/utils/enzymes.js](src/utils/enzymes.js).

#### `enzymesCustom (={})`

Unsupported enzymes can also be passed through an object where the keys are the enzymes' names and the values are the
enzymes. Additionally, if a highlightColor is passed the recognition site will be highlighted with the appropriate color.

```js
{
  Cas9: {
    rseq: "NGG", // recognition sequence
    fcut: 0, // cut index on FWD strand, relative to start of rseq
    rcut: 1, // cut index on REV strand, relative to start of rseq
    highlightColor: "#D7E5F0" // highlight recognition site with color
  }
}
```

#### `zoom (={ linear: 50, circular: 0 })`

How zoomed the viewer(s) should be `0-100`. Keyed by viewer type (`viewer`).

#### `colors (=[])`

An array of colors to use for annotations, translations, and highlights. Defaults to:

```js
[
  "#9DEAED", // cyan
  "#8FDE8C", // green
  "#CFF283", // light green
  "#8CDEBD", // teal
  "#F0A3CE", // pink
  "#F7C672", // orange
  "#F07F7F", // red
  "#FAA887", // red-orange
  "#F099F7", // magenta
  "#C59CFF", // purple
  "#6B81FF", // blue
  "#85A6FF", // light blue
];
```

#### `bpColors (={})`

An object that maps basepairs to their color. The key/bp is either a nucleotide type or 0-based index. Example:

```js
{ "A": "#FF0000", "T": "blue", 12: "#00FFFF" }
```

#### `style (={})`

Style for `seqviz`'s outer container div. Empty by default. Useful for setting the height and width of the viewer if the element around `seqviz` lacks a defined height and/or width. For example:

```js
style: { height: "100vh", width: "100vw" }
```

#### `onSelection (=null)`

Callback function executed after selection events. Should accept a single `selection` argument: `(selection) => {}`.

This occurs after drag/drop selection and clicks. If an `annotation`, `translation`, `enzyme` or `searchElement` was
clicked, the `selection` object will have info on the selected element. The example below is of a `selection` object
following an `annotation` click.

```js
{
  // selection
  "name": "lacZ fragment",
  "type": "ANNOTATION",
  "seq": "ctatgcggcatcagagcagattgtactgagagtgcaccatatgcggtgtgaaataccgcacagatgcgtaaggagaaaataccgcatcaggcgccattcgccattcaggctgcgcaactgttgggaagggcgatcggtgcgggcctcttcgctattacgccagctggcgaaagggggatgtgctgcaaggcgattaagttgggtaacgccagggttttcccagtcacgacgttgtaaaacgacggccagtgccaagcttgcatgcctgcaggtcgactctagaggatccccgggtaccgagctcgaattcgtaatcatggtcat",
  "gc": 55.3,
  "tm": 85,
  "start": 133,
  "end": 457,
  "length": 324,
  "direction": -1
  "clockwise": true,
  "color": "#8FDE8C",
}
```

#### `search (=null)`

A `search` object for specifying search results to highlight on the viewer. An example is below:

```js
{ "query": "aatggtctc", "mismatch": 1 }
```

Searching supports the following nucleotide wildcards within the `query`.

```js
{
  "y": ["c", "t"],
  "r": ["a", "g"],
  "w": ["a", "t"],
  "s": ["c", "g"],
  "k": ["g", "t"],
  "m": ["a", "c"],
  "d": ["a", "g", "t"],
  "v": ["a", "c", "g"],
  "h": ["a", "c", "t"],
  "b": ["c", "g", "t"],
  "x": ["a", "c", "g", "t"],
  "n": ["a", "c", "g", "t"]
}
```

`mismatch` is an `int` denoting the maximum allowable mismatch between the query and a match within the viewer's
sequence (see: [Hamming distance](https://en.wikipedia.org/wiki/Hamming_distance)).

#### `onSearch (=null)`

Callback executed after a search event with a `searchResults` object. Called once on initial render. An example of `searchResults` is below:

```js
[
  {
    start: 728,
    end: 733,
    direction: 1,
    index: 0,
  },
  {
    start: 1788,
    end: 1793,
    direction: -1,
    index: 1,
  },
];
```

#### `copyEvent (=(KeyboardEvent) => false)`

A functions that returns whether to copy the selected range on the viewer(s) to the [user's clipboard](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard).

An example of an `copyEvent` function for copying after `ctrl+c` or `meta+c` events:

```js
copyEvent: event => event.key === "c" && (event.metaKey || event.ctrlKey);
```

#### `rotateOnScroll (=true)`

By default, the circular viewer rotates when scrolling over the viewer. That can be disabled with `rotateOnScroll: false`.

#### `backbone (='')`

This is a feature specific to [BioBricks](https://parts.igem.org/Plasmid_backbones/Assembly) (`accession`). The library currently supports `BBa_K1362091`, `BBa_K823055`, `pSB1A3`, `pSB1A7`, `pSB1AC3`, `pSB1AK3`, `pSB1AT3`, `pSB1C3`, `pSB1K3`, and `pSB1T3`.

Custom backbones, as DNA strings, are also supported (for example: `ATGATATAGAT`).

#### `highlightedRegions (=null)`

Passing in a list of ranges will highlight those regions on top of the sequence. A default color from `colors` is used if none is provided.

```js
highlightedRegions: [
  { start: 36, end: 66, color: "magenta" },
  { start: 70, end: 80 },
];
```

### Viewer without React

For usability in non-React apps, we provide a thin wrapper around the React component. The viewer's constructor accepts two arguments:

- `element`: either a string id attribute like `"root"` or `"app-root"` or an element; e.g. from `document.getElementById()`
- `props`: props as documented [above](#optionsprops)

```js
var viewer = seqviz.Viewer(element, props);
// Render the viewer to the DOM at the node passed in `${element}`.
viewer.render();
// Update the viewer's configuration and re-renders.
viewer.setState(props);
// Render the viewer and returns it as an HTML string.
viewer.renderToString();
```

## Demo

You can see a demonstration with iGEM BioBricks at: [tools.latticeautomation.com/seqviz](https://tools.latticeautomation.com/seqviz).

For developers, the demo source code is at [seqviz/demo](https://github.com/Lattice-Automation/seqviz/tree/master/demo/README.md).

You can also check out an example of using SeqViz to view NCBI GenBank entries in our [Medium post](https://medium.com/lattice-automation/visualize-your-dna-sequences-with-seqviz-b1d945eb9684).

## Contact Us

This library is maintained by <!-- pkg-author(cmd:) -->[Lattice Automation](https://latticeautomation.com/)<!-- /pkg-author -->.

You can report bugs and request features at <!-- pkg-bug-url(cmd:) -->[Issues](https://github.com/Lattice-Automation/seqviz/issues)<!-- /pkg-bug-url -->, or contact us directly at <!-- pkg-bug-email(cmd:) -->[contact@latticeautomation.com](contact@latticeautomation.com)<!-- /pkg-bug-email -->
