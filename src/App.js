import React from "react";
import PartExplorer from "./PartExplorer/PartExplorer";
import "./App.scss";

let lattice = {};
const Viewer = (part, options) => {
  const { annotate, circular } = options;
  if (circular) {
    return <Circular part={part} annotate={annotate} />;
  } else {
    return <Linear part={part} annotate={annotate} />;
  }
};

const Circular = props => {
  const { part, annotate } = props;
  return <PartExplorer circular={true} part={part} annotate={annotate} />;
};

const Linear = props => {
  const { part, annotate } = props;
  return <PartExplorer circular={false} part={part} annotate={annotate} />;
};
lattice.Viewer = Viewer;
export default lattice;
