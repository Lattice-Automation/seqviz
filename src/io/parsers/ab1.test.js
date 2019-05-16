import fs from "fs";
import parseAB1 from "./ab1";

const folder = `${__dirname}/../examples/ab1`;

describe("ab1 parser", () => {
  test("parses an example file", () => {
    const file = fs.readFileSync(`${folder}/example1.ab1`);
    const parsedAB1 = parseAB1(file, "example1.ab1");

    // just making sure it's matching the right type and making it through the file
    expect(parsedAB1).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        seq: expect.any(String),
        traces: expect.objectContaining({
          aTrace: expect.arrayContaining([expect.any(Number)]),
          tTrace: expect.arrayContaining([expect.any(Number)]),
          gTrace: expect.arrayContaining([expect.any(Number)]),
          cTrace: expect.arrayContaining([expect.any(Number)]),
          qualNums: expect.arrayContaining([expect.any(Number)])
        })
      })
    );
  });

  test("parses to known output", () => {
    const file = fs.readFileSync(`${folder}/Linc5-1_HK460_2015-07-01_E05.ab1`);
    const parsedAB1 = parseAB1(file, "Linc5-1_HK460_2015-07-01_E05.ab1");

    // just making sure it's matching the right type and making it through the file
    expect(parsedAB1).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        seq: expect.stringMatching(
          "AAAGGTGATGAGGCAATAGTAATTCATCATGATAGTAGGAGGCTTGGTAGGTTTCGAATAGTTTTTGCTGTACTTTCTATAGTGAATAGAGTTAGGCAGGGATATTCACCATTATCGTTTCTTCCCACCTCCCAACCCCGAGGGGACCCAGAGAGGGCCTATTTCCCATGATTCCTTCATATTTGCATATACGATACAAGGCTGTTAGAGAGATAATTAGAATTAATTTGACTGTAAACACAAAGATATTAGTACAAAATACGTGACGTAGAAAGTAATAATTTCTTGGGTAGTTTGCAGTTTTAAAATTATGTTTTAAAATGGACTATCATATGCTTACCGTAACTTGAAAGTATTTCGATTTCTTGGCTTTATATATCTTGTGGAAAGGACGAAACACCGGCCCGCTTTGCATACGCCGTGTTTAAGAGCTATGCTGGAAACAGCATAGCAAGTTTAAATAAGGCTAGTCCGTTATCAACTTGAAAAAGTGGCACCGAGTCGGTGCTTTTTTTCTCCTATATATTCATTGTCCTAATTTTAATTCTTGCCTAATTTCGTCTACTTTAACTTTAGCGTTTTGAACAGATTCACCAACACCTATAATCCGTAGCCTAGGTTCAGTTCCACTTGGGCGAACAGCAAATCATGACTTATCTTCTAGATAACGGGGAGGGCCTATTTCCCATGATTCCTTCATATTTGCATATACGATACAAGGCTGTTAGAGAGATAATTAGAATTAATTTGACTGTAAACACAAAGATATTAGTACAAAATACGTGACGTAGAAAGTAATAATTTCTTGGGTAGTTTGCAGTTTTAAAATTATGTTTTAAAATGGACTATCATATGCTTACCGTAACTTGAAAGTATTTCGATTTCTTGGCTTTATATATCTTGTGGAAAAGGACGAAACACCGCGCAACTCCATCGAAGCCGAGTTTAAGAGCTATGCTGGGAAACAGCATAGCAAGTTTAAATAACGCTAGTCCGTTAT"
        ),
        traces: expect.objectContaining({
          aTrace: expect.arrayContaining([expect.any(Number)]),
          tTrace: expect.arrayContaining([expect.any(Number)]),
          gTrace: expect.arrayContaining([expect.any(Number)]),
          cTrace: expect.arrayContaining([expect.any(Number)]),
          qualNums: expect.arrayContaining([expect.any(Number)])
        })
      })
    );
  });
});
