import { SeqType } from "./elements";
import { complement, directionality, guessType, randomid, reverseComplement, translate } from "./sequence";

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

  it("complement of an RNA sequence", () => {
    const inSeq = "UACGAUCUUAG";

    const { compSeq, seq } = complement(inSeq, "rna");

    expect(seq).toEqual(inSeq);
    expect(compSeq).toEqual("AUGCUAGAAUC");
  });

  it("complement of empty compSeq for amino-acid", () => {
    const inSeq =
      "MSKGEELFTGVVPILVELbjDGDVNGHKFSVSGEGEGdatYGKLTLKFICTTGKLPVPWPTLMSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWP";

    const { compSeq, seq } = complement(inSeq, "aa");

    expect(seq).toEqual(inSeq);
    expect(compSeq).toEqual("");
  });

  it("reverseComplements DNA sequence", () => {
    const revCompSeq = reverseComplement(
      "acacgattgcccgacggattcatgagatgtcaggccgcaaagggcgcctggtggcGATGAATTGCGCGGCCATTCCGGAGTCCCTCGccgagagcgagttattcggcgtggtcagcggtgcctacaccggcgctgatcgctccagagtcg",
      "dna"
    );

    expect(revCompSeq).toEqual(
      "cgactctggagcgatcagcgccggtgtaggcaccgctgaccacgccgaataactcgctctcggCGAGGGACTCCGGAATGGCCGCGCAATTCATCgccaccaggcgccctttgcggcctgacatctcatgaatccgtcgggcaatcgtgt"
    );
  });

  [
    {
      expect: "TRLPDGFMRCQAAKGAWWR*IARPFRSPSPRASYSAWSAVPTPALIAPES",
      seq: "acacgattgcccgacggattcatgagatgtcaggccgcaaagggcgcctggtggcGATGAATTGCGCGGCCATTCCGGAGTCCCTCGccgagagcgagttattcggcgtggtcagcggtgcctacaccggcgctgatcgctccagagtcg",
      seqType: "dna",
    },
    {
      expect: "TRLPDGFMRCQAAKGAWWR*IARPFRSPSPRASYSAWSAVPTPALIAPES",
      seq: "ACACGAUUGCCCGACGGAUUCAUGAGAUGUCAGGCCGCAAAGGGCGCCUGGUGGCGAUGAAUUGCGCGGCCAUUCCGGAGUCCCUCGCCGAGAGCGAGUUAUUCGGCGUGGUCAGCGGUGCCUACACCGGCGCUGAUCGCUCCAGAGUCG",
      seqType: "rna",
    },
    {
      expect: "TRLPDGFMRCQAAKGAWWR*IARPFRSPSPRASYSAWSAVPTPALIAPES",
      seq: "TRLPDGFMRCQAAKGAWWR*IARPFRSPSPRASYSAWSAVPTPALIAPES",
      seqType: "aa",
    },
  ].forEach(test => {
    it(`translates sequence: ${test.seqType}`, () => {
      const seq = translate(test.seq, test.seqType as SeqType);

      expect(seq).toEqual(test.expect);
    });
  });

  [
    ["FWD", 1],
    ["FORWARD", 1],
    [1, 1],
    ["1", 1],
    ["test", 0],
    ["NONE", 0],
    ["REVERSE", -1],
    ["REV", -1],
    [-1, -1],
    ["-1", -1],
  ].forEach(([i, o]) => {
    it(`parses directionality: ${i}`, () => {
      expect(directionality(i)).toEqual(o);
    });
  });
});

describe("Create random IDs", () => {
  it("creates unique IDs", () => {
    const seenIDs = new Set();

    for (let i = 0; i < 10; i++) {
      const id = randomid();

      expect(typeof id).toEqual(typeof "");
      expect(id.length).toEqual(10);
      expect(seenIDs.has(id)).toBe(false);

      seenIDs.add(id);
    }
  });
});
