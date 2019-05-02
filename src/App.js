import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import PartExplorer from "../src/PartExplorer/PartExplorer";
import pUC from "./DefaultParts/pUC";
const Viewer = () => {
  return (
    <Router>
      <div>
        <Route exact path="/" component={Circular} />
        <Route path="/linear" component={Linear} />
      </div>
    </Router>
  );
};

const Circular = () => {
  const part = pUC;
  return <PartExplorer circular={true} part={part} />;
};

const Linear = () => {
  const part = pUC;
  return <PartExplorer circular={false} part={part} />;
};

export default Viewer;
