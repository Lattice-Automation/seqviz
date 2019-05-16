import fs from "fs";
import parseSBOLV1 from "./sbol.v1";
import parseSBOLV2 from "./sbol.v2";

/**
 * test sbol import
 */
describe("SBOL parser v1", () => {
  const folder = `${__dirname}/../examples/sbol/v1`; // path to SBOLv1 folder

  // loop through every file. don't fail on any of them
  // this is a binary (do they make name+seq) kind of thing
  fs.readdirSync(folder).forEach((file, i) => {
    test(`file: ${file} ${i}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");

      await expect(parseSBOLV1(fileString, file)).resolves.toEqual(
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
});

describe("SBOL parser v2", () => {
  const folder = `${__dirname}/../examples/sbol/v2`; // path to SBOLv1 folder

  // test a couple files with a known number of annotations/seq length/name
  // etc to test that it's parsing correctly
  // just check that the name, annotation count and sequence length are correct
  const knownSBOL = {
    "phoenix_plasmid_lib_collection.xml": {
      count: 116
    }
  };

  // check if name, annotation cound and sequence length are correct
  Object.keys(knownSBOL).forEach(file => {
    test(`file: ${file}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      const { count } = knownSBOL[file];
      const result = await parseSBOLV2(fileString, file);
      expect(result).toHaveLength(count);
    });
  });

  test("sbol 2 dev", async () => {
    const testFile = `${folder}/BBa_I0462.xml`;
    const testString = fs.readFileSync(testFile, "utf8");
    const result = await parseSBOLV2(testString, testFile);

    const containsAllAnnotations = [
      {
        name: "BBa_B0015_annotation",
        start: 807,
        end: 935
      },
      {
        name: "BBa_C0062_annotation",
        start: 18,
        end: 773
      },
      {
        name: "BBa_B0034_annotation",
        start: 0,
        end: 11
      }
    ];

    expect(!!result[0].seq).toBe(true); // should find the sequence

    expect(
      containsAllAnnotations.every(a =>
        result[0].annotations.some(
          ann =>
            ann.name === a.name && ann.start === a.start && ann.end === a.end
        )
      )
    ).toBe(true);
  });
});
