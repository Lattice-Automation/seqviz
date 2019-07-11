# seqviz Demo

A demonstration of the DNA Sequence Visualizer provided by Lattice. Visit [Lattice-Automation/seqviz](https://github.com/Lattice-Automation/seqviz) to see the source code and contribute.

## Running in Development

To run a local copy of this demo, clone the repository, and then run `npm install` and `npm start` in the directory.

The demo is bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To change the version of `seqviz` you run in the demo change the last part in the script import in [`public/index.html`](https://github.com/Lattice-Automation/seqviz-demo/blob/simple-ui/public/index.html)

`<script src="https://cdn.latticeautomation.com/libs/seqviz/0.2.0/seqviz.min.js"></script>`

The example above is running `version 0.2.0`. Alternatively you can run the demo from a local copy of the compiled seqviz. If you download the `version 0.2.0` script for example you can run the app with just

`<script src="%PUBLIC_URL%/seqviz.min.js"></script>`

provided the copy of the compiled seqviz code is in the same repository as the `index.html` file.

To check what the version of your downloaded library is, open the `seqviz.min.js` file and see the header

```js
/*!
 * lattice - seqviz - 0.2.0
 * provided and maintained by Lattice Automation (https://latticeautomation.com/)
 */
```

### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

If something is already running on your port 3000 Create React App will ask if you want to run the demo on the next port up (3001 and then 3002, etc.). In those cases, you can view the demo at the specified port.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

# Pick Your Integration

[HTML Demo](https://github.com/Lattice-Automation/seqviz-demo/blob/simple-ui/README.md) | [Semantic UI Demo](https://github.com/Lattice-Automation/seqviz-demo/blob/semantic-ui/README.md)

The Demo is currently provided in two versions.

The <b>HTML Demo</b> is an example of using the library with minimal setup. All the configuration is localized to the `index.html` file. The user interface is simple `HTML`, the styling is `CSS` and the configuration is vanilla `Javascript` so no external libraries are required. This demo uses the `ReactDOM` renderer packaged with the library to render the viewer. No external renderers are required to show just the library's viewer. The external renderer (provided by the demo's Create React App set up) is used to render the html input fields and the other UI wrappers around the viewer.

The <b>Semantic UI Demo</b> is an example of using the library in a React application. The user interface is written in `React` with all of the components in the `App.js` file. Styling is done with the `Semantic-UI` library with customizations in the `App.css` file. Configurations are done in the `App.js` file. This demo uses an external renderer (provided by the demo's Create React App set up) to render the viewer along with all of the UI wrappers.
