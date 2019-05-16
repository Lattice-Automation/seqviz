import fs from "fs";
import parseJBEI from "./jbei";

/**
 * test genbank import
 */
describe("Genbank parser", () => {
  const folder = `${__dirname}/../examples/jbei`; // path to fasta folder

  // loop through every file. don't fail on any of them
  // this is a binary (do they make name+seq) kind of thing
  fs.readdirSync(folder).forEach((file, i) => {
    test(`file: ${file} ${i}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      await expect(parseJBEI(fileString, file)).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: expect.stringMatching(/.{2,}/g),
            seq: expect.stringMatching(/.{2,}/g),
            compSeq: expect.stringMatching(/.{2,}/g)
          })
        ])
      );
    });
  });

  // test a couple files with a known number of annotations/seq length/name
  // etc to test that it's parsing correctly
  // just check that the name, annotation count and sequence length are correct
  const knownJBEI = {
    "pBbE0c-RFP.seq": {
      name: "pBbE0c-RFP",
      annotationCount: 4,
      annotations: [
        expect.objectContaining({
          name: "CmR",
          direction: "REVERSE",
          type: "gene",
          start: 2010,
          end: 2670
        })
      ],
      seqLength: 2815
    },
    "pBbS0c-RFP.seq": {
      name: "pBbS0c-RFP",
      annotationCount: 5,
      annotations: [],
      seqLength: 4224
    }
  };

  // check if name, annotation cound and sequence length are correct
  Object.keys(knownJBEI).forEach(file => {
    test(`file: ${file}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      const { name, annotationCount, annotations, seqLength } = knownJBEI[file];
      const result = await parseJBEI(fileString, file);
      expect(result).toHaveLength(1);
      expect(result[0].seq).toHaveLength(seqLength);
      expect(result[0].annotations).toHaveLength(annotationCount);
      expect(result[0].annotations).toEqual(expect.arrayContaining(annotations));
      expect(result[0].name).toMatch(name);
    });
  });

  // expect it to not label a linear sequence as circular
  test("recognizes linear seq", async () => {
    const fileString = fs.readFileSync(`${folder}/pBbE0c-RFP.linear.seq`, "utf8");
    const result = await parseJBEI(fileString, "pBbE0c-RFP.linear.seq");
    expect(result[0].circular).toBe(false);
  });
});
