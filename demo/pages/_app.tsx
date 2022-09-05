import * as React from "react";
import "semantic-ui-css/semantic.min.css";

import "../styles/global.css";

export default function App({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}
