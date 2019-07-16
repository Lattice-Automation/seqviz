<b>HTML Demo</b> | [Semantic UI Demo](https://github.com/Lattice-Automation/seqviz/tree/master/demo/semantic-ui/README.md)

# seqviz Demo

A demonstration of the DNA Sequence Visualizer provided by Lattice. Visit [Lattice-Automation/seqviz](https://github.com/Lattice-Automation/seqviz) to see the source code and contribute.

## Running in Development

To run a local copy of this demo, clone the [SeqViz library](https://github.com/Lattice-Automation/seqviz), and `cd /demo/simple-ui`. Then run `npm install` and `npm start`.

The demo is bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

The demo will be running the latest version of the SeqViz library, but you can change the version you want to demo in the [`public/index.html`](https://github.com/Lattice-Automation/seqviz/tree/master/demo/simple-ui/public/index.html) file by modifying the line that looks like this:

`<script src="https://cdn.latticeautomation.com/libs/seqviz/0.2.0/seqviz.min.js"></script>`

The example above is running `version 0.2.0`. If you want to run the demo from a local copy of the compiled SeqViz, copy the minified distribution into the demo folder and use this:

`<script src="%PUBLIC_URL%/seqviz.min.js"></script>`

The minified distribution will need to be in the same folder as the `index.html` file.

To check what the version of your downloaded library is, open the `seqviz.min.js` file and see the header

```js
/*!
 * lattice - seqviz - 0.2.0
 * provided and maintained by Lattice Automation (https://latticeautomation.com/)
 * LICENSE MIT
 */
```

### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

If something is already running on your port 3000 Create React App will ask if you want to run the demo on the next port up (3001 and then 3002, etc.). In those cases, you can view the demo at the specified port.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Demo Files (<b>HTML</b> | [Semantic](https://github.com/Lattice-Automation/seqviz/tree/master/demo/semantic-ui/README.md#demo-files-html--semantic))

The HTML demo uses Create React App but does not use any React specific code. The only file customized for the Demo is the [`public/index.html`](https://github.com/Lattice-Automation/seqviz/tree/master/demo/simple-ui/public/index.html). The rest of the files are Create React App's basic setup to render that file.

The library is imported in the head:

```html
<!-- IMPORT FROM LOCAL FOR TESTING SEQVIZ WITH UI -->
<script src="%PUBLIC_URL%/seqviz.min.js"></script>

<!-- IMPORT FROM CDN FOR TESTING SEQVIZ WITH UI -->
<!-- <script src="https://cdn.latticeautomation.com/libs/seqviz/0.2.0/seqviz.min.js"></script> -->
```

The styles for the demo are also initialized in the head:

```html
<!-- STYLES FOR TESTING SEQVIZ WITH UI -->
<style type="text/css">
  #config-root {
    margin: 1px;
    padding: 5px;
    order: 1;
    flex: 1 0 auto;
  }

  #app-root {
    order: 2;
    flex: 1 1 auto;
    overflow: hidden;
  }

  #data-root {
    margin: 1px;
    padding: 5px;
    order: 3;
    flex: 1 0 auto;
  }

  #enzymes {
    height: 1.5em;
  }

  #enzyme {
    display: inline-block;
  }

  #submit:hover {
    cursor: pointer;
    background: rgba(0, 90, 255, 0.7);
    color: white;
    border-radius: 5px;
    box-shadow: 0 6px 8px 0 rgba(0, 0, 0, 0.24), 0 7px 10px 0 rgba(0, 0, 0, 0.1);
  }

  body {
    margin: 0px;
    padding: 0px;
    display: flex;
    flex-direction: column;
    position: relative;
    width: 99vw;
    height: 98vh;
    overflow: hidden;
    overscroll-behavior: none;
  }
</style>
```

The html inputs are in the

```html
<body id="body"></body>
```

See [Demo Inputs](#demo-inputs) below.

And the viewer initialization is in a

```html
<!-- SCRIPT TO TEST SEQVIZ WITH UI -->
<script></script>
```

at the bottom of the file.

## Demo Inputs (<b>HTML</b> | [Semantic](https://github.com/Lattice-Automation/seqviz/tree/master/demo/semantic-ui/README.md#demo-inputs-html--semantic))

### Part

```html
<span> Part: <input id="accession" /> </span>
```

```js
const part = document.getElementById("accession").value;
```

Demonstrates string part import, fetching a part from BioBrick accession id.

### Backbone

```html
<span>
  Backbone:
  <select name="backbone" id="backbone">
    <option value="psb1c3">pSB1C3</option>
    <option value="bba_k1362091">BBa_K1362091</option>
    <option value="bba_k823055">BBa_K823055</option>
    <option value="psb1a3">pSB1A3</option>
    <option value="psb1a7">pSB1A7</option>
    <option value="psb1ac3">pSB1AC3</option>
    <option value="psb1ak3">pSB1AK3</option>
    <option value="psb1at3">pSB1AT3</option>
    <option value="psb1k3">pSB1K3</option>
    <option value="psb1t3">pSB1T3</option>
  </select>
</span>
```

```js
const backbone = document.getElementById("backbone").value;
```

Demonstrates use of backbone with BioBrick parts.

### Viewer Type

```html
<span>
  Viewer Type:
  <select name="viewer" id="viewer">
    <option value="both">both</option>
    <option value="circular">circular</option>
    <option value="linear">linear</option>
  </select>
</span>
```

```js
const viewType = document.getElementById("viewer").value;
```

Demonstrates selecting the type of viewer to show the sequence in.

### Zoom Linear

```html
<span>
  Zoom Linear:
  <input type="range" min="1" max="100" value="50" class="slider" id="lzoom" />
</span>
```

```js
const lzoom = document.getElementById("lzoom").value;
```

Demonstrates zooming the linear viewer.

### Search Query

```html
<span>Search Query: <input id="query"/></span>
```

```js
const query = document.getElementById("query").value;
```

Demonstrates searching for a sequence string in the linear viewer.

### Search Results Count

```html
<span id="search-data"></span>
```

```js
onSearch: results => {
  if (query.length) {
    const dataDisplay = document.getElementById("search-data");
    const { searchResults } = results;
    dataDisplay.innerHTML = `<em>${searchResults.length} results</em>`;
  } else {
    const dataDisplay = document.getElementById("search-data");
    dataDisplay.innerHTML = "";
  }
};
```

Demonstrates the onSearch hook which exposes the results of your search in an object.

### Auto-annotate

```html
<span>
  Auto-annotate:
  <input id="auto-annotate" checked="true" type="checkbox" />
</span>
```

```js
const annotate = document.getElementById("auto-annotate").checked;
```

Demonstrates fetching annotations from our lambda endpoint. On by default. Needs to be turned on to see iGem prefix and suffix annotations (because that information is not stored in the BioBricks).

### Show Annotations

```html
<span>
  Show Annotations:
  <input id="annotations" checked="true" type="checkbox" />
</span>
```

```js
const annotations = document.getElementById("annotations").checked;
```

Demonstrates turning on and off showing annotations on the viewers. On by default. Turn off if you just want to inspect the sequence base pairs.

### Show Complement

```html
<span>
  Show Complement:
  <input id="complement" checked="true" type="checkbox" />
</span>
```

```js
const complement = document.getElementById("complement").checked;
```

Demonstrates turning on and off the complement strand in the viewers. On by default. Turn off if you just want to inspect the sequence strand.

### Show Axis

```html
<span>
  Show Axis:
  <input id="index" checked="true" type="checkbox" />
</span>
```

```js
const index = document.getElementById("index").checked;
```

Demonstrates turning on and off the axis in the viewers. On by default. Turn off if you don’t need to see the base pair numbers.

### Enzymes

```html
<span>
  Enzymes:
  <select name="enzyme" id="enzymes" multiple>
    <option id="enzyme" value="EcoRI">ecori</option>
    <option id="enzyme" value="PstI">psti</option>
    <option id="enzyme" value="XbaI">xbai</option>
    <option id="enzyme" value="SpeI">spei</option>
  </select>
</span>
```

```js
const enzymes = Array.prototype.map.call(
  document.getElementById("enzymes").selectedOptions,
  o => {
    return o.value;
  }
);
```

Demonstrates searching for enzyme cut sites on the viewers. Input is a multi-select so you can choose any combination of the enzymes to search for.

### Selection Information

```html
<span>
  <div id="select-data"></div>
</span>
```

```js
onSelection: selection => {
  const dataDisplay = document.getElementById("select-data");
  const { feature, selectionMeta, sequenceMeta } = selection;
  dataDisplay.innerHTML = `<em><b>${
    feature ? feature.name : ""
  }</b></em><br/><em>${feature ? feature.type : ""}</em>  ${
    selectionMeta.selectionLength
  }bp (${selectionMeta.start} - ${
    selectionMeta.end
  }) <br/> <b>GC:</b> ${sequenceMeta.GC.toPrecision(
    2
  )}% <b>Tm:</b> ${sequenceMeta.Tm.toPrecision(2)} °C `;
};
```

Demonstrates the onSelection hook which exposes information about your sequence selection on the viewer.

## Final Viewer Instantiation (<b>HTML</b> | [Semantic](https://github.com/Lattice-Automation/seqviz/tree/master/demo/semantic-ui/README.md#final-viewer-instantiation-html--semantic))

```js
const viewer = seqviz.Viewer("app-root", {
  part: part,
  backbone: backbone,
  viewer: viewType,
  annotate: annotate,
  showAnnotations: annotations,
  showComplement: complement,
  showIndex: index,
  zoom: { linear: lzoom },
  onSelection: selection => {
    const dataDisplay = document.getElementById("select-data");
    const { feature, selectionMeta, sequenceMeta } = selection;
    dataDisplay.innerHTML = `<em><b>${
      feature ? feature.name : ""
    }</b></em><br/><em>${feature ? feature.type : ""}</em>  ${
      selectionMeta.selectionLength
    }bp (${selectionMeta.start} - ${
      selectionMeta.end
    }) <br/> <b>GC:</b> ${sequenceMeta.GC.toPrecision(
      2
    )}% <b>Tm:</b> ${sequenceMeta.Tm.toPrecision(2)}Â°C `;
  },
  onSearch: results => {
    if (query.length) {
      const dataDisplay = document.getElementById("search-data");
      const { searchResults } = results;
      dataDisplay.innerHTML = `<em>${searchResults.length} results</em>`;
    } else {
      const dataDisplay = document.getElementById("search-data");
      dataDisplay.innerHTML = "";
    }
  },
  searchQuery: { query: query },
  enzymes: enzymes
});
```

The HTML Demo uses the library's packaged ReactDOM renderer to render the viewer. This is done by calling `viewer.render()`.
