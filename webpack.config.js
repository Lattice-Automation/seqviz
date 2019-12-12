const path = require("path");
const webpack = require("webpack");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const PACKAGE = require("./package.json");

const VERSION = PACKAGE.version;
const AUTHOR = PACKAGE.author;
const packageName = PACKAGE.name;
const libraryName = "seqviz";
const banner = `${libraryName} - ${packageName} - ${VERSION} \nprovided and maintained by ${AUTHOR} \nLICENSE MIT`;

module.exports = {
  entry: "./src/viewer.js",
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "seqviz.min.js",
    library: libraryName,
    libraryTarget: "umd",
    publicPath: "/dist/",
    umdNamedDefine: true
  },
  mode: "production",
  resolve: {
    extensions: ["", ".js", ".jsx"]
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
          plugins: [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-proposal-object-rest-spread",
            "babel-plugin-module-resolver",
            "babel-plugin-transform-imports",
            "lodash"
          ]
        }
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
  resolve: {
    alias: {
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom")
    }
  },
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "React",
      root: "React"
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "ReactDOM",
      root: "ReactDOM"
    }
  },
  plugins: [
    new UglifyJsPlugin(),
    new webpack.BannerPlugin(banner),
    new LodashModuleReplacementPlugin()
  ]
};
