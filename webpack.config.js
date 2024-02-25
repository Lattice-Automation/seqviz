const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

const package = require("./package.json");

/**
 * cdnBuild is the webpack config for distributing SeqViz to unpkg. It bundles the viewer with all its dependencies.
 */
const cdnBuild = {
  entry: path.join(__dirname, "src", "index.ts"),
  target: "web",
  mode: "production",
  module: {
    rules: [
      { test: /\.(t|j)sx?$/, loader: "ts-loader", exclude: /node_modules/ },
      { test: /\.js$/, enforce: "pre", loader: "source-map-loader", exclude: /node_modules/ }
    ],
  },
  optimization: {
    concatenateModules: false,
    minimize: true,
    nodeEnv: "production",
  },
  output: {
    globalObject: "this",
    filename: "seqviz.min.js",
    library: {
      name: package.name,
      type: "umd",
    },
    path: path.join(__dirname, "dist"),
    publicPath: "/dist/",
    umdNamedDefine: true,
  },
  plugins: [
    new webpack.BannerPlugin(
      `${package.name} - ${package.version} \nprovided and maintained by ${package.author} \nLICENSE MIT`
    ),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    fallback: {
      buffer: require.resolve("buffer"),
      fs: false,
      net: false,
      tls: false,
      path: require.resolve("path-browserify"),
      string_decoder: require.resolve("string_decoder"),
      stream: require.resolve("stream-browserify"),
      timers: require.resolve("timers-browserify"),
      url: require.resolve("url"),
    },
  },
};

/**
 * npmBuild is the same as CDN build except node_modules are ignored as externals and the output filename differs.
 */
const npmBuild = Object.assign({}, cdnBuild, {
  mode: "none",
  devtool: "source-map",
  optimization: {
    minimize: false,
  },
  output: {
    globalObject: "this",
    filename: "index.js",
    library: {
      name: package.name,
      type: "umd",
    },
    path: path.join(__dirname, "dist"),
    publicPath: "/dist/",
    umdNamedDefine: true,
  },
  externals: [nodeExternals({ modulesDir: path.join(__dirname, "node_modules") })],
});

module.exports = [cdnBuild, npmBuild];
