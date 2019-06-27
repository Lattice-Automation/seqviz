# seqviz

**Latest Production Build:** <!-- exec-bash(cmd:echo `date`) -->Thu Jun 27 15:55:52 EDT 2019<!-- /exec-bash -->

**Latest Production Version:** <!-- version(cmd:) -->0.2.0<!-- /version -->

**Maintained by:** <!-- pkg-author(cmd:) -->[Lattice Automation](https://latticeautomation.com/)<!-- /pkg-author -->

<!-- pkg-description(cmd:) -->A standalone DNA vector viewer that accepts a DNA sequence as a string or a file (GenBank, FASTA, DNA), auto-annotates it with DNA features, and renders to a DIV on the client's website or application.<!-- /pkg-description -->
<br>

---

- [Key Features](#key-features)
- [Library Demo](#library-demo)
- [Using the Library](#using-the-library)
  - [Installation](#installation)
  - [Instantiate a Viewer](#instantiate-a-viewer)
  - [Viewer Options](#viewer-options)
- [Running in Development](#running-in-development-mode)
  - [Development Files](#development-files)
  - [Scripts](#scripts)
- [Contributing](#contributing)
- [Contact Us](#contact-us)

---

## Key Features

This package aims to provide basic sequence viewing in a simple, open-source way, for use anywhere that supports running `javascript`. It currently provides:

- **Imports**: For formats that can be displayed by this viewer see viewer options [part input](#part-)
- **Circular Plasmid viewer** (`viewer = circular`):

  - Shows annotations with names and colors
  - Shows name of sequence
  - Shows base pair length of sequence

- **Linear Sequence viewer** (`viewer = linear`):

  - Shows annotations with names and colors
  - Shows sequence and complement nucleotide bases
  - Shows Index line with base pair numbers
  - Shows enzyme cut sites
  - Shows highlighted subsequences from search

- **Selections**:

  - On both Circular and Linear viewers clicking on an annotation or dragging over a section of the viewer will create a selection
  - Information about this selection will be available through the `onSelection()` option (see [viewer options](#vieweroptions-))

- **Off-line Viewing**: While the library is intended to be used with web applications on the internet it does support use without an internet connection. Offline viewing requires that you load the library source code from a local copy.
  - Auto-annotation is **not** available while off-line
  - Sequences loaded as objects or strings **will** be available for viewing while off-line
  - Once a part has been fetched from NCBI or iGem it will be cached in your browser in a cookie with the accession id as the name. As long as you have that cookie, the part **will** be available for viewing off-line (see [Caching](#caching) for more details).

## Library Demo

You can see a demonstration of this library with some simple html ui at **[tools.latticeautomation.com/seqviz/](https://tools.latticeautomation.com/seqviz/index.html)** .

For developers, the repository for the demo is [seqviz-demo](https://github.com/Lattice-Automation/seqviz-demo/blob/master/README.md).

See the [index.html](https://github.com/Lattice-Automation/seqviz-demo/blob/simple-ui/public/index.html) for demo code.

The repository also contains a React application demo for the library. See the [semantic-ui](https://github.com/Lattice-Automation/seqviz-demo/blob/semantic-ui/README.md) branch.

## Using the Library

### Installation

The library source code is in a file named <!-- pkg-file(cmd:) -->`seqviz.min.js`<!-- /pkg-file -->. You can either extract this from the [GitHub release](https://github.com/Lattice-Automation/dna-sequence-vizualizer/releases) tarball or download it from our cdn at `https://cdn.latticeautomation.com/libs/seqviz/${version}/`.

You will want to import the library in your top level `index.html` (or whichever is the entry point of your website).

For example you can use:

```html
<script src="https://cdn.latticeautomation.com/libs/seqviz/${version}/seqviz.min.js"></script>
```

This method requires no actual download. You will be served the library directly from our cdn. This method, however, does require you to have internet access in order to use the library.

If you want to load the library locally and be able to view cached parts without internet connection you can download the source file to the same folder as your `index.html` and use:

```html
<script src="seqviz.min.js"></script>
```

If you are using [Create React App](https://github.com/facebook/create-react-app) and have the source code stored in your public folder you can use:

```html
<script src="%PUBLIC_URL%/seqviz.min.js"></script>
```

Once you have imported the library you can access the `lattice` library through the `window` global variable. The `lattice` library currently contains one sample part `pUC()` and the `Viewer()` constructor.

### Instantiate a Viewer

You can initialize a new viewer with the sample part like so:

```html
<script>
  const lattice = window.lattice;
  const part = lattice.pUC();
  const viewer = lattice.Viewer("bottom-root", {
    part: part
  });
  viewer.render();
</script>
```

The only required inputs are an element and a part, see below for details.

The `viewer` is an object with three fields.

#### `viewer.viewer`

The library is built with [React.js](https://reactjs.org/). `viewer.viewer` will return the `React` component for the viewer so that you can render it yourself.

#### `viewer.viewerHTML`

This will return the `HTML` for the viewer if you want to render the viewer yourself. This is a trial feature and may not be sufficient information for a renderer to render the viewer.

#### `viewer.render`

This renders the viewer using `ReactDOM`(which is packaged with the library so you do not need to have it installed locally).

### Viewer Options

`Viewer(${element}, ${viewerOptions})`

#### `element` :

- a string element id like `"root"` or `"app-root"`
- an element i.e. from `document.getElementById()`

There are no defaults values for this option. An element input is minimally necessary to initialize a viewer and use this library.

#### `viewerOptions` :

```js
const {
  part = "KJ668651.1" || "BBa_E0040" || PUC || "ATCG", // part input
  annotate = true || false, // whether or not to use our lambda auto-annotate
  viewer = "circular" || "linear" || "both", // type of viewer to show
  showAnnotations = true || false, // whether or not to show annotations
  showComplement = true || false, // whether or not to show complement strand
  showIndex = true || false, // whether or not to show index (numbers and line)
  zoom = { linear: 0 - 100 }, // zoom under 50 is zoom out, zoom above 50 is zoom in
  colors = ["#85A6FF", "#FFFFF"], // color hex codes for annotation colors
  onSelection = selectionObject => {}, // used to return, log, or do something to selection
  onSearch = searchResults => {}, // used to return, log, or do something to search results
  searchNext = {
    key: "",
    meta: true || false,
    ctrl: true || false,
    shift: true || false,
    alt: true || false
  }, // key binding for toggling next search result highlight, defaults to none
  searchQuery = { query: "", mismatch: 0 }, // search query
  backbone = "pSB1C3", // name of a BioBrick backbone, or a custom backbone string
  enzymes = ["AciI"] // list of enzymes for which to search for and display cutsites
} = viewerOptions;
```

#### `part` :

- NCBI accession number (`string`)
- BioBrick accession number (`string`)
- sequence string supports `{atcguyrwskmdvhbxnATCGUYRWSKMDVHBXN}` (`string`)
- HTML file input (`FileList` or `File`)
- part `object` of the form:

```json
{
  "name": "some part",
  "seq": "AtCg",
  "compSeq": "tAgC",
  "annotations": [
    {
      "start": 1,
      "end": 4,
      "direction": "REVERSE",
      "name": "a fragment"
    }
  ]
}
```

**NOTE** that this library currently assumes that your sequence has only `ATCGatcg` nucleotides. It may render wildcard nucleotides but wildcards will not be recognized by the search functionality if they are a part of the sequence. (see [searchQuery](#searchquery) for searching the sequence).

There are no default values for this option. A part input is minimally necessary to initialize a viewer and use this library.

#### `annotate`:

`boolean` **true** or **false**. If true will try to connect to Lattice's BLAST endpoint to find annotations for the imported part. Requires internet connection. Needs to be turned on (**true**) in order to see BioBrick prefixes and suffixes.

Defaults to **false**.

#### `viewer`:

`string` **circular**, **linear**, or **both**. Will determine whether to render part in the circular plasmid viewer, linear sequence viewer, or a side-by-side view with both.

Defaults to **both**.

#### `showAnnotations`:

`boolean` **true** or **false**. If true will show annotations on the viewers.

Defaults to **true**.

#### `showComplement`:

`boolean` **true** or **false**. If true will show the complement strand nucleotide bases in addition to the sequence strand nucleotide bases in Linear Sequence viewer. Has no effect on the Circular Plasmid viewer where neither the sequence nor the complement strand bases can be seen.

Defaults to **true**.

#### `showIndex`:

`boolean` **true** or **false**. If true will show an axis with the index numbers of the nucleotide bases.

Defaults to **true**.

#### `zoom`:

`object` that numerates zoom values for viewers.

Both sub-options in the zoom option are optional so you can use `{circular: 0}` or `{linear:50}` individually. Circular zoom is currently not supported and thus the `circular` option will not affect the viewers in any way. The `linear` option will zoom out the Linear Sequence viewer for numbers below 50 and zoom in for numbers above 50.

Defaults to:

```js
{
circular: 0,
linear: 50
}
```

#### `colors`:

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

#### `onSelection`:

`function` to be applied to the selection information. The function you specify will have access to the `selection` object as its only parameter.

Example for a random drag selection

```js
{
  "ref": "",
  "sequenceMeta": {
    "sequence": "aggcggtttgcgtattgggcgctcttccgcttcctcgctcactgactcgctgcgctcggtcgttcggctgcggcgagcggtatcagctcactcaaaggcggtaatacggttatccacagaatcaggggataacgcaggaaagaacatgtgagcaaaaggccagcaaaaggccaggaaccgtaaaaaggccgcgttgctggcgtttttccataggctccgcccccctgacgagcatcacaaaaatcgacgctcaagtcagaggtggcgaaacccgacaggactataaagataccaggcgtttccccctggaagctccctcgtgcgctctcctgttccgaccctgccgcttaccggatacctgtccgcctttctcccttcgggaagcgtggcgctttctcatagctcacgctgtaggtatctcagttcggtgtaggtcgttcgctccaagctgggctgtgtgcacgaaccccccgttcagcccgaccgctgcgccttatccggtaactatcgtcttgagtccaacccggtaagacacgacttatcgccactggcagcagccactggtaacaggattagcagagcgaggtatgtaggcggtgctacagagttcttgaagtggtggcctaactacggctacactagaaggacagtatttggtatctgcgctctgctgaagccagttaccttcggaaaaagagttggtagctcttgatccggcaaacaaaccaccgctggtagcggtggtttttttgtttgcaagcagcagattacgcgcagaaaaaaaggatctcaagaagatcctttgatcttttctacggggtctgacgctcagtggaacgaaaactcacgttaagggattttggtcatgagattatcaaaaaggatcttcacctagatccttttaaattaaaaatgaagttttaaatcaatctaaagtatatatgagtaaacttggtctgacagttaccaatgcttaa",
    "GC": 51.074718526100305,
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
    "GC": 55.24691358024691,
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

Defaults to:

```js
selection => {
  console.log(selection);
};
```

For an example on how to practically use the selection information see [seqviz-demo](https://github.com/Lattice-Automation/seqviz-demo/blob/master/public/index.html).

#### `onSearch`:

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

Defaults to:

```js
results => {
  console.log(results);
};
```

#### `searchNext`:

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

You can use any keyboard key that is not `ArrowLeft`, `ArrowRight`, `ArrowUp`, or `ArrowDown`. Find the key name for your key press at [keycode.info](https://keycode.info/). This library uses the `event.key` for key bindings. If you want to make `searchNext` a special key binding e.g. `shift + A`, or `alt + .` you can specify your special key with value `true`.

#### `searchQuery`:

`object` to specify a subsequence search to be conducted on the imported part.

Defaults to:

```js
{ query: "", mismatch: 0 }
```

`query` is a string subsequence. The search functionality supports the following common nucleotide wildcards:

```js
{
  y: [ c: "c", t: "t" },
  r: { a: "a", g: "g" },
  w: { a: "a", t: "t" },
  s: { g: "g", c: "c" },
  k: { t: "t", g: "g" },
  m: { c: "c", a: "a" },
  d: { a: "a", g: "g", t: "t" },
  v: { a: "a", c: "c", g: "g" },
  h: { a: "a", c: "c", t: "t" },
  b: { c: "c", g: "g", t: "t" },
  x: { a: "a", c: "c", g: "g", t: "t" },
  n: { a: "a", c: "c", g: "g", t: "t" }
}
```

`mismatch` is an `int` numeration of the amount of mismatch leeway the search should have. A mismatch of `1` will will allow for one base to not match the `query`.

#### `backbone`:

`string` addition to main sequence. This is a feature specific to BioBricks. The library currently supports `BBa_K1362091`, `BBa_K823055`, `pSB1A3`, `pSB1A7`, `pSB1AC3`, `pSB1AK3`, `pSB1AT3`, `pSB1C3`, `pSB1K3`, `pSB1T3` as specified at [parts.igem.org](https://parts.igem.org/Plasmid_backbones/Assembly). To use the backbone simply specify the backbone name (case insensitive) as a string like so

```js
{
  backbone: "BBa_K1362091";
}
```

Custom backbones are also minimally supported. Any sequence string you input (`ATCGatcg`) can be used as the backbone.

Defaults to **`""`**.

#### `enzymes`:

`array` of enzymes to show cut sites for. The library supports the full list of NEB enzymes. To search for their cut sites simply specify their name as a string in the array.

```js
{
  enzymes: ["AciI", "BsaI"];
}
```

Defaults to **`[]`**.

### Caching

This library caches parts fetched from NCBI and iGem (see `viewerOptions` [`part`](#part-)) so that they can be viewed even if you lose internet connection. These parts are cached in your browser's local storage as cookies with keys of the format `seqviz-cache-${accession-id}`. If you would like to refetch a part for whatever reason, simply delete the cookie for the part you want to reload and initialize the viewer with the accession id again.

If you have annotations on your parts seqviz will also cache the colors of your annotations so that they remain consistent between refreshes. These are stored in cookies with keys of the format `seqviz-cache-${partName}-annotation-${annotationName}-color`. If you do not like the colors assigned to your annotations or have added an array of custom colors, delete the cookies corresponding to the annotations you want to refresh and re-intialize the viewer.

If you need help deleting your cookies here are some helpful guides: [Deleting Cookies on Major Browsers](https://www.lifewire.com/how-to-delete-cookies-2617981).

For people running Chrome developer tools the cookies can be found under the `Application` tab under `Storage` > `Local Storage` > `${your domain}`.

## Running in Development Mode

The testing environment is run with [Create React App](https://github.com/facebook/create-react-app).

### Development Files

#### `public/index.html`

Place any `HTML` input fields, DOM nodes, etc. here.

#### `src/index.css`

Place any styles for the test here.

#### `src/index.jsx`

Initialize the viewer from the `Viewer` object here. Because you are accessing the `Viewer` constructor directly you will need to have values for all `viewerOptions`. Reference the sample code already present.

### Scripts

### `install`

Use `npm install` to install all library dependencies locally. This is required to run the development environment.

### `start`

Use `npm start` or `npm run start` to spin up your development environment.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

If something is already running on your port 3000 Create React App will ask if you want to run the demo on the next port up (3001 and then 3002, etc.). In those cases, you can view the demo at the specified port.

The page will reload if you make edits.

You will also see any lint errors in the console.

### `build`

Use `npm run build` to rebuild the library after making changes. Remember to change the version in the `package.json` before building.

Webpack will consolidate the library into a single browser-ready minified script.

You can see the results in `/dist` labeled as <!-- pkg-file(cmd:) -->`seqviz.min.js`<!-- /pkg-file -->

### `execXML`

This script is used to propagate information to the `.md` files. It is included in the `npm run build` script but you can run it separately with `node execXML.js ${file}`.

### `test`

Create React App uses [jest](https://jestjs.io/) for testing. You can run all existing tests with `npm run test`.

### `release` **Maintainers only**

Use `npm run release` to upload the latest build to the Lattice CDN S3 storage. You will need `Python`, `pip`, and `awscli` installed on your computer. For more information about the release process and release related npm scripts see the [Release Process](https://github.com/Lattice-Automation/seqviz/wiki/Release-Process) wiki page.

## Contributing

See [CONTRIBUTING](https://github.com/Lattice-Automation/dna-sequence-vizualizer/blob/master/CONTRIBUTING.md) and [CODE_OF_CONDUCT](https://github.com/Lattice-Automation/dna-sequence-vizualizer/blob/master/CODE_OF_CONDUCT.md)

Here are some good guidelines to get started with contributing: [Contributing to Open Source](https://medium.com/@jenweber/your-first-open-source-contribution-a-step-by-step-technical-guide-d3aca55cc5a6).

## Contact Us

This library is currently being maintained by <!-- pkg-author(cmd:) -->[Lattice Automation](https://latticeautomation.com/)<!-- /pkg-author -->.

You can report bugs at <!-- pkg-bug-url(cmd:) -->[Issues](https://github.com/Lattice-Automation/dna-sequence-vizualizer/issues)<!-- /pkg-bug-url -->

or contact <!-- pkg-bug-email(cmd:) -->[support@latticeautomation.com](support@latticeautomation.com)<!-- /pkg-bug-email -->

## Licence

[MIT](https://github.com/Lattice-Automation/dna-sequence-vizualizer/blob/master/LICENSE)
