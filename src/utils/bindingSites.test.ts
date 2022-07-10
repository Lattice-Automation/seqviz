import primerBindingSites from "./bindingSites";

describe("Primer binding sites", () => {
  const testVector = "ATCGatcgAAAAaaaaTTTTttttccGGGGggggATCGatcgAAAAaaaaTTTTttttCCCCccccGGgggg";
  const testPrimerOne = {
    __typename: "Primer",
    any: 0,
    complementId: "",
    dimer: 0,
    gc: 50,
    hairpin: 0,
    id: "dsdcvkxHg",
    name: "FWD1",
    overhang: "AAAA",
    penalty: 0,
    seq: "TTTTttttCCCCcccc",
    stability: 0,
    strict: false,
    tm: 43,
    vector: testVector,
  };
  const testPrimerTwo = {
    __typename: "Primer",
    any: 0,
    complementId: "",
    dimer: 0,
    gc: 76.92307692307693,
    hairpin: 0,
    id: "JKdNupAp7",
    name: "REV2",
    overhang: "",
    penalty: 0,
    seq: "TTTTTTTccCCCCgggg",
    stability: 0,
    strict: false,
    tm: 46,
    vector: testVector,
  };

  const testPrimerThree = {
    __typename: "Primer",
    any: 0,
    complementId: "",
    dimer: 0,
    gc: 0,
    hairpin: 0,
    id: "nqtBM-haM",
    name: "FWD2",
    overhang: "gggg",
    penalty: 0,
    seq: "ttaaaaaatttttttt",
    stability: 0,
    strict: false,
    tm: 23,
    vector: testVector,
  };

  it("finds binding sites", () => {
    const testBindingSites = primerBindingSites([testPrimerOne, testPrimerTwo], testVector);
    expect(testBindingSites).toHaveLength(3);
  });

  it("correctly find binding sites that aren't perfect matches", () => {
    const primerSequence = testPrimerTwo.seq.toLowerCase();
    const testBindingSites = primerBindingSites([testPrimerOne, testPrimerTwo], testVector);
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'never'.
    const primerTwoBindingSites = testBindingSites.filter(binding => binding.seq.toLowerCase() === primerSequence);
    const annealingSequences = primerTwoBindingSites.reduce((acc, binding) => {
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      const annealSequences = acc.concat([binding.annealSequence]);
      return annealSequences;
    }, []);
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'toLowerCase' does not exist on type 'nev... Remove this comment to see the full error message
    const exactMatches = annealingSequences.filter(seq => seq.toLowerCase() === primerSequence);
    expect(primerTwoBindingSites).toHaveLength(2);
    expect(exactMatches).toHaveLength(0);
  });

  it("correctly find binding sites that crosses zero index", () => {
    const testBindingSites = primerBindingSites([testPrimerTwo], testVector);
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'start' does not exist on type 'never'.
    const bindingSiteCrossZero = testBindingSites.filter(binding => binding.start > binding.end);
    expect(bindingSiteCrossZero).toHaveLength(1);
  });

  it("binding sites of primers with overhang all have the correct length", () => {
    const testBindingSites = primerBindingSites([testPrimerThree], testVector);
    const seqLength = testPrimerThree.seq.length + testPrimerThree.overhang.length;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'seq' does not exist on type 'never'.
    const bindingSitesCorrectLength = testBindingSites.filter(binding => binding.seq.length === seqLength);

    expect(bindingSitesCorrectLength).toHaveLength(4);
  });
});
