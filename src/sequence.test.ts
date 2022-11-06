import { guessType } from "./sequence";

describe("Sequence utilities", () => {
  it("detects type", () => {
    const types = {
      KNTRSPRFLE: "aa",
      _fajsi: "unknown",
      atgagcAGTA: "dna",
      atugc: "unknown",
      augagcAGUAa: "rna",
      "kInm*": "aa",
    };

    Object.keys(types).forEach(k => {
      expect(guessType(k)).toEqual(types[k]);
    });
  });
});
