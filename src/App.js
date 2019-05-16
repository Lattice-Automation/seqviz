import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import React from "react";
import PartExplorer from "./PartExplorer/PartExplorer.jsx";
import "./App.scss";

const Viewer = (element, part, options) => {
  const {
    annotate,
    viewer: viewerType,
    showAnnotations,
    showComplement,
    showIndex,
    colors,
    zoom
  } = options;
  console.log(
    `
    ====================================================
    Current Part: ${
      part.name
        ? part.name
        : part.constructor.name === "FileList"
        ? part[0].name
        : part
    }
    Current Visualizer Settings:
        Viewer Type: ${viewerType}
        Auto-annotation: ${annotate ? "on" : "off"}
        Show Annotations: ${showAnnotations ? "on" : "off"}
        Show Complement: ${showComplement ? "on" : "off"}
        Show Index: ${showIndex ? "on" : "off"}
        Using Custom Colors: ${colors.length ? "yes" : "no"}
        Circular Zoom: ${
          zoom.circular > 50
            ? zoom.circular
            : zoom.circular < 50
            ? -zoom.circular
            : 0
        }
        Linear Zoom: ${
          zoom.linear > 50 ? zoom.linear : zoom.linear < 50 ? -zoom.linear : 0
        }
    =====================================================
    `
  );
  const viewer = <PartExplorer part={part} {...options} />;
  const viewerHTML = ReactDOMServer.renderToStaticMarkup(viewer);
  const render = () => {
    ReactDOM.render(viewer, document.getElementById(element));
  };
  return { viewer: viewerHTML, render: render };
};

export default Viewer;
