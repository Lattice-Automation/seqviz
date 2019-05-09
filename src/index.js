import VIEWER from "./App";
import PUC from "./DefaultParts/pUC";

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
