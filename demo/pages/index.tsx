import dynamic from "next/dynamic";
import * as React from "react";

const App = dynamic(() => import("../lib/App"), {
  ssr: false,
});

export default () => <App />;
