import * as serviceWorker from "./serviceWorker";
import "semantic-ui-less/semantic.less";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom";

import { Demo } from "./App";

ReactDOM.render(<Demo />, document.getElementById("demo-root"));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
