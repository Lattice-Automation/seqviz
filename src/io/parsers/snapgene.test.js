import fs from "fs";
import parseSnapgene from "./snapgene";

/**
 * test snapgene import
 */
describe("Snapgene parser", () => {
  const folder = `${__dirname}/../examples/snapgene`; // path to fasta folder

  // loop through every file. don't fail on any of them
  fs.readdirSync(folder).forEach((file, i) => {
    test(`file: ${file} ${i}`, async () => {
      const fileInput = fs.readFileSync(`${folder}/${file}`);
      await expect(parseSnapgene(fileInput, file)).resolves.toEqual(
        expect.objectContaining({
          name: expect.stringMatching(/.{2,}/g),
          seq: expect.stringMatching(/.{2,}/g)
        })
      );
    });
  });

  const knownSnapgenes = {
    "RV027028.dna": {
      name: "RV027028",
      annotationCount: 29,
      seqLength: 35040,
      circular: true
    }
  };

  // check if name, annotation cound and sequence length are correct
  Object.keys(knownSnapgenes).forEach(file => {
    test(`file: ${file}`, async () => {
      const fileInput = fs.readFileSync(`${folder}/${file}`);
      const { name, annotationCount, seqLength, annotations, circular } = knownSnapgenes[
        file
      ];
      const result = await parseSnapgene(fileInput, file);
      expect(result.seq).toHaveLength(seqLength);
      expect(result.annotations).toHaveLength(annotationCount);
      expect(result.name).toMatch(name);
      expect(result.circular).toBe(circular);
      if (annotations) expect(result.annotations).toEqual(annotations);
    });
  });
});
