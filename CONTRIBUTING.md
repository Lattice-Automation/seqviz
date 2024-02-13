# Contributing

This is living document describing how to contribute to SeqViz.

## Development

The sections below describe setting up the development environment and opening a PR against the `develop` branch.

### Setup

Before making or PR'ing changes, please set up and experiment with the demo application. Steps for doing that are described below.

Install `seqviz` packages in the repository and repository's demo directories:

```bash
# seqviz
npm i
cd ./demo
npm i
```

Start the demo application:

```bash
npm run start
```

Visit the demo application at [http://localhost:3010](http://localhost:3010) and experiment with sequence selection, clicking annotations, rotating the circular viewer, etc. As much as possible, try to validate that your change does not break existing functionality. The testing of `seqviz` is sparse; we rely on the demo application to catch regressions.

### PR

After making a change, open a PR against the `develop` branch and get it approved and merged by someone who works at Lattice Automation or [@jjti](https://github.com/jjti). They will merge it and cut a release.
