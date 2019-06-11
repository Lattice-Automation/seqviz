# dna-sequence-visualizer demo

A demonstration of the DNA Sequence Visualizer provided by Lattice.

## Running in development

To run a local copy, clone the repository, and then run `npm install` and `npm start` in the directory.

The demo is bootstrapped with [Create React App](https://github.com/facebook/create-react-app), but the only pertinent pieces of code, including style, input, and viewer instantiation are in the `index.html` file in the `public` folder. All the other files are defaults created by the Create React App library to help render the file.

To change the version of visualizer you run in the demo change the last part in the script import

`<script src="https://d3jtxn3hut9l08.cloudfront.net/visualizer.0.1.1.min.js"></script>`

The example above is running `version 0.1.1`. Alternatively you can run the demo from a local copy of the compiled visualizer. If you download the `version 0.1.1` script for example you can run the app with just

`<script src="%PUBLIC_URL%/visualizer.0.1.1.min.js"></script>`

provided the copy of the compiled visualizer code is in the same repository as the `index.html` file.

### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Demo Inputs

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

## Final Viewer Instantiation

```js
const viewer = lattice.Viewer("app-root", {
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
