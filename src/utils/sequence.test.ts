import { calcGC, guessType } from "./sequence";

describe("Sequence utilities", () => {
  it("calculates GC%", () => {
    const seq1 = "ATGCATGC";
    const seq2 = "AGCTGC";

    const gc1 = calcGC(seq1);
    const gc2 = calcGC(seq2);

    expect(gc1).toEqual(50.0);
    expect(gc2).toEqual(66.67);
  });

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
