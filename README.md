[HTML Demo](https://github.com/Lattice-Automation/seqviz-demo/blob/simple-ui/README.md) | <b>Semantic UI Demo</b>

# seqviz Demo

A demonstration of the DNA Sequence Visualizer provided by Lattice. Visit [Lattice-Automation/seqviz](https://github.com/Lattice-Automation/seqviz) to see the source code and contribute.

## Running in Development

To run a local copy of this demo, clone the repository, and then run `npm install` and `npm start` in the directory.

The demo is bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To change the version of `seqviz` you run in the demo change the last part in the script import in [`public/index.html`](https://github.com/Lattice-Automation/seqviz-demo/blob/semantic-ui/public/index.html)

`<script src="https://cdn.latticeautomation.com/libs/seqviz/0.2.0/seqviz.min.js"></script>`

The example above is running `version 0.2.0`. Alternatively you can run the demo from a local copy of the compiled seqviz. If you download the `version 0.2.0` script for example you can run the app with just

`<script src="%PUBLIC_URL%/seqviz.min.js"></script>`

provided the copy of the compiled seqviz code is in the same repository as the `index.html` file.

To check what the version of your downloaded library is, open the `seqviz.min.js` file and see the header

```js
/*!
 * lattice - seqviz - 0.2.0
 *  provided and maintained by Lattice Automation (https://latticeautomation.com/)
 */
```

### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Demo Files ([HTML](https://github.com/Lattice-Automation/seqviz-demo/blob/simple-ui/README.md#demo-files-html--semantic) | <b>Semantic</b>)

The Semantic Demo uses a Create React App bootstrapped React application.

The library is imported in the [`public/index.html`](https://github.com/Lattice-Automation/seqviz-demo/blob/semantic-ui/public/index.html) at the head:

```html
<!-- IMPORT FROM LOCAL FOR TESTING SEQVIZ WITH UI -->
<script src="%PUBLIC_URL%/seqviz.min.js"></script>

<!-- IMPORT FROM CDN FOR TESTING SEQVIZ WITH UI -->
<!-- <script src="https://cdn.latticeautomation.com/libs/seqviz/0.2.0/seqviz.min.js"></script> -->
```

The Demo uses a Semantic-UI React integration (see [react.semantic](https://react.semantic-ui.com/)) for global styling, but specific customizations are in the [`App.css`](https://github.com/Lattice-Automation/seqviz-demo/blob/semantic-ui/src/App.css) file:

```css
#sidebar-container {
  min-height: 100vh;
}

.sidebar-container {
  min-height: 100vh;
}

#part-explorer {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

#header,
#footer {
  margin: 0px;
  flex: 0 0 auto;
}

#seqviewer {
  min-height: 50vh;
  width: 100vw;
  margin: 0px;
  overflow-y: none;
  flex: 1 1 0;
}

#selection-name {
  font-weight: bold;
  font-style: italic;
}

#selection-type {
  font-style: italic;
}

#selection-label {
  font-weight: bold;
}

#selection-name,
#selection-type,
#selection-length,
#selection-range,
#sequence-gc,
#sequence-tm {
  padding: 5px;
}

#selection-label {
  padding: 5px 0px 5px 5px;
}
```

The inputs and viewer initialization are in the [`App.js`](https://github.com/Lattice-Automation/seqviz-demo/blob/semantic-ui/src/App.js) file. See [Demo Inputs](#demo-inputs--html-semantic) below.

## Demo Inputs ([HTML](https://github.com/Lattice-Automation/seqviz-demo/blob/simple-ui/README.md#demo-inputs-html--semantic) | <b>Semantic</b>)

### Part

```js
export class PartInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <Input
        icon="search"
        name="accession"
        placeholder="Find a BioBrick ..."
        onChange={(event, data) => {
          setDemoState({ part: data.value });
        }}
      />
    );
  }
}
```

```js
<PartInput setDemoState={setDemoState} />
```

Demonstrates string part import, fetching a part from BioBrick accession id.

### Backbone

```js
const backBoneOptions = [
  { key: "psb1c3", value: "psb1c3", text: "pSB1C3" },
  { key: "bba_k1362091", value: "bba_k1362091", text: "BBa_K1362091" },
  { key: "bba_k823055", value: "bba_k823055", text: "BBa_K823055" },
  { key: "psb1a3", value: "psb1a3", text: "pSB1A3" },
  { key: "psb1a7", value: "psb1a7", text: "pSB1A7" },
  { key: "psb1ac3", value: "psb1ac3", text: "pSB1AC3" },
  { key: "psb1ak3", value: "psb1ak3", text: "pSB1AK3" },
  { key: "psb1at3", value: "psb1at3", text: "pSB1AT3" },
  { key: "psb1k3", value: "psb1k3", text: "pSB1K3" },
  { key: "psb1t3", value: "psb1t3", text: "pSB1T3" }
];
export class BackBoneInput extends Component {
  state = { value: "" };
  render() {
    const { setDemoState } = this.props;
    return (
      <span>
        <Dropdown
          trigger={<Icon name="circle notched" />}
          button
          className="icon"
          options={backBoneOptions}
          placeholder="Select a plasmid backbone"
          onChange={(event, data) => {
            this.setState({ value: data.value });
            setDemoState({ backbone: data.value });
          }}
        />
        {this.state.value}
      </span>
    );
  }
}
```

```js
<BackBoneInput setDemoState={setDemoState} />
```

Demonstrates use of backbone with BioBrick parts.

### Viewer Type

```js
const viewerTypeOptions = [
  { key: "both", value: "both", text: "Both" },
  { key: "circular", value: "circular", text: "Circular" },
  { key: "linear", value: "linear", text: "Linear" }
];

export class ViewerTypeInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <div>
        Viewer Type:
        <br />
        <br />
        <Dropdown
          defaultValue="both"
          fluid
          selection
          options={viewerTypeOptions}
          onChange={(event, data) => {
            setDemoState({ viewType: data.value });
          }}
        />
      </div>
    );
  }
}
```

```js
<ViewerTypeInput setDemoState={setDemoState} />
```

Demonstrates selecting the type of viewer to show the sequence in.

### Zoom Linear

```js
export class LinearZoomInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <div>
        Zoom Linear:
        <br />
        <br />
        <input
          type="range"
          min="1"
          max="100"
          defaultValue="50"
          onChange={e => {
            setDemoState({ lzoom: e.target.value });
          }}
          className="slider"
          id="lzoom"
        />
      </div>
    );
  }
}
```

```js
<LinearZoomInput setDemoState={setDemoState} />
```

Demonstrates zooming the linear viewer.

### Search Query

```js
export class SearchQueryInput extends Component {
  render() {
    const {
      setDemoState,
      searchResults: { searchResults = [] }
    } = this.props;
    return (
      <div>
        <Input
          fluid
          icon="search"
          placeholder="Search..."
          onChange={(event, data) => {
            setDemoState({ query: data.value });
          }}
        />
        <br />
        {searchResults.length} results
      </div>
    );
  }
}
```

```js
<SearchQueryInput
  setDemoState={setDemoState}
  searchResults={this.props.searchResults}
/>
```

Demonstrates searching for a sequence string in the linear viewer.

### Search Results Count

```js
export class SearchQueryInput extends Component {
  render() {
    const {
      setDemoState,
      searchResults: { searchResults = [] }
    } = this.props;
    return (
      <div>
        <Input
          fluid
          icon="search"
          placeholder="Search..."
          onChange={(event, data) => {
            setDemoState({ query: data.value });
          }}
        />
        <br />
        {searchResults.length} results
      </div>
    );
  }
}
```

```js
onSelection: selection => {
  setDemoState({ selection: selection });
};
```

Demonstrates the onSearch hook which exposes the results of your search in an object.

### Auto-annotate

```js
export class CheckboxInput extends Component {
  render() {
    const { name, label, setDemoState } = this.props;
    return (
      <Checkbox
        toggle
        defaultChecked
        name={name}
        label={label}
        onChange={(event, data) => {
          setDemoState({ [name]: data.checked });
        }}
      />
    );
  }
}
```

```js
<CheckboxInput
  setDemoState={setDemoState}
  name="annotate"
  label="Auto-annotate"
/>
```

Demonstrates fetching annotations from our lambda endpoint. On by default. Needs to be turned on to see iGem prefix and suffix annotations (because that information is not stored in the BioBricks).

### Show Annotations

```js
export class CheckboxInput extends Component {
  render() {
    const { name, label, setDemoState } = this.props;
    return (
      <Checkbox
        toggle
        defaultChecked
        name={name}
        label={label}
        onChange={(event, data) => {
          setDemoState({ [name]: data.checked });
        }}
      />
    );
  }
}
```

```js
<CheckboxInput
  setDemoState={setDemoState}
  name="annotations"
  label="Show annotations"
/>
```

Demonstrates turning on and off showing annotations on the viewers. On by default. Turn off if you just want to inspect the sequence base pairs.

### Show Complement

```js
export class CheckboxInput extends Component {
  render() {
    const { name, label, setDemoState } = this.props;
    return (
      <Checkbox
        toggle
        defaultChecked
        name={name}
        label={label}
        onChange={(event, data) => {
          setDemoState({ [name]: data.checked });
        }}
      />
    );
  }
}
```

```js
<CheckboxInput
  setDemoState={setDemoState}
  name="complement"
  label="Show complement"
/>
```

Demonstrates turning on and off the complement strand in the viewers. On by default. Turn off if you just want to inspect the sequence strand.

### Show Axis

```js
export class CheckboxInput extends Component {
  render() {
    const { name, label, setDemoState } = this.props;
    return (
      <Checkbox
        toggle
        defaultChecked
        name={name}
        label={label}
        onChange={(event, data) => {
          setDemoState({ [name]: data.checked });
        }}
      />
    );
  }
}
```

```js
<CheckboxInput setDemoState={setDemoState} name="index" label="Show axis" />
```

Demonstrates turning on and off the axis in the viewers. On by default. Turn off if you don’t need to see the base pair numbers.

### Enzymes

```js
export class EnzymeInput extends Component {
  render() {
    const { setDemoState } = this.props;
    return (
      <div>
        Enzymes:
        <Dropdown
          placeholder="Select enzymes"
          fluid
          multiple
          selection
          options={enzymeOptions}
          onChange={(event, data) => {
            setDemoState({ enzymes: data.value });
          }}
        />
      </div>
    );
  }
}
```

```js
<EnzymeInput setDemoState={setDemoState} />
```

Demonstrates searching for enzyme cut sites on the viewers. Input is a multi-select so you can choose any combination of the enzymes to search for.

### Selection Information

```js
export class SelectionInfo extends Component {
  render() {
    const { selection } = this.props;
    const { feature, selectionMeta, sequenceMeta } = selection;

    return (
      selection && (
        <div>
          <div id="selection-name">{feature ? feature.name : ""}</div>
          {selectionMeta && (
            <div id="selection-meta">
              {feature && feature.type && (
                <span id="selection-type">{feature.type}</span>
              )}
              <span id="selection-length">
                {selectionMeta.selectionLength}bp
              </span>
              <span id="selection-range">
                ({selectionMeta.start} -{selectionMeta.end})
              </span>
            </div>
          )}
          {sequenceMeta && (
            <div id="sequence-meta">
              <span id="selection-label">GC:</span>
              <span id="sequence-gc">{sequenceMeta.GC.toPrecision(2)}%</span>
              <span id="selection-label">Tm:</span>
              <span id="sequence-tm">{sequenceMeta.Tm.toPrecision(2)}°C</span>
            </div>
          )}
        </div>
      )
    );
  }
}
```

```js
onSearch: results => {
  setDemoState({ searchResults: results });
};
```

Demonstrates the onSelection hook which exposes information about your sequence selection on the viewer.

## Final Viewer Instantiation ([HTML](https://github.com/Lattice-Automation/seqviz-demo/blob/simple-ui/README.md#final-viewer-instantiation-html--semantic) | <b>Semantic</b>)

```js
const viewer = lattice.Viewer("demo-root", {
  part: part,
  backbone: backbone,
  viewer: viewType,
  annotate: annotate,
  showAnnotations: annotations,
  showComplement: complement,
  showIndex: index,
  zoom: { linear: lzoom },
  onSelection: selection => {
    setDemoState({ selection: selection });
  },
  onSearch: results => {
    setDemoState({ searchResults: results });
  },
  searchQuery: { query: query },
  enzymes: Object.values(enzymes)
});
```

The Semantic UI Demo returns the react component for the viewer via `viewe.viewer` so that the viewer can be rendered with the rest of the React application (see the `SideBarMenu` class in `App.js`).
