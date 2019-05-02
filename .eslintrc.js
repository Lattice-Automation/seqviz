module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: "airbnb",
  parser: babel - eslint,
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2016,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    indent: ["error", "tab"],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"]
  }
};
