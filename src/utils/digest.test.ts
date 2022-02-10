import { partFactory } from "./parser";
import { digest } from "./digest";

describe("DNATools: Digest", () => {
  const ecoriTestPart = () => ({
    _id: "f9s8dhf2",
    name: "Test sample",
    seq: "TACAAGAATTCAAAATAA", // EcoRI site right in middle
    compSeq: "ATGTTCTTAAGTTTTATT",
    annotations: [
      {
        start: 5,
        end: 15,
        name: "backbone",
        type: "CDS",
      },
      {
        start: 15,
        end: 3,
        name: "promoter",
        type: "Promoter",
      },
    ],
    translations: [],
    type: "Promoter",
    circular: false,
  });

  test("should adjust the annotations of a cut part", () => {
    const cutParts = digest(["EcoRI"], ecoriTestPart());
    expect(cutParts[1].annotations[0]).toEqual({
      start: 0,
      end: 9,
      name: "backbone",
      type: "CDS",
    });
  });

  test("should return an empty annotations array if that's input", () => {
    const { annotations, ...rest } = ecoriTestPart();
    const part = {
      ...partFactory(),
      ...rest,
    };
    const cutParts = digest(["EcoRI"], part); // no annotations
    expect(cutParts[0].annotations).toEqual([]);
  });

  /**
   * digest should only expect a part with a name, seq and compSeq. It shouldn't break on a part
   * without annotations or translations
   *
   * this will be a common situation on client side where a component doesn't request
   * all of the part fields
   */
  test("should not require annotation or translations on the part", () => {
    const { annotations, translations, ...rest } = ecoriTestPart();
    const part = {
      ...partFactory(),
      ...rest,
    };

    expect(() => {
      digest(["EcoRI"], part); // no annotations nor translations
    }).not.toThrow();
  });

  /**
   * make sure that it works for BsaI, critical for MoClo and GoldenGate
   */
  test("cut with BsaI correctly", () => {
    const part = {
      ...partFactory(),
      seq: "TTAGGTCTCGGGGGAA",
      compSeq: "AATCCAGAGCCCCCTT",
      circular: false,
    };

    const digestResults = digest(["BsaI"], part);
    expect(digestResults).toHaveLength(2);
    expect(digestResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seq: "TTAGGTCTCG****",
          compSeq: "AATCCAGAGCCCCC",
        }),
        expect.objectContaining({
          seq: "GGGGAA",
          compSeq: "****TT",
        }),
      ])
    );
  });
});
