// @ts-ignore
import { calcGC, getSeqType } from "./sequence.ts";

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
    expect(getSeqType("atgagcAGTA")).toEqual("dna");
    expect(getSeqType("augagcAGUAa")).toEqual("rna");
    expect(getSeqType("kInm*")).toEqual("aa");
    expect(getSeqType("_fajsi")).toEqual("unknown");
    expect(getSeqType("atugc")).toEqual("unknown");
  });
});
