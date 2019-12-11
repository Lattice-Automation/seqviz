<p align="center">
  <img height="120" src="https://github.com/Lattice-Automation/seqviz/blob/develop/demo/src/seqviz-brand-small.png">
</p>
&nbsp;

[![David](https://img.shields.io/david/Lattice-Automation/seqviz)](https://david-dm.org/Lattice-Automation/seqviz)
[![GitHub](https://img.shields.io/github/license/Lattice-Automation/seqviz)](https://github.com/Lattice-Automation/seqviz/blob/master/LICENSE)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/Lattice-Automation/seqviz?color=green)](https://github.com/Lattice-Automation/seqviz/blob/master/package.json)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Lattice-Automation/seqviz)](https://github.com/Lattice-Automation/seqviz/tree/develop/src)

**Latest Production Build:** <!-- exec-bash(cmd:echo `date`) -->Wed Dec 11 17:02:36 EST 2019<!-- /exec-bash -->

**Maintained by:** <!-- pkg-author(cmd:) -->[Lattice Automation](https://latticeautomation.com/)<!-- /pkg-author -->

<!-- pkg-description(cmd:) -->DNA sequence viewer supporting custom, GenBank, FASTA, NCBI accession, and iGEM part input<!-- /pkg-description -->

<br>

---

![Demo](https://media.giphy.com/media/KH8oxeI0eeu4rpAi0O/giphy.gif)

---

- [Key Features](#key-features)
- [Using the Library](#using-the-library)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Configuration](#configuration)
- [Library Demo](#library-demo)
- [Contact Us](#contact-us)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

This package aims to provide basic sequence viewing in a simple, open-source way, for use anywhere that supports running `javascript`. It currently provides:

- **Multiple input formats**: For formats that can be displayed by this viewer see viewer [input](#input-)

- **Circular Plasmid viewer** :

  - Annotations with names and colors
  - Name of sequence
  - Base pair length of sequence

- **Linear Sequence viewer** :

  - Annotations with names and colors
  - Sequence and complement nucleotide bases
  - Index line with base pair numbers
  - Enzyme cut sites
  - Highlighted subsequences from search

- **Selections**:

  - On both Circular and Linear viewers clicking on an annotation or dragging over a section of the viewer will create a selection
  - Information about this selection will be available through the `onSelection()` option (see [viewer options](#ViewerConfig-))

## Using the Library

### Installation

The library source code is in a file named <!-- pkg-file(cmd:) -->`seqviz.min.js`<!-- /pkg-file -->. You can either extract this from the [GitHub release](https://github.com/Lattice-Automation/seqviz/releases) tarball or download it from our CDN at <!-- dist-url(cmd:) -->`https://cdn.latticeautomation.com/libs/seqviz/1.0.3/seqviz.min.js`<!-- /dist-url -->.

You will want to import the library in your top level `index.html` (or whatever is the entry point of your website).

For example you can use:

`<script src="`<!-- dist-url(cmd:) -->`https://cdn.latticeautomation.com/libs/seqviz/1.0.3/seqviz.min.js`<!-- /dist-url -->`"></script>`

This method requires no actual download. You will be served the library directly from our CDN. This method, however, does require you to have internet access in order to use the library.

If you want to load the library locally and be able to view cached parts without internet connection you can download the source file to the same folder as your `index.html` and use:

```html
<script src="seqviz.min.js"></script>
```

If you are using [Create React App](https://github.com/facebook/create-react-app) and have the source code stored in your public folder you can use:

```html
<script src="%PUBLIC_URL%/seqviz.min.js"></script>
```

### Usage

You can initialize a viewer with React or vanilla-JS.

React, via the `Seqviz` component:

```jsx
const { SeqViz } = window.seqviz;

const CustomViewer = () => (
  <SeqViz
    name="J23100"
    seq="TTGACGGCTAGCTCAGTCCTAGGTACAGTGCTAGC"
    annotations={[{ name: "promoter", start: 0, end: 34 }]}
  />
);
```

JavaScript, via the `Viewer` constructor:

```html
<script>
  const seqviz = window.seqviz;
  seqviz
    .Viewer("root", {
      name: "L09136",
      seq: "tcgcgcgtttcggtgatgacggtgaaaacctctgacacatgca"
    })
    .render();
</script>
```

### Viewer

`Viewer(${element}, ${ViewerConfig})`

- `element` -- either a string id attribute like `"root"` or `"app-root"` or an element; e.g. from `document.getElementById()`
- `ViewerConfig` -- ViewerConfig are documented in greater detail below

The Viewer returns an object with three properties:

- `viewer.render()` -- renders the viewer to the DOM at the node passed in `${element}`
- `viewer.renderToString()` -- renders the viewer and returns as an HTML string
- `viewer.setState(ViewerConfig)` -- update the viewer's settings and re-renders

#### Configuration

All the following are usable with both the React implementation (as props) and the JS implementation as properties in a `ViewerConfig` object passed to the `Viewer` constructor.

One of the below is required:

- `seq` (_string_) the DNA sequence to render
- `accession` (_string_) an NCBI accession ID or iGEM part ID
  - populates `name`, `seq`, and `annotations`
- `file` ([_File_](https://developer.mozilla.org/en-US/docs/Web/API/File)) a File object (FASTA, Genbank, SnapGene, SBOL)
  - populates `name`, `seq`, and `annotations`

Simple optional configuration options:

- `viewer` (one of _\["linear", "circular", "both"\]_) the type of viewer to show. "both" by default
- `name` (_string_) the name of the sequence/plasmid
- `compSeq` (_string_) the complement sequence. inferred from `seq` by default
- `showComplement` (_boolean_) whether to show the complement sequence
- `showAnnotations` (_boolean_) whether to show annotations
- `showIndex` (_boolean_) whether to show the index line and ticks below the sequence
- `enzymes` (_\[string\]_) a list of restriction enzymes whose recognition sites should be shown
  - example: `["PstI", "EcoRI"]`
- `bpColors` (_{\[string\]: string}_) map from bp to color.
  - example: `{ A: "#FF0" T: "#00F" }`
- `zoom` how zoomed the viewer(s) should be `0-100`
  - map from viewer type to zoom level.
    - default: `{ linear: 50, circular: 0 }`

Additional configuration is below:

##### `colors`

`array` of colors to be used for annotations. Annotations are rendered with a random color from a set of defined colors. The library currently explicitly supports hex code color options, but other color options may be inherently supported.

Defaults to:

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
  "#85A6FF" // light blue
];
```

##### `onSelection`

`function` to be applied to the selection information. The function you specify will have access to the `selection` object as its only parameter.

Example for a random drag selection

```js
{
  "ref": "",
  "sequenceMeta": {
    "sequence": "aggcggtttgcgtattgggcgctcttccgcttcctcgctcactgactcgctgcgctcggtcgttcggctgcggcgagcggtatcagctcactcaaaggcggtaatacggttatccacagaatcaggggataacgcaggaaagaacatgtgagcaaaaggccagcaaaaggccaggaaccgtaaaaaggccgcgttgctggcgtttttccataggctccgcccccctgacgagcatcacaaaaatcgacgctcaagtcagaggtggcgaaacccgacaggactataaagataccaggcgtttccccctggaagctccctcgtgcgctctcctgttccgaccctgccgcttaccggatacctgtccgcctttctcccttcgggaagcgtggcgctttctcatagctcacgctgtaggtatctcagttcggtgtaggtcgttcgctccaagctgggctgtgtgcacgaaccccccgttcagcccgaccgctgcgccttatccggtaactatcgtcttgagtccaacccggtaagacacgacttatcgccactggcagcagccactggtaacaggattagcagagcgaggtatgtaggcggtgctacagagttcttgaagtggtggcctaactacggctacactagaaggacagtatttggtatctgcgctctgctgaagccagttaccttcggaaaaagagttggtagctcttgatccggcaaacaaaccaccgctggtagcggtggtttttttgtttgcaagcagcagattacgcgcagaaaaaaaggatctcaagaagatcctttgatcttttctacggggtctgacgctcagtggaacgaaaactcacgttaagggattttggtcatgagattatcaaaaaggatcttcacctagatccttttaaattaaaaatgaagttttaaatcaatctaaagtatatatgagtaaacttggtctgacagttaccaatgcttaa",
    "GC": 51.1,
    "Tm": 85
  },
  "selectionMeta": {
    "type": "",
    "start": 650,
    "end": 1627,
    "selectionLength": 977,
    "clockwise": true
  }
}
```

If the selection is an annotation (generated by clicking on an annotation) there will additionally be a `feature` field containing information about the annotation. The `ref` field is the id the `svg` element of the drawn annotation.

```js
{
  "ref": "lxcC1L3M4z",
  "sequenceMeta": {
    "sequence": "ctatgcggcatcagagcagattgtactgagagtgcaccatatgcggtgtgaaataccgcacagatgcgtaaggagaaaataccgcatcaggcgccattcgccattcaggctgcgcaactgttgggaagggcgatcggtgcgggcctcttcgctattacgccagctggcgaaagggggatgtgctgcaaggcgattaagttgggtaacgccagggttttcccagtcacgacgttgtaaaacgacggccagtgccaagcttgcatgcctgcaggtcgactctagaggatccccgggtaccgagctcgaattcgtaatcatggtcat",
    "GC": 55.3,
    "Tm": 85
  },
  "selectionMeta": {
    "type": "ANNOTATION",
    "start": 133,
    "end": 457,
    "selectionLength": 324,
    "clockwise": true
  },
  "feature": {
    "id": "lxcC1L3M4z",
    "color": "#8FDE8C",
    "name": "lacZ fragment",
    "type": "CDS",
    "start": 133,
    "end": 457,
    "direction": "REVERSE"
  }
}

```

For examples on how to practically use the selection information see [seqviz/demo](https://github.com/Lattice-Automation/seqviz/tree/master/demo/README.md).

##### `onSearch`

`function` to be applied to the search results. The function you specify will have access to the results object as its only parameter.

Example of a search result:

```js
{
  "searchResults": [
    {
      "start": 728,
      "end": 733,
      "row": 0,
      "index": 0
    },
    {
      "start": 1788,
      "end": 1793,
      "row": 0,
      "index": 1
    },
    {
      "start": 1980,
      "end": 1985,
      "row": 0,
      "index": 2
    },
    {
      "start": 2774,
      "end": 2779,
      "row": 0,
      "index": 3
    }
  ],
  "searchIndex": 0
}
```

The start and end are the indices encapsulating the substring match for the search query. The row is `0` for sequence strand and `1` for complement strand. The index is for tabulation (see [searchNext](#searchnext)).

##### `searchNext`

`object` used to set the key binding for tabulating search results (focus highlighting sequential search highlights).

This library tries to keep default key bindings to a minimum so there are no key bindings to tabulating the search results, but you can set your own by passing the key binding to `searchNext`.

Defaults to:

```js
{
    key: "",
    meta: false,
    ctrl: false,
    shift: false,
    alt: false
}
```

You can use any keyboard key that is not `ArrowLeft`, `ArrowRight`, `ArrowUp`, or `ArrowDown`. Find the key name for your key press at [keycode.info](https://keycode.info/). This library uses the `event.key` for key bindings. The key to be bound is case sensitive. If you want to make `searchNext` a special key binding e.g. `shift + a`, or `alt + .` you can specify your special key with value `true`.

##### `copySeq`

`object` used to set the key binding for copying the template strand sequence of your current selection.

This library tries to keep default key bindings to a minimum so there are no key bindings copy, but you can set your own by passing the key binding to `copySeq`.

Defaults to:

```js
{
    key: "",
    meta: false,
    ctrl: false,
    shift: false,
    alt: false
}
```

You can use any keyboard key that is not `ArrowLeft`, `ArrowRight`, `ArrowUp`, or `ArrowDown`. Find the key name for your key press at [keycode.info](https://keycode.info/). This library uses the `event.key` for key bindings. The key to be bound is case sensitive. If you want to make `copySeq` a special key binding e.g. `shift + a`, or `alt + .` you can specify your special key with value `true`.

##### `searchQuery`

`object` to specify a subsequence search to be conducted on the imported part.

Defaults to:

```js
{ query: "", mismatch: 0 }
```

`query` is a string subsequence. The search functionality supports the following common nucleotide wildcards:

```js
{
  y: [ c, t],
  r: [ a, g ],
  w: [ a, t ],
  s: [ g, c ],
  k: [ t, g ],
  m: [ c, a ],
  d: [ a, g, t ],
  v: [ a, c, g ],
  h: [ a, c, t ],
  b: [ c, g, t ],
  x: [ a, c, g, t ],
  n: [ a, c, g, t ]
}
```

`mismatch` is an `int` numeration of the amount of mismatch leeway the search should have. A mismatch of `1` will will allow for one base to not match the `query`.

##### `backbone`

`string` addition to main sequence. This is a feature specific to BioBricks. The library currently supports `BBa_K1362091`, `BBa_K823055`, `pSB1A3`, `pSB1A7`, `pSB1AC3`, `pSB1AK3`, `pSB1AT3`, `pSB1C3`, `pSB1K3`, `pSB1T3` as specified at [parts.igem.org](https://parts.igem.org/Plasmid_backbones/Assembly). To use the backbone simply specify the backbone name (case insensitive) as a string like so

```js
{
  backbone: "BBa_K1362091",
}
```

Custom backbones are also minimally supported. Any sequence string you input (`ATCGatcg`) can be used as the backbone.

##### `translations`

`array` of translation objects for creating translations beneath the sequence. Require 0-based start and end indexes (of the DNA bp) and a direction (`FORWARD` or `REVERSE`).

```js
{
  translations: [{ start: 0, end: 89, direction: "FORWARD" }],
}
```

## Library Demo

You can see a demonstration of this library used to fetch BioBricks at

### **[tools.latticeautomation.com/seqviz](https://tools.latticeautomation.com/seqviz)**

For developers, the demo source code is at [seqviz/demo](https://github.com/Lattice-Automation/seqviz/tree/master/demo/README.md).

For a simpler start up, there is an HTML demo which only requires additions to the `index.html` to get started. See [seqviz/demo/simple-ui/index.html](https://github.com/Lattice-Automation/seqviz/tree/master/demo/simple-ui/public/index.html).

You can also check out the example for examining NCBI parts included in our SeqViz introductory [Medium post](https://medium.com/lattice-automation/visualize-your-dna-sequences-with-seqviz-b1d945eb9684).

## Contact Us

This library is currently being maintained by <!-- pkg-author(cmd:) -->[Lattice Automation](https://latticeautomation.com/)<!-- /pkg-author -->.

You can report bugs at <!-- pkg-bug-url(cmd:) -->[Issues](https://github.com/Lattice-Automation/seqviz/issues)<!-- /pkg-bug-url -->

or contact <!-- pkg-bug-email(cmd:) -->[contact@latticeautomation.com](contact@latticeautomation.com)<!-- /pkg-bug-email -->

## Contributing

See [Running in Development Mode](https://github.com/Lattice-Automation/seqviz/wiki/Running-in-Development-Mode), [CONTRIBUTING](https://github.com/Lattice-Automation/seqviz/blob/master/CONTRIBUTING.md), and [CODE_OF_CONDUCT](https://github.com/Lattice-Automation/seqviz/blob/master/CODE_OF_CONDUCT.md)

Here are some good guidelines to get started with contributing: [Contributing to Open Source](https://medium.com/@jenweber/your-first-open-source-contribution-a-step-by-step-technical-guide-d3aca55cc5a6).
