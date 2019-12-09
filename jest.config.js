module.exports = {
  verbose: true,
  browser: true,
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|scss|less)$": "<rootDir>/__mocks__/styleMock.js"
  },
  setupFiles: ["<rootDir>/jest.init.js"]
};
