const { getLoader, loaderByName, throwUnexpectedConfigError } = require("@craco/craco");

module.exports = {
  webpack: {
    alias: {
      "../../theme.config$": require("path").join(__dirname, "/src/semantic-ui/theme.config"),
    },
  },
  plugins: [
    { plugin: require("craco-less") },
    { plugin: require("@semantic-ui-react/craco-less") },
    {
      plugin: {
        overrideWebpackConfig: ({ context, webpackConfig }) => {
          const { isFound, match: fileLoaderMatch } = getLoader(webpackConfig, loaderByName("file-loader"));

          if (!isFound) {
            throwUnexpectedConfigError({
              message: `Can't find file-loader in the ${context.env} webpack config!`,
            });
          }

          fileLoaderMatch.loader.exclude.push(/theme.config$/);
          fileLoaderMatch.loader.exclude.push(/\.variables$/);
          fileLoaderMatch.loader.exclude.push(/\.overrides$/);

          return webpackConfig;
        },
      },
    },
  ],
};
