module.exports = {
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
  },
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  setupFiles: ["./config/jest/setup.js"],
  testEnvironment: "jsdom",
};
