import React from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import PartExplorer from "./PartExplorer/PartExplorer.jsx";
import "./App.scss";

const Viewer = (element, part, options) => {
  const displayConfiguration = false;

  const viewer = <PartExplorer part={part} {...options} />;
  const viewerHTML = ReactDOMServer.renderToString(viewer);

  const domElement =
    element.constructor.name.startsWith("HTML") &&
    element.constructor.name.endsWith("Element")
      ? element
      : document.getElementById(element);

  if (displayConfiguration) {
    const {
      annotate,
      viewer: viewerType,
      showAnnotations,
      showPrimers,
      showComplement,
      showIndex,
      colors,
      zoom,
      backbone,
      searchQuery: { query, mismatch },
      enzymes
    } = options;

    const displayName = part.name
      ? part.name
      : part.constructor.name === "FileList"
      ? part[0].name
      : part;
    const displayType = viewerType;
    const displayAnnotate = annotate ? "on" : "off";
    const displayAnnotations = showAnnotations ? "on" : "off";
    const displayPrimers = showPrimers ? "on" : "off";
    const displayComplement = showComplement ? "on" : "off";
    const displayIndex = showIndex ? "on" : "off";
    const displayCustomColors = colors.length ? "yes" : "no";
    const displayZoomLinear =
      zoom.linear > 50
        ? zoom.linear - 50
        : zoom.linear < 50
        ? 0 - (50 - zoom.linear)
        : 0;
    const displayBackbone =
      displayName.startsWith("BB") && backbone.length
        ? `BioBrick Backbone : ${backbone}`
        : "";
    console.log(
      `
    ====================================================
    Current Part: ${displayName}
    Current seqviz Settings:
        Viewer Type: ${displayType} (circular | linear | both)
        Auto-annotation: ${displayAnnotate}
        Show Annotations: ${displayAnnotations}
        Show Primers: ${displayPrimers}
        Show Complement: ${displayComplement}
        Show Index: ${displayIndex}
        Using Custom Colors: ${displayCustomColors}
        Linear Zoom: ${displayZoomLinear} (-50 . 50)
        Searching for sequence "${query}" with ${mismatch} mismatch allowance
        Showing cut sites for enzymes: ${enzymes}
        ${displayBackbone}
    =====================================================
    `
    );
    if (viewerType === "circular" && query !== "") {
      console.warn(
        "Search visualization is only supported in Linear Sequence View."
      );
    }
  }

  return {
    viewer: viewer,
    viewerHTML: viewerHTML,
    render: () => {
      ReactDOM.render(viewer, domElement);
    }
  };
};

export default Viewer;
