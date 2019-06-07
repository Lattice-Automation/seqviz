# dna-sequence-vizualizer

**Latest Production Build:** <!-- exec-bash(cmd:echo `date`) -->Fri Jun 7 18:34:54 EDT 2019<!-- /exec-bash -->

**Latest Production Version:** <!-- version(cmd:) -->0.0.13<!-- /version -->

**Maintained by:** <!-- pkg-author(cmd:) -->[Lattice Automation](https://latticeautomation.com/)<!-- /pkg-author -->

<!-- pkg-description(cmd:) -->A standalone DNA vector viewer that accepts a DNA sequence as a string or a file (gb, fasta, dna), auto-annotates it with DNA features, and renders to a DIV on the client's website or application.<!-- /pkg-description -->
<br>

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs a test app for this library in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

You will first want to write or uncomment-out test code in `src/index.jsx`. Remember to remove or comment-out test code before building the library.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the library into a single browser-ready minified script.

You can see the results in `/dist` labeled as <!-- pkg-file(cmd:) -->`visualizer.0.0.13.min.js`<!-- /pkg-file -->

## Using the library

The library source code will be in a file named <!-- pkg-file(cmd:) -->`visualizer.0.0.13.min.js`<!-- /pkg-file -->. You can either extract this from the GitHub release tarball or download it from our cdn at `https://d3jtxn3hut9l08.cloudfront.net/`.

You will want to import the library in your top level `index.html`. In the case of the cdn download you can use.

```html
<script src="https://d3jtxn3hut9l08.cloudfront.net/visualizer.${version}.min.js"></script>
```

This will expose the `lattice` library through the `window` global variable. The `lattice` library currently contains one sample part `pUC()` and the `Viewer()` constructor. You can initialize a new viewer with the sample part like so:

```html
<script>
  const lattice = window.lattice;
  const part = lattice.pUC();
  const viewer = lattice.Viewer("bottom-root", {
    part: part,
    viewer: "both"
  });
  viewer.render();
</script>
```

### Viewer Options

`Viewer(${element}, ${viewerOptions})` <br>

`element` :

- a string element id like "root" or "app-root"
- an element i.e. from `document.getElementById()`

<br>

`viewerOptions` :

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

<br>

`part` :

- NCBI accession number
- BioBrick accession number
- sequence string supports `{atcguyrwskmdvhbxnATCGUYRWSKMDVHBXN}`
- part object of the form

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
