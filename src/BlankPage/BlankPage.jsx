import blankImg from "../assets/empty-workspace-graphic-color.svg";
import React from "react";
import "./BlankPage.scss";

/**
 * Blank Page
 */
const BlankPage = () => (
  <div id="BlankPage">
    <img id="splash" src={blankImg} alt="Workspace" />
  </div>
);

export default BlankPage;
