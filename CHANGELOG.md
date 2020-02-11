# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.17]

### Added

- Integration tests for file inputs.
- React E2E testing in viewer.test.jsx

### Fixed

- SnapGene file parsing. It wasn't traversing the SnapGene ArrayBuffer fully.

## [3.0.16]

### Fixed

- Issue where annotations weren't being passed down from external sources like iGEM or NCBI

## [3.0.15]

### Added

- `options.style`/`props.style` that's given to the top-level container div of SeqViz. Useful for setting high manually if the parent div doesn't have height.
- Description of `options.style` to the README.md

### Changed

- Shortened the height of selection edges in Linear. Their bottom should now align with the bottom of ticks
- Narrowed tick width and tick font weight to match the Linear viewer
- Zoom calculation so zooms outside the [0, 100] range are brought to within it
- render and setState both return the React Component, where they returned nothing before

### Fixed

- Alignment of tick labels in Circular to add Firefox support

## [3.0.14]

### Fixed

- Default for annotations array changed to an empty array, instead of null. Was breaking when annotations weren't provided

## [3.0.10]

### Changed

- Add a CDN build output, in dist/seqviz.min.js, that's pointed to for UNPKG installation

## [3.0.0]

### Changed

- Change copySeq option to copyEvent: a simpler filter function on KeyboardEvents (README)
- Change "options.searchQuery" to "options.search" (README)
- Flatten the selection object. It's now a single object, no nesting. Change GC and Tm to lowercase. Example of new selection object (passed during `options.onSelection`) is below:

```json
{
  // selection
  "name": "lacZ fragment",
  "type": "ANNOTATION",
  "seq": "ctatgcggcatcagagcagattgtactgagagtgcaccatatgcggtgtgaaataccgcacagatgcgtaaggagaaaataccgcatcaggcgccattcgccattcaggctgcgcaactgttgggaagggcgatcggtgcgggcctcttcgctattacgccagctggcgaaagggggatgtgctgcaaggcgattaagttgggtaacgccagggttttcccagtcacgacgttgtaaaacgacggccagtgccaagcttgcatgcctgcaggtcgactctagaggatccccgggtaccgagctcgaattcgtaatcatggtcat",
  "gc": 55.3,
  "tm": 85,
  "start": 133,
  "end": 457,
  "length": 324,
  "direction": -1,
  "clockwise": true,
  "color": "#8FDE8C"
}
```

- Improve performance of selection events. Should now be almost instantaneous
- Reduce initial number of bp shown in a Linear SeqBlock

### Removed

- searchNext from options. No longer differentiating between "active" and non-active search results

## [2.0.2]

### Added

- Add this Changelog

## [2.0.1]

### Fixed

- Change demo's seqviz dependency to `latest`

## [2.0.0]

### Changed

- Refactor direction property, in annotations, translations, searchResults, to -1, 0, 1, from "REVERSE", "NONE", and "FORWARD", respectively
  - the string enums are still supported, but they're no longer the default
- Change the `row` property of searchResults to `direction` (either 1 or -1, for FWD or REV). Example below of a `searchResults` object from `options.onSearch()`:

```json
{
  "searchResults": [
    {
      "start": 728,
      "end": 733,
      "direction": 1,
      "index": 0
    },
    {
      "start": 1788,
      "end": 1793,
      "direction": -1,
      "index": 1
    }
  ],
  "searchIndex": 0
}
```

- Overhaul the README.md to match the changes above and add examples of translations, annotations, functions

### Removed

- Remove the `showAnnotations` options/prop. To avoid rendering `annotations`, we ask users to simply not provide `options.annotations` to the viewer
