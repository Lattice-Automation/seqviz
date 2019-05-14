import "babel-polyfill";
import VIEWER from "./App";
import PUC from "./DefaultParts/pUC";

/**
 * CODE TO TEST VIEWER
 */
// import "./index.css";
// const viewer = VIEWER("app-root", PUC, {
//   annotate: true,
//   circular: false,
//   onSelection: selection => {
//     console.log("Your Selection: ", selection);
//   }
// });
// viewer.render();

export const pUC = () => {
  return PUC;
};

export const Viewer = (element = "root", ViewerOptions) => {
  const {
    part = null,
    annotate = false,
    viewer = "circular",
    onSelection = params => {
      console.log("no custom selection functionality yet");
    }
  } = ViewerOptions;
  const circular = viewer === "circular";
  return VIEWER(element, part, {
    annotate: annotate,
    circular: circular,
    onSelection: onSelection
  });
};
