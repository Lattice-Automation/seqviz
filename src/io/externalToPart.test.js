import externalToParts from "./externalToParts.js";

describe("Import parts from external apis and repositories (IO)", () => {
  // test import of some known parts against their expected properties

  // test a couple files with a known number of annotations/seq length/name
  // etc to test that it's parsing correctly
  // just check that the name, annotation count and sequence length are correct
  const knownGenbanks = {
    NC_011521: {
      name: "NC_011521",
      annotationCount: 7,
      seqLength: 6062
    },
    FJ172221: {
      name: "FJ172221",
      annotationCount: 6,
      seqLength: 6062
    },
    BBa_J23100: {
      name: "BBa_J23100",
      annotationCount: 0,
      seqLength: 35
    }
  };

  // check if name, annotation cound and sequence length are correct
  Object.keys(knownGenbanks).forEach(file => {
    it(`imports ${file}`, async () => {
      const { name, annotationCount, seqLength } = knownGenbanks[file];
      const result = await externalToParts(file);
      expect(result).toHaveLength(1);
      expect(result[0].seq).toHaveLength(seqLength);
      expect(result[0].annotations).toHaveLength(annotationCount);
      expect(result[0].name).toMatch(name);
    });
  });
});
