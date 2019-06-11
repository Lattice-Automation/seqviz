import ReactDOM from "react-dom";
import PUC from "./DefaultParts/pUC";
import App from "./App";

it("renders without crashing", () => {
  const div = document.createElement("div");
  let viewer = App(div, PUC, {
    annotate: true,
    viewer: "both",
    showAnnotations: true,
    showComplement: true,
    showIndex: true,
    zoom: { linear: 50 },
    colors: [],
    onSelection: selection => {
      console.log("Your Selection: ", selection);
    },
    onSearch: results => {
      console.log("Your Search Results: ", results);
    },
    searchNext: {
      key: "a",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    searchQuery: { query: "GCGG" },
    backbone: "",
    enzymes: []
  });
  ReactDOM.render(viewer.viewer, div);
  ReactDOM.unmountComponentAtNode(div);
});
