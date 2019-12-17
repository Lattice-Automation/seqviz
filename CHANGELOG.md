# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Change copySeq option to copyEvent, a far simpler filter function on KeyboardEvents
- Change searchNext option to searchEvent, a far simpler filter function on KeyboardEvents
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
