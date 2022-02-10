import externalToPart from "./externalToPart";

describe("Import parts from external repositories", () => {
  // test import of some known parts against their expected properties

  // test a couple files with a known number of annotations/seq length/name
  // etc to test that it's parsing correctly
  // just check that the name, annotation count and sequence length are correct
  const knownGenbanks = {
    NC_011521: {
      name: "NC_011521",
      annotationCount: 22,
      seqLength: 6062,
    },
    FJ172221: {
      name: "FJ172221",
      annotationCount: 5,
      seqLength: 6062,
    },
    BBa_J23100: {
      name: "BBa_J23100",
      annotationCount: 1, // one annotation for pSB1C3
      seqLength: 35 + 2070, // J23100 + pSB1C3
    },
  };

  // check if name, annotation cound and sequence length are correct
  Object.keys(knownGenbanks).forEach(file => {
    it(`imports ${file}`, async () => {
      const { name, annotationCount, seqLength } = knownGenbanks[file];

      let result;
      if (file.startsWith("BBa_")) {
        result = await externalToPart(file, { backbone: "pSB1C3" });
      } else {
        result = await externalToPart(file);
      }

      expect(result).toBeDefined();
      expect(result.seq).toHaveLength(seqLength);
      expect(result.annotations).toHaveLength(annotationCount);
      expect(result.annotations.map(a => a.name)).not.toContain("Untitled");
      expect(result.name).toMatch(name);
    });
  });
});
