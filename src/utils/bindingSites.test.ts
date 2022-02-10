import primerBindingSites from "./bindingSites";

describe("Primer binding sites", () => {
  const testVector = "ATCGatcgAAAAaaaaTTTTttttccGGGGggggATCGatcgAAAAaaaaTTTTttttCCCCccccGGgggg";
  const testPrimerOne = {
    overhang: "AAAA",
    name: "FWD1",
    id: "dsdcvkxHg",
    complementId: "",
    gc: 50,
    tm: 43,
    any: 0,
    dimer: 0,
    hairpin: 0,
    stability: 0,
    vector: testVector,
    seq: "TTTTttttCCCCcccc",
    penalty: 0,
    strict: false,
    __typename: "Primer",
  };
  const testPrimerTwo = {
    overhang: "",
    name: "REV2",
    id: "JKdNupAp7",
    complementId: "",
    gc: 76.92307692307693,
    tm: 46,
    any: 0,
    dimer: 0,
    hairpin: 0,
    stability: 0,
    vector: testVector,
    seq: "TTTTTTTccCCCCgggg",
    penalty: 0,
    strict: false,
    __typename: "Primer",
  };

  const testPrimerThree = {
    overhang: "gggg",
    name: "FWD2",
    id: "nqtBM-haM",
    complementId: "",
    gc: 0,
    tm: 23,
    any: 0,
    dimer: 0,
    hairpin: 0,
    stability: 0,
    vector: testVector,
    seq: "ttaaaaaatttttttt",
    penalty: 0,
    strict: false,
    __typename: "Primer",
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
