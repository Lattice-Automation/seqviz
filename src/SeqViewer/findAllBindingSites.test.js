import findAllBindingSites from "./findAllBindingSites.jsx.js";

describe("Primer Binding Sites", () => {
  const testVector =
    "ATCGatcgAAAAaaaaTTTTttttccGGGGggggATCGatcgAAAAaaaaTTTTttttCCCCccccGGgggg";
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
    sequence: "TTTTttttCCCCcccc",
    penalty: 0,
    strict: false,
    __typename: "Primer"
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
    sequence: "TTTTTTTccCCCCgggg",
    penalty: 0,
    strict: false,
    __typename: "Primer"
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
    sequence: "ttaaaaaatttttttt",
    penalty: 0,
    strict: false,
    __typename: "Primer"
  };

  /**
   * Actual results at time of writing
   * 
   * [
    {
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
      sequence: "AAAAttttttttcccccccc",
      penalty: 0,
      strict: false,
      __typename: "Primer",
      start: 46,
      end: 66,
      direction: "FORWARD",
      mismatches: [
        {
          start: 0,
          end: 4
        }
      ],
      annealSequence: "ttttttttcccccccc"
    },
    {
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
      sequence: "tttttttccccccgggg",
      penalty: 0,
      strict: false,
      __typename: "Primer",
      start: 53,
      end: 70,
      direction: "FORWARD",
      mismatches: [
        {
          start: 5,
          end: 7
        }
      ],
      annealSequence: "tttttttccccccgggg"
    },
    {
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
      sequence: "tttttttccccccgggg",
      penalty: 0,
      strict: false,
      __typename: "Primer",
      start: 62,
      end: 7,
      direction: "REVERSE",
      mismatches: [
        {
          start: 0,
          end: 6
        }
      ],
      annealSequence: "tccccccgggg"
    },  
    {
      "overhang": "gggg",
      "name": "FWD2",
      "id": "nqtBM-haM",
      "complementId": "",
      "gc": 0,
      "tm": 23,
      "any": 0,
      "dimer": 0,
      "hairpin": 0,
      "stability": 0,
      "vector": "ATCGatcgAAAAaaaaTTTTttttccGGGGggggATCGatcgAAAAaaaaTTTTttttCCCCccccGGgggg",
      "sequence": "ggggttaaaaaatttttttt",
      "penalty": 0,
      "strict": false,
      "__typename": "Primer",
      "start": 4,
      "end": 24,
      "direction": "FORWARD",
      "mismatches": [
        {
          "start": 0,
          "end": 6
        },
        {
          "start": 0,
          "end": 4
        }
      ],
      "annealSequence": "aaaaaatttttttt"
    },
    {
      "overhang": "gggg",
      "name": "FWD2",
      "id": "nqtBM-haM",
      "complementId": "",
      "gc": 0,
      "tm": 23,
      "any": 0,
      "dimer": 0,
      "hairpin": 0,
      "stability": 0,
      "vector": "ATCGatcgAAAAaaaaTTTTttttccGGGGggggATCGatcgAAAAaaaaTTTTttttCCCCccccGGgggg",
      "sequence": "ggggttaaaaaatttttttt",
      "penalty": 0,
      "strict": false,
      "__typename": "Primer",
      "start": 38,
      "end": 58,
      "direction": "FORWARD",
      "mismatches": [
        {
          "start": 0,
          "end": 6
        },
        {
          "start": 0,
          "end": 4
        }
      ],
      "annealSequence": "aaaaaatttttttt"
    },
    {
      "overhang": "gggg",
      "name": "FWD2",
      "id": "nqtBM-haM",
      "complementId": "",
      "gc": 0,
      "tm": 23,
      "any": 0,
      "dimer": 0,
      "hairpin": 0,
      "stability": 0,
      "vector": "ATCGatcgAAAAaaaaTTTTttttccGGGGggggATCGatcgAAAAaaaaTTTTttttCCCCccccGGgggg",
      "sequence": "ggggttaaaaaatttttttt",
      "penalty": 0,
      "strict": false,
      "__typename": "Primer",
      "start": 8,
      "end": 28,
      "direction": "REVERSE",
      "mismatches": [
        {
          "start": 0,
          "end": 6
        },
        {
          "start": 0,
          "end": 4
        }
      ],
      "annealSequence": "aaaaaatttttttt"
    },
    {
      "overhang": "gggg",
      "name": "FWD2",
      "id": "nqtBM-haM",
      "complementId": "",
      "gc": 0,
      "tm": 23,
      "any": 0,
      "dimer": 0,
      "hairpin": 0,
      "stability": 0,
      "vector": "ATCGatcgAAAAaaaaTTTTttttccGGGGggggATCGatcgAAAAaaaaTTTTttttCCCCccccGGgggg",
      "sequence": "ggggttaaaaaatttttttt",
      "penalty": 0,
      "strict": false,
      "__typename": "Primer",
      "start": 42,
      "end": 62,
      "direction": "REVERSE",
      "mismatches": [
        {
          "start": 0,
          "end": 6
        },
        {
          "start": 0,
          "end": 4
        }
      ],
      "annealSequence": "aaaaaatttttttt"
    }
  ];
   */

  test("finds binding sites", () => {
    const testBindingSites = findAllBindingSites(
      [testPrimerOne, testPrimerTwo],
      testVector
    );
    expect(testBindingSites).toHaveLength(3);
  });

  test("correctly find binding sites that aren't perfect matches", () => {
    const primerSequence = testPrimerTwo.sequence.toLowerCase();
    const testBindingSites = findAllBindingSites(
      [testPrimerOne, testPrimerTwo],
      testVector
    );
    const primerTwoBindingSites = testBindingSites.filter(
      binding => binding.sequence.toLowerCase() === primerSequence
    );
    const annealingSequences = primerTwoBindingSites.reduce((acc, binding) => {
      const annealSequences = acc.concat([binding.annealSequence]);
      return annealSequences;
    }, []);
    const exactMatches = annealingSequences.filter(
      seq => seq.toLowerCase() === primerSequence
    );
    expect(primerTwoBindingSites).toHaveLength(2);
    expect(exactMatches).toHaveLength(0);
  });

  test("correctly find binding sites that crosses zero index", () => {
    const testBindingSites = findAllBindingSites([testPrimerTwo], testVector);
    const bindingSiteCrossZero = testBindingSites.filter(
      binding => binding.start > binding.end
    );
    expect(bindingSiteCrossZero).toHaveLength(1);
  });

  test("binding sites of primers with overhang all have the correct length", () => {
    const testBindingSites = findAllBindingSites([testPrimerThree], testVector);
    const seqLength =
      testPrimerThree.sequence.length + testPrimerThree.overhang.length;
    const bindingSitesCorrectLength = testBindingSites.filter(
      binding => binding.sequence.length === seqLength
    );

    expect(bindingSitesCorrectLength).toHaveLength(4);
  });
});
