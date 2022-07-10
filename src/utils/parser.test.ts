import { directionality, dnaComplement, reverseComplement } from "./parser";

describe("Parse part input", () => {
  it("parses DNA seq and compSeq", () => {
    const inSeq =
      "acacgattgcccgacggattcatgagatgtcaggccgcaaagggcgcctggtggcGATGAATTGCGCGGCCATTCCGGAGTCCCTCGccgagagcgagttattcggcgtggtcagcggtgcctacaccggcgctgatcgctccagagtcg";

    const { compSeq, seq } = dnaComplement(inSeq);

    expect(seq).toEqual(inSeq);
    expect(compSeq).toEqual(
      "tgtgctaacgggctgcctaagtactctacagtccggcgtttcccgcggaccaccgCTACTTAACGCGCCGGTAAGGCCTCAGGGAGCggctctcgctcaataagccgcaccagtcgccacggatgtggccgcgactagcgaggtctcagc"
    );
  });

  it("returns the reverse complement", () => {
    const revCompSeq = reverseComplement(
      "acacgattgcccgacggattcatgagatgtcaggccgcaaagggcgcctggtggcGATGAATTGCGCGGCCATTCCGGAGTCCCTCGccgagagcgagttattcggcgtggtcagcggtgcctacaccggcgctgatcgctccagagtcg"
    );

    expect(revCompSeq).toEqual(
      "cgactctggagcgatcagcgccggtgtaggcaccgctgaccacgccgaataactcgctctcggCGAGGGACTCCGGAATGGCCGCGCAATTCATCgccaccaggcgccctttgcggcctgacatctcatgaatccgtcgggcaatcgtgt"
    );
  });

  it("parses directionality from multiple formats", () => {
    expect(directionality("FWD")).toEqual(1);
    expect(directionality("FORWARD")).toEqual(1);
    expect(directionality(1)).toEqual(1);
    expect(directionality("1")).toEqual(1);
    expect(directionality("test")).toEqual(0);
    expect(directionality("NONE")).toEqual(0);
    expect(directionality("REVERSE")).toEqual(-1);
    expect(directionality("REV")).toEqual(-1);
    expect(directionality(-1)).toEqual(-1);
    expect(directionality("-1")).toEqual(-1);
  });
});
