import fs from "fs";
import parseFasta from "./fasta";

/**
 * test fasta import
 */
describe("FASTA parser", () => {
  const folder = `${__dirname}/../examples/fasta`; // path to fasta folder

  // loop through every file. don't fail on any of them
  fs.readdirSync(folder).forEach((file, i) => {
    test(`file: ${file} ${i}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      await expect(parseFasta(fileString, file)).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringMatching(/.{2,}/g),
            seq: expect.stringMatching(/.{2,}/g)
          })
        ])
      );
    });
  });

  // should create multiple parts when it's a multi-seq fasta
  ["multi_test.fas", "multisequence.fas"].forEach(file => {
    test(`multi-sequence fasta file: ${file}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      await expect(parseFasta(fileString, file)).resolves.toHaveLength(7);
    });
  });

  const knownFASTA = {
    "pBbS0c-RFP_no_name.fasta": {
      name: "pBbS0c-RFP_no_name",
      seqLength: 4277
    },
    "pBbS0c-RFP_no_name.txt": {
      name: "pBbS0c-RFP_no_name",
      seqLength: 4277
    }
  };

  // should work on fasta files where there's no header row, just bps in the file
  Object.keys(knownFASTA).forEach(file => {
    test(`fasta file: ${file}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      const { name, seqLength } = knownFASTA[file];
      const result = await parseFasta(fileString, file);
      expect(result).toHaveLength(1);
      expect(result[0].seq).toHaveLength(seqLength);
      expect(result[0].name).toMatch(name);
    });
  });
});
