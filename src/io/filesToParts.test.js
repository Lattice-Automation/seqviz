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
describe("IO: files converted to parts", () => {
  const types = ["genbank", "fasta", "biobrick", "jbei", "benchling"];
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
      test(`file: ${file} ${i}`, async () => {
        const fileString = fs.readFileSync(allFiles[file], "utf8");
        // does it resolve
        await expect(filesToParts(fileString, allFiles[file])).resolves.toBeTruthy();
        // does it include a name, seq, and source?
        const result = await filesToParts(fileString, allFiles[file]);
        expect(result[0].name).toMatch(/.{2,}/);
        expect(result[0].seq).toMatch(/.{2,}/);
        expect(result[0].source).toEqual(
          expect.objectContaining({
            name: expect.stringMatching(/.{2,}/),
            file: expect.stringMatching(/.{2,}/)
          })
        );
      });
    });
});
