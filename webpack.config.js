const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");
const PACKAGE = require("./package.json");

const VERSION = PACKAGE.version;
const AUTHOR = PACKAGE.author;
const packageName = PACKAGE.name;
const libraryName = "seqviz";
const fileName = `${packageName}.min.js`;
const banner = `${libraryName} - ${packageName} - ${VERSION} \nprovided and maintained by ${AUTHOR} \nLICENSE MIT`;

module.exports = {
  entry: "./src/viewer.js",
  output: {
    filename: fileName,
    library: libraryName,
    libraryTarget: "window"
  },
  mode: "production",
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  node: {
    fs: "empty"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader"
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|webp|svg)(\?.*)?$/,
        exclude: /node_modules/,
        use: [
          "file-loader",
          {
            loader: "image-webpack-loader"
          }
        ]
      },
      {
        test: /\.(css|scss)$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  },
  plugins: [new UglifyJsPlugin(), new webpack.BannerPlugin(banner)]
};
