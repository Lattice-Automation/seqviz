import Head from "next/head";
import * as React from "react";
import "semantic-ui-css/semantic.min.css";

import "../styles/global.css";

export default function App({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <title>SeqViz - by Lattice Automation</title>

        <meta name="Description" content="DNA Sequence Visualizer by Lattice Automation" />
        <meta name="google" content="notranslate" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
