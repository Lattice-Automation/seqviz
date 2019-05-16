import fs from "fs";
import parseBenchling from "./benchling";

/**
 * test Benchling import
 */
describe("Benchling parser", () => {
  const folder = `${__dirname}/../examples/benchling`;

  const knownBenchling = {
    "benchling1.json": {
      name: "AF090832",
      seqLength: 5086
    },
    "benchling2.json": {
      name: "pBR322",
      seqLength: 4361
    }
  };

  // should work on fasta files where there's no header row, just bps in the file
  Object.keys(knownBenchling).forEach(file => {
    test(`benchling file: ${file}`, async () => {
      const fileString = fs.readFileSync(`${folder}/${file}`, "utf8");
      const { name, seqLength } = knownBenchling[file];
      const result = await parseBenchling(fileString, file);
      expect(result).toHaveLength(1);
      expect(result[0].seq).toHaveLength(seqLength);
      expect(result[0].name).toMatch(name);
    });
  });

  // should error out on a part without a sequence
  test("error on empty sequence", async () => {
    const file = "benchling-empty.json";
    const fileString = fs.readFileSync(`${folder}/${file}`, "utf-8");
    expect(parseBenchling(fileString, file)).rejects.toEqual(
      new Error("Empty part sequence... invalid")
    );
  });
});
