import ReactDOM from "react-dom";
import React from "react";
import PartExplorer from "./PartExplorer/PartExplorer.jsx";
import "./App.scss";

const Viewer = (element, part, options) => {
  const { annotate, circular, onSelection } = options;
  const viewer = (
    <PartExplorer
      circular={circular}
      part={part}
      annotate={annotate}
      onSelection={onSelection}
    />
  );
  const render = () => {
    ReactDOM.render(viewer, document.getElementById(element));
  };
  return { viewer: viewer, render: render };
};

export default Viewer;
