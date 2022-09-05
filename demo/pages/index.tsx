import dynamic from "next/dynamic";
import Head from "next/head";
import * as React from "react";

const Demo = dynamic(() => import("../lib/Demo"), {
  ssr: false,
});

export default () => (
  <React.Fragment>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />

      <title>seqviz - Sequence Visualizer by Lattice Automation</title>
      <link rel="shortcut icon" type="image/x-icon" href="https://tools.latticeautomation.com/seqviz/favicon.ico" />
      <meta name="Description" content="DNA Sequence Visualizer by Lattice Automation" />
      <meta name="google" content="notranslate" />

      {/* <!-- IMPORT SEMANTIC-UI-REACT --> */}
      <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />

      {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=UA-135275522-2"></script>
    </Head>

    <Demo />
  </React.Fragment>
);
