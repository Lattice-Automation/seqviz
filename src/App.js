import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import React from "react";
import PartExplorer from "./PartExplorer/PartExplorer.jsx";
import "./App.scss";

const Viewer = (element, part, options) => {
  const displayConfig = (displayPart, displayOptions) => {
    const {
      annotate,
      viewer: viewerType,
      showAnnotations,
      showComplement,
      showIndex,
      colors,
      zoom,
      backbone,
      searchQuery: { query, mismatch }
    } = displayOptions;

    const displayName = displayPart.name
      ? displayPart.name
      : displayPart.constructor.name === "FileList"
      ? displayPart[0].name
      : displayPart;
    const displayType = viewerType;
    const displayAnnotate = annotate ? "on" : "off";
    const displayAnnotations = showAnnotations ? "on" : "off";
    const displayComplement = showComplement ? "on" : "off";
    const displayIndex = showIndex ? "on" : "off";
    const displayCustomColors = colors.length ? "yes" : "no";
    const displayZoomCircular = zoom.circular;
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
    Current Visualizer Settings:
        Viewer Type: ${displayType} (circular | linear | both)
        Auto-annotation: ${displayAnnotate}
        Show Annotations: ${displayAnnotations}
        Show Complement: ${displayComplement}
        Show Index: ${displayIndex}
        Using Custom Colors: ${displayCustomColors}
        Circular Zoom: ${displayZoomCircular} (0 . 100)
        Linear Zoom: ${displayZoomLinear} (-50 . 50)
        Searching for sequence "${query}" with ${mismatch} mismatch allowance
        ${displayBackbone}
    =====================================================
    `
    );
  };

  const viewer = <PartExplorer part={part} {...options} />;
  const viewerHTML = ReactDOMServer.renderToStaticMarkup(viewer);

  const domElement =
    element.constructor.name.startsWith("HTML") &&
    element.constructor.name.endsWith("Element")
      ? element
      : document.getElementById(element);

  const render = () => {
    ReactDOM.render(viewer, domElement);
  };

  const setPart = newPart => {
    const viewer = <PartExplorer part={newPart} {...options} />;
    const viewerHTML = ReactDOMServer.renderToStaticMarkup(viewer);

    const domElement =
      element.constructor.name.startsWith("HTML") &&
      element.constructor.name.endsWith("Element")
        ? element
        : document.getElementById(element);

    const render = () => {
      ReactDOM.render(viewer, domElement);
    };
    displayConfig(newPart, options);
    return {
      viewer: viewerHTML,
      render: render,
      setPart: setPart,
      setOptions: setOptions
    };
  };

  const setOptions = newOptions => {
    const OPTIONS = { ...options, ...newOptions };
    const viewer = <PartExplorer part={part} {...OPTIONS} />;
    const viewerHTML = ReactDOMServer.renderToStaticMarkup(viewer);

    const domElement =
      element.constructor.name.startsWith("HTML") &&
      element.constructor.name.endsWith("Element")
        ? element
        : document.getElementById(element);

    const render = () => {
      ReactDOM.render(viewer, domElement);
    };
    displayConfig(part, OPTIONS);
    return {
      viewer: viewerHTML,
      render: render,
      setPart: setPart,
      setOptions: setOptions
    };
  };

  displayConfig(part, options);
  return {
    viewer: viewerHTML,
    render: render,
    setPart: setPart,
    setOptions: setOptions
  };
};

export default Viewer;
