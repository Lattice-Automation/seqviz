import { Head, Html, Main, NextScript } from "next/document";
import Script from "next/script";
import * as React from "react";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="shortcut icon" type="image/x-icon" href="https://tools.latticeautomation.com/seqviz/favicon.ico" />

        {/* <!-- IMPORT SEMANTIC-UI-REACT --> */}
        <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />

        {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=UA-135275522-2"></Script>
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
