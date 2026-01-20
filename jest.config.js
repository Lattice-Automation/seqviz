module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/src/jest.js"],
  testEnvironment: "jsdom",
  // Added this because react-resize-detector uses ES Modules which Jest doesn't support.
  transformIgnorePatterns: [
    "node_modules/(?!(@lattice-automation/react-resize-detector)/)",
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "ts-jest",
  },
};
