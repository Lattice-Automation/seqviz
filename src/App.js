import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PartExplorer from "./PartExplorer/PartExplorer";
let lattice = {};
const Viewer = (part, options) => {
  const { annotate } = options;
  return (
    <Router>
      <div>
        <Route
          exact
          path="/"
          render={props => (
            <Circular {...props} part={part} annotate={annotate} />
          )}
        />
        <Route
          path="/linear"
          render={props => (
            <Linear {...props} part={part} annotate={annotate} />
          )}
        />
      </div>
    </Router>
  );
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
