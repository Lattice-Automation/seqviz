import * as React from "react";
import Head from "next/head";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { AppProps } from "next/app";

import "../styles/global.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#14b7db",
    },
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto Mono, Monaco, monospace",
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>SeqViz - by Lattice Automation</title>

        <link rel="icon" href="/seqviz/favicon.ico" />
        <meta name="Description" content="DNA Sequence Visualizer by Lattice Automation" />
        <meta name="google" content="notranslate" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

