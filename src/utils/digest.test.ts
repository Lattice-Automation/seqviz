import { digest } from "./digest";
import { partFactory } from "./parser";

describe("DNATools: Digest", () => {
  const ecoriTestPart = () => ({
    _id: "f9s8dhf2",

    annotations: [
      {
        end: 15,
        name: "backbone",
        start: 5,
        type: "CDS",
      },
      {
        end: 3,
        name: "promoter",
        start: 15,
        type: "Promoter",
      },
    ],

    circular: false,
    // EcoRI site right in middle
    compSeq: "ATGTTCTTAAGTTTTATT",
    name: "Test sample",
    seq: "TACAAGAATTCAAAATAA",
    translations: [],
    type: "Promoter",
  });

  test("should adjust the annotations of a cut part", () => {
    const cutParts = digest(["EcoRI"], ecoriTestPart());
    expect(cutParts[1].annotations[0]).toEqual({
      end: 9,
      name: "backbone",
      start: 0,
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
      circular: false,
      compSeq: "AATCCAGAGCCCCCTT",
      seq: "TTAGGTCTCGGGGGAA",
    };

    const digestResults = digest(["BsaI"], part);
    expect(digestResults).toHaveLength(2);
    expect(digestResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          compSeq: "AATCCAGAGCCCCC",
          seq: "TTAGGTCTCG****",
        }),
        expect.objectContaining({
          compSeq: "****TT",
          seq: "GGGGAA",
        }),
      ])
    );
  });
});
