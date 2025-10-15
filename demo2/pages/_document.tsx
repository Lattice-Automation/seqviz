import * as React from "react";
import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";
import { DocumentHeadTags, documentGetInitialProps } from "@mui/material-nextjs/v14-pagesRouter";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <DocumentHeadTags {...this.props} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};

