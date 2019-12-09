module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    es6: true,
    node: true
  },
  plugins: ["prettier", "react"],
  rules: {
    "prettier/prettier": "error"
  },
  extends: [
    "plugin:prettier/recommended",
    "prettier/react",
    "plugin:react/recommended"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2016,
    sourceType: "module"
  },
  settings: {
    react: {
      pragma: "React", // Pragma to use, default to "React"
      version: "detect"
    }
  }
};
