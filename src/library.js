import "babel-polyfill";
import VIEWER from "./App";
import PUC from "./parts/pUC";

/**
 * Library exports
 */
export const pUC = () => {
  return PUC;
};

export const Viewer = (element = "root", ViewerOptions) => {
  const {
    part = null,
    annotate = false,
    viewer = "both",
    showAnnotations = true,
    showPrimers = true,
    showComplement = true,
    showIndex = true,
    zoom = { circular: 0, linear: 50 },
    colors = [],
    onSelection = selection => {
      return selection;
    },
    onSearch = results => {
      return results;
    },
    searchNext = {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    copySeq = {
      key: "",
      meta: false,
      ctrl: false,
      shift: false,
      alt: false
    },
    searchQuery = { query: "", mismatch: 0 },
    backbone = "",
    enzymes = []
  } = ViewerOptions;

  return VIEWER(element, part, {
    annotate,
    viewer,
    showAnnotations,
    showPrimers,
    showComplement,
    showIndex,
    zoom,
    colors,
    onSelection,
    onSearch,
    searchNext,
    copySeq,
    searchQuery,
    backbone,
    enzymes
  });
};
