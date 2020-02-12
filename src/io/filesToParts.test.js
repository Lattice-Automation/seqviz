import fs from "fs";
import filesToParts from "./filesToParts";

/**
 * test filesToParts (and therefore the ./parsers/**) against all the example
 * files in ./io/examples
 *
 * these tests are binary: can the importer/parser make parts from
 * all the files or not. more detailed tests of the accuracy of results should
 * be elsewhere (directly adjacent the parser). This is just testing whether
 * filesToParts completely bails on files
 */
describe("Converts files to parts (IO)", () => {
  const types = ["genbank", "fasta", "jbei", "benchling", "snapgene"];
  const folders = types.map(t => `${__dirname}/examples/${t}`);

  // key is type/file-name, value is it's path
  const allFiles = folders.reduce((acc, dir, i) => {
    fs.readdirSync(dir).forEach(f => {
      acc[`${types[i]}/${f}`] = `${dir}/${f}`;
    });
    return acc;
  }, {});

  // loop through every file. don't fail on any of them
  Object.keys(allFiles)
    .filter(f => !f.includes("empty"))
    .forEach((file, i) => {
      it(`converts: ${file} ${i}`, async () => {
        const fileString = fs.readFileSync(allFiles[file], "utf8");

        // does it include a name, seq, and source?
        try {
          const result = await filesToParts(fileString, allFiles[file]);
          expect(typeof result).toEqual(typeof []);
          expect(typeof result[0]).toEqual(typeof {});
          expect(result[0].name).toMatch(/.{2,}/);
          expect(result[0].seq).toMatch(/[atgcATGC]{10,}/);
          expect(result[0].compSeq).toMatch(/[atgcATGC]{10,}/);
        } catch (err) {
          console.error(err);
          throw err;
        }
      });
    });

  // convert an array of files at one time
  it("converts multiple files at once", async () => {
    const files = Object.keys(allFiles)
      .filter(f => !f.includes("empty"))
      .slice(0, 3);

    try {
      const result = await filesToParts(
        files.map(f => fs.readFileSync(allFiles[f], "utf8"))
      );

      expect(typeof result).toEqual(typeof []);
      result.forEach(part => {
        expect(typeof part).toEqual(typeof {});
        expect(part.name).toMatch(/.{2,}/);
        expect(part.seq).toMatch(/.{2,}/);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  });
});
