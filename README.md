<div align="center">
  <img height="110" src="https://imgur.com/rkJ1irF.png">
</div>

&nbsp;

<div align="center">
  <img src="./demo/seqviz-gif-v2.gif">
</div>

&nbsp;

[![GitHub](https://img.shields.io/github/license/Lattice-Automation/seqviz)](https://github.com/Lattice-Automation/seqviz/blob/master/LICENSE)

<!-- pkg-description(cmd:) -->A DNA sequence viewer. Supports custom, GenBank, FASTA, or NCBI accession input<!-- /pkg-description -->

---

- [Features](#features)
- [Usage](#usage)
  - [Installation](#installation)
  - [Instantiation](#instantiation)
  - [Viewer](#viewer)
  - [Options](#optionsprops)
- [Demo](#demo)
- [Contact Us](#contact-us)

---

## Features

`SeqViz` is a customizable DNA sequence viewer. It currently provides:

- **Multiple input formats**

  - Sequence
  - File (FASTA, GenBank, SBOL, SnapGene)
  - Accession (NCBI or iGEM)

- **Circular plasmid viewer**

  - Annotations with names and colors
  - Index of sequence
  - Name of plasmid
  - Base pair length of sequence

- **Linear sequence viewer**

  - Annotations with names and colors
  - Amino acid translations
  - Sequence and complement nucleotide bases
  - Index of sequence
  - Enzyme cut sites
  - Highlighted sequence search results

- **Selections**

  - Clicking on an `annotation`, `translation`, `enzyme` or `searchElement`, or dragging over the sequence, will create a selection
  - Information about selections is available via `options.onSelection()` (see [viewer options](#optionsprops))

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

#### Vanilla-JS

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

### Viewer

The viewer's constructor (Vanilla-JS) accepts two arguments.

#### `var viewer = seqviz.Viewer(element, options)`

- `element` -- either a string id attribute like `"root"` or `"app-root"` or an element; e.g. from `document.getElementById()`
- `options` -- options as documented in greater detail [below](#optionsprops)

#### `viewer.render()`

Renders the viewer to the DOM at the node passed in `${element}`.

#### `viewer.renderToString()`

Renders the viewer and returns as an HTML string.

#### `viewer.setState(options)`

Update the viewer's configuration and re-renders.

### Options/Props

All the following are usable as props via the React component (`seqviz.SeqViz`) or as properties of an `options` object via the JS implementation (`seqviz.Viewer()`).

#### Required (one of)

#### `options.seq (='')`

The DNA sequence to render.

#### `options.accession (='')`

An NCBI accession ID or iGEM part ID. Populates `options.name`, `options.seq`, and `options.annotations`.

#### `options.file (=null)`

A [File](https://developer.mozilla.org/en-US/docs/Web/API/File), [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), or body (string/utf8) from a FASTA, Genbank, SnapGene, or SBOL file. Populates `options.name`, `options.seq`, and `options.annotations`.

#### Optional

#### `options.viewer (='both')`

One of _\["linear", "circular", "both", "both_flip"\]_) the type of viewer to show. "both" by default. "both" means the circular viewer fills the left side of SeqViz and the linear viewer fills the right. "both_flip" is the opposite: the linear viewer is on the left and the circular viewer is on the right.

#### `options.name (='')`

The name of the sequence/plasmid.

#### `options.compSeq (='')`

The complement sequence. Inferred from `seq` by default.

#### `options.showComplement (=true)`

Whether to show the complement sequence.

#### `options.showIndex (=true)`

Whether to show the index line and ticks below the sequence.

#### `options.annotations (=[])`

An array of `annotation` objects for the viewer. Each `annotation` object requires 0-based start (inclusive) and end (exclusive) indexes. For forward arrows, set the annotation's direction to `1` and `-1` for reverse arrows. A direction of `0` or no direction produces annotations without arrows. Names (optional) are rendered on top the annotation.

```js
[
  { start: 0, end: 22, name: "Strong promoter", direction: 1 }, // [0, 22)
  { start: 23, end: 273, name: "GFP" },
  { start: 300, end: 325, name: "Weak promoter", direction: -1, color: "#FAA887" },
];
```

In the example above, the "Strong promoter" would span the first to twenty-second basepair.

#### `options.translations (=[])`

An array of `translation` objects for rendering ranges of amino acids beneath the DNA sequence. Like `annotation`'s, `translation` objects requires 0-based start (inclusive) and end (exclusive) indexes relative the DNA sequence. A direction is required (1 (FWD) or -1 (REV)).

```js
[
  { start: 0, end: 90, direction: 1 }, // [0, 90)
  { start: 191, end: 522, direction: -1 },
];
```

#### `options.enzymes (=[])`

An array of restriction enzyme names whose recognition sites should be shown. Example: `["PstI", "EcoRI"]`. This is case-insensitive. The list of supported enzymes is in [src/utils/enzymes.js](src/utils/enzymes.js).

#### `options.enzymesCustom (={})`

Unsupported enzymes can also be passed through an object where the keys are the enzymes' names and the values are the enzymes:

```js
{
  Cas9: {
    rseq: "NGG", // recognition sequence
    fcut: 0, // cut index on FWD strand, relative to start of rseq
    rcut: 1 // cut index on REV strand, relative to start of rseq
  }
}
```

#### `options.zoom (={ linear: 50, circular: 0 })`

How zoomed the viewer(s) should be `0-100`. Keyed by viewer type (`options.viewer`).

#### `options.bpColors (={})`

An object mapping bp to color where bp is a nucleotide or 0-based index. Example:

```js
{ "A": "#FF0000", "T": "blue", 12: "#00FFFF" }
```

#### `options.colors (=[])`

An array of color hex codes for annotation coloring. Defaults to:

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

#### `options.style (={})`

Style for `seqviz`'s outer container div. Empty by default. Useful for setting the height and width of the viewer if the element around `seqviz` lacks a defined height and/or width. For example:

```js
{ height: "100vh", width: "100vw" }
```

#### `options.onSelection (=null)`

Callback function executed after selection events. Should accept a single `selection` argument: `(selection) => {}`.

This occurs after drag/drop selection and clicks. If an `annotation`, `translation`, `enzyme` or `searchElement` was clicked, the `selection` object will have info on the selected element. The example below is of a `selection` object following an `annotation` click.

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

#### `options.search (=null)`

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

`mismatch` is an `int` denoting the maximum allowable mismatch between the query and a match within the viewer's sequence (see: [Hamming distance](https://en.wikipedia.org/wiki/Hamming_distance)).

#### `options.onSearch (=null)`

Callback executed after a search event. Called once on initial render. Accepts a single `searchResults` argument: `(searchResults) => {}`. An example of a `searchResults` array is below.

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

#### `options.copyEvent (=(KeyboardEvent) => false)`

A functions that returns whether to copy the selected range on the viewer(s) to the [user's clipboard](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard).

An example of an `options.copyEvent` function for copying after `ctrl+c` or `meta+c` events:

```js
event => event.key === "c" && (event.metaKey || event.ctrlKey);
```

#### `options.rotateOnScroll (=true)`

By default, the circular viewer rotates when scrolling with a mouse over the viewer. That can be disabled by setting `rotateOnScroll` to false.

#### `options.backbone (='')`

This is a feature specific to [BioBricks](https://parts.igem.org/Plasmid_backbones/Assembly) (`options.accession`). The library currently supports `BBa_K1362091`, `BBa_K823055`, `pSB1A3`, `pSB1A7`, `pSB1AC3`, `pSB1AK3`, `pSB1AT3`, `pSB1C3`, `pSB1K3`, and `pSB1T3`.

Custom backbones, as DNA strings, are also supported (for example: `ATGATATAGAT`).

## Demo

You can see a demonstration with iGEM BioBricks at: [tools.latticeautomation.com/seqviz](https://tools.latticeautomation.com/seqviz).

For developers, the demo source code is at [seqviz/demo](https://github.com/Lattice-Automation/seqviz/tree/master/demo/README.md).

You can also check out an example of using SeqViz to view NCBI GenBank entries in our [Medium post](https://medium.com/lattice-automation/visualize-your-dna-sequences-with-seqviz-b1d945eb9684).

## Contact Us

This library is currently being maintained by <!-- pkg-author(cmd:) -->[Lattice Automation](https://latticeautomation.com/)<!-- /pkg-author -->.

You can report bugs at <!-- pkg-bug-url(cmd:) -->[Issues](https://github.com/Lattice-Automation/seqviz/issues)<!-- /pkg-bug-url --> or contact us directly at <!-- pkg-bug-email(cmd:) -->[contact@latticeautomation.com](contact@latticeautomation.com)<!-- /pkg-bug-email -->
