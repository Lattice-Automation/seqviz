const path = require("path");
const webpack = require("webpack");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const nodeExternals = require("webpack-node-externals");

const PACKAGE = require("../package.json");

const VERSION = PACKAGE.version;
const AUTHOR = PACKAGE.author;
const packageName = PACKAGE.name;
const libraryName = "seqviz";
const banner = `${libraryName} - ${packageName} - ${VERSION} \nprovided and maintained by ${AUTHOR} \nLICENSE MIT`;

const cdnBuild = {
  entry: path.join(__dirname, "..", "src", "viewer.js"),
  target: "web",
  output: {
    path: path.join(__dirname, "..", "dist"),
    filename: "seqviz.min.js",
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true,
    publicPath: "/dist/"
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
          presets: [
            ["@babel/preset-env", { modules: false }],
            "@babel/preset-react"
          ],
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
        exclude: /node_modules/,
        use: ["style-loader", "css-loader", "sass-loader"]
      }
    ]
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom")
    }
  },
  plugins: [
    new UglifyJsPlugin(),
    new webpack.BannerPlugin(banner),
    new LodashModuleReplacementPlugin()
    // new BundleAnalyzerPlugin({ defaultSizes: "stat" })
  ],
  optimization: {
    nodeEnv: "production",
    minimize: true,
    concatenateModules: true
  }
};

/**
 * npmBuild, same as CDN build except node_modules are ignored as externals
 * and the output filename differs
 */
const npmBuild = Object.assign({}, cdnBuild, {
  output: {
    path: path.join(__dirname, "..", "dist"),
    filename: "index.js",
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true,
    publicPath: "/dist/"
  },
  externals: [
    nodeExternals({ modulesDir: path.join(__dirname, "..", "node_modules") })
  ],
  plugins: [
    new UglifyJsPlugin(),
    new webpack.BannerPlugin(banner),
    new LodashModuleReplacementPlugin()
    // new BundleAnalyzerPlugin({ defaultSizes: "stat" })
  ]
});

module.exports = [cdnBuild, npmBuild];
