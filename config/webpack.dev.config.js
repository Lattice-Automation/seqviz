const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const base = require("./webpack.config");

/**
 * Webpack dev config for local development
 *
 * Sources for below:
 * - https://webpack.js.org/configuration/dev-server/
 * - https://imranhsayed.medium.com/set-up-react-app-with-webpack-webpack-dev-server-and-babel-from-scratch-df398174446d
 */
module.exports = {
  ...base[0],
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.resolve(__dirname, "..", "dist"),
    },
    port: 9000,
  },
  entry: {
    index: path.join(__dirname, "..", "src", "dev", "index.tsx"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.join(__dirname, "..", "src", "dev", "index.html"),
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "..", "dist"),
    clean: true,
    publicPath: "/",
  },
  optimization: {
    runtimeChunk: "single",
  },
};
