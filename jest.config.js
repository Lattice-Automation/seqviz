module.exports = {
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
  },
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/src/jest.js"],
  testEnvironment: "jsdom",
};
