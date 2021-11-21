const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
let BundleAnalyzerPlugin = require("webpack-bundle-analyzer");
BundleAnalyzerPlugin = BundleAnalyzerPlugin.BundleAnalyzerPlugin;

const PACKAGE = require("../package.json");

const VERSION = PACKAGE.version;
const AUTHOR = PACKAGE.author;
const packageName = PACKAGE.name;
const libraryName = "seqviz";
const banner = `${libraryName} - ${packageName} - ${VERSION} \nprovided and maintained by ${AUTHOR} \nLICENSE MIT`;

const cdnBuild = {
  entry: path.join(__dirname, "..", "src", "viewer.ts"),
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
    extensions: ["", ".ts", ".tsx", ".js", ".jsx"]
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty"
  },
  module: {
    rules: [
      // changed from { test: /\.jsx?$/, use: { loader: 'babel-loader' }, exclude: /node_modules/ },
      { test: /\.(t|j)sx?$/, use: { loader: "ts-loader" }, exclude: /node_modules/ },
      // addition - add source-map support
      { enforce: "pre", test: /\.js$/, exclude: /node_modules/, loader: "source-map-loader" },
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
        test: /\.(css)$/,
        exclude: /node_modules/,
        use: ["style-loader", "css-loader"]
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
    new webpack.BannerPlugin(banner)
    // new BundleAnalyzerPlugin({ defaultSizes: "stat" })
  ],
  optimization: {
    nodeEnv: "production",
    minimize: true
    // concatenateModules: true
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
  externals: [nodeExternals({ modulesDir: path.join(__dirname, "..", "node_modules") })]
});

module.exports = [cdnBuild, npmBuild];
