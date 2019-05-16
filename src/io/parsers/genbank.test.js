import fs from "fs";
import parseGenbank from "./genbank";

/**
 * test genbank import
 */
describe("Genbank parser", () => {
  const folder = `${__dirname}/../examples/genbank`; // path to genbank folder

  // loop through every file. don't fail on any of them
  // this is a binary (do they make name+seq) kind of thing
  fs.readdirSync(folder).forEach((file, i) => {
    test(`file: ${file} ${i}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      await expect(parseGenbank(fileString, file)).resolves.toEqual(
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
  const knownGenbanks = {
    "Benchling.Genbank.gb": {
      name: "J23102_AB",
      annotationCount: 3,
      primerCount: 3, // two primers, first primer has 2 binding sites
      seqLength: 2143,
      circular: true
    },
    "testGenbankFile.gb": {
      name: "pj5_00001",
      annotationCount: 21,
      primerCount: 2, // long and short test (10, 250)
      seqLength: 5299,
      circular: true
    },
    "NC_011521.gb": {
      name: "NC_011521",
      annotationCount: 2, // this excludes the CONFIG and SOURCE lines that should not be parsed to annotation
      primerCount: 2, // long overhangs at start and end
      seqLength: 717,
      circular: false
    },
    "testPart.snapgene.gb": {
      name: "testPart.snapgene", // note: want to avoid giving this part the name Exported
      annotationCount: 8,
      primerCount: 4,
      seqLength: 7235,
      circular: true
    },
    "pj5_00002.gb": {
      name: "pj5_00002",
      annotationCount: 18,
      primerCount: 0,
      seqLength: 5365,
      annotations: expect.arrayContaining([
        expect.objectContaining({
          type: "CDS",
          direction: "REVERSE",
          start: 6,
          end: 885,
          name: "araC"
        })
      ]), // use this pattern to test that certain annotation get generated
      circular: true
    },
    "Ecoli_DERA_Implicitly_Circular.gb": {
      name: "E.coli DERA",
      annotationCount: 15,
      primerCount: 0,
      seqLength: 1024,
      circular: true // should figure out that one of the annotations crosses zero
    },
    "Ecoli_DERA_Implicitly_Linear.gb": {
      name: "E.coli DERA",
      annotationCount: 15,
      primerCount: 0,
      seqLength: 1024,
      circular: false
    },
    "pBbS0c-RFP_no_name.gb": {
      name: "pBbS0c-RFP",
      annotationCount: 5,
      primerCount: 0,
      seqLength: 4224,
      circular: true
    }
  };

  // check if name, annotation cound and sequence length are correct
  Object.keys(knownGenbanks).forEach(file => {
    test(`file: ${file}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      const {
        name,
        annotationCount,
        seqLength,
        annotations,
        circular,
        primerCount
      } = knownGenbanks[file];
      const result = await parseGenbank(fileString, file);
      expect(result).toHaveLength(1);
      expect(result[0].seq).toHaveLength(seqLength);
      expect(result[0].annotations).toHaveLength(annotationCount);
      expect(result[0].primers).toHaveLength(primerCount);
      expect(result[0].name).toMatch(name);
      expect(result[0].circular).toBe(circular);
      if (annotations) expect(result[0].annotations).toEqual(annotations);
    });
  });

  // not at all common but there's an example multi-sequence Genbank file
  // that should be parsed into multiple parts
  test("multi-seq genbank: multi-seq-genbank.gb", async () => {
    const fileString = fs.readFileSync(`${folder}/multi-seq-genbank.gb`, "utf8");
    const result = await parseGenbank(fileString, fileString);
    expect(result).toHaveLength(4);
  });
});
