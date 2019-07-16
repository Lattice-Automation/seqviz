# seqviz Demos

This folder contains demonstrations of the SeqViz DNA sequence visualizer provided by Lattice. See [Lattice-Automation/seqviz](https://github.com/Lattice-Automation/seqviz) for the primary library documentation.

## Running in Development

To run the demos locally, clone the [SeqViz library](https://github.com/Lattice-Automation/seqviz) and `cd` to the folder of the demo you want to run. Then use `npm install` to install the demo and `npm start` to spin up a local copy.

The demo will be running the latest version of the SeqViz library, but you can change the version you want to demo in the `index.html` file by modifying the line that looks like this:

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

# Pick Your Integration

[HTML Demo](https://github.com/Lattice-Automation/seqviz/tree/master/demo/simple-ui/README.md) | [Semantic UI Demo](https://github.com/Lattice-Automation/seqviz/tree/master/demo/semantic-ui/README.md)

There are currently two Demos.

The <b>HTML Demo</b> is an example of using the library with minimal setup. All the configuration is localized to the `index.html` file. The user interface is simple `HTML`, the styling is `CSS` and the configuration is vanilla `Javascript` so no external libraries are required. This demo uses the `ReactDOM` renderer packaged with the library to render the viewer. No external renderers are required to show just the library's viewer. The external renderer (provided by the demo's Create React App set up) is used to render the html input fields and the other UI wrappers around the viewer.

The <b>Semantic UI Demo</b> is an example of using the library in a React application. The user interface is written in `React` with all of the components in the `App.js` file. Styling is done with the `Semantic-UI` library with customizations in the `App.css` file. Configurations are done in the `App.js` file. This demo uses an external renderer (provided by the demo's Create React App set up) to render the viewer along with all of the UI wrappers.
