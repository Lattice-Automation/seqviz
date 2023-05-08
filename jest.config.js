module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  setupFiles: ["<rootDir>/src/jest.js"],
  testEnvironment: "jsdom",
};
