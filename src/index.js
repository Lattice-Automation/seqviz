import ReactDOM from "react-dom";
import "./index.scss";
import lattice from "./App";
import * as serviceWorker from "./serviceWorker";
import pUC from "./DefaultParts/pUC";

const part = pUC;

ReactDOM.render(
  lattice.Viewer(part, { annotate: false }),
  document.getElementById("app-root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
