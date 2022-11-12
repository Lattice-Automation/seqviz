import { complement, directionality, guessType, reverseComplement } from "./sequence";

describe("Sequence utilities", () => {
  it("detects type", () => {
    const types = {
      ILVELbjDGDVNGHKFSV: "aa",
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

  it("parses DNA seq and compSeq", () => {
    const inSeq =
      "acacgattgcccgacggattcatgagatgtcaggccgcaaagggcgcctggtggcGATGAATTGCGCGGCCATTCCGGAGTCCCTCGccgagagcgagttattcggcgtggtcagcggtgcctacaccggcgctgatcgctccagagtcg";

    const { compSeq, seq } = complement(inSeq, "dna");

    expect(seq).toEqual(inSeq);
    expect(compSeq).toEqual(
      "tgtgctaacgggctgcctaagtactctacagtccggcgtttcccgcggaccaccgCTACTTAACGCGCCGGTAAGGCCTCAGGGAGCggctctcgctcaataagccgcaccagtcgccacggatgtggccgcgactagcgaggtctcagc"
    );
  });

  it("returns empty of an RNA sequence", () => {
    const inSeq = "UACGAUCUUAG";

    const { compSeq, seq } = complement(inSeq, "rna");

    expect(seq).toEqual(inSeq);
    expect(compSeq).toEqual("AUGCUAGAAUC");
  });

  it("returns empty compSeq for amino-acid", () => {
    const inSeq =
      "MSKGEELFTGVVPILVELbjDGDVNGHKFSVSGEGEGdatYGKLTLKFICTTGKLPVPWPTLMSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWP";

    const { compSeq, seq } = complement(inSeq, "aa");

    expect(seq).toEqual(inSeq);
    expect(compSeq).toEqual("");
  });

  it("returns the reverse complement", () => {
    const revCompSeq = reverseComplement(
      "acacgattgcccgacggattcatgagatgtcaggccgcaaagggcgcctggtggcGATGAATTGCGCGGCCATTCCGGAGTCCCTCGccgagagcgagttattcggcgtggtcagcggtgcctacaccggcgctgatcgctccagagtcg",
      "dna"
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
