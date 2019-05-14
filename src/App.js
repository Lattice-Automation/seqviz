import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import React from "react";
import PartExplorer from "./PartExplorer/PartExplorer.jsx";
import { SizeMe } from "react-sizeme";
import sizeMe from "react-sizeme";
import "./App.scss";

sizeMe.noPlaceholders = true;
const Viewer = (element, part, options) => {
  const { annotate, circular, onSelection } = options;
  const viewer = (
    <SizeMe
      monitorHeight
      render={({ size }) => {
        return (
          <PartExplorer
            circular={circular}
            part={part}
            annotate={annotate}
            onSelection={onSelection}
            size={size}
          />
        );
      }}
    />
  );
  const viewerHTML = ReactDOMServer.renderToStaticMarkup(viewer);
  const render = () => {
    ReactDOM.render(viewer, document.getElementById(element));
  };
  return { viewer: viewerHTML, render: render };
};

export default Viewer;
