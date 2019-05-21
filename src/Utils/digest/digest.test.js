import { partFactory } from "imports/models";
import { agaroseDigest, digest, DIGEST_MAP_LADDER } from "./digest.js";

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
        type: "CDS"
      },
      {
        start: 15,
        end: 3,
        name: "promoter",
        type: "Promoter"
      }
    ],
    translations: [],
    type: "Promoter",
    circular: false
  });

  test("should adjust the annotations of a cut part", () => {
    const cutParts = digest(["EcoRI"], ecoriTestPart());
    expect(cutParts[1].annotations[0]).toEqual({
      start: 0,
      end: 9,
      name: "backbone",
      type: "CDS"
    });
  });

  test("should return an empty annotations array if that's input", () => {
    const { annotations, ...rest } = ecoriTestPart();
    const part = {
      ...partFactory(),
      ...rest
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
      ...rest
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
      circular: false
    };

    const digestResults = digest(["BsaI"], part);
    expect(digestResults).toHaveLength(2);
    expect(digestResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seq: "TTAGGTCTCG****",
          compSeq: "AATCCAGAGCCCCC"
        }),
        expect.objectContaining({
          seq: "GGGGAA",
          compSeq: "****TT"
        })
      ])
    );
  });

  /**
   * make agarose digest works for linear sequences
   */
  test("Agarose digest linear part with BsaI correctly", () => {
    const part = {
      ...partFactory(),
      seq: "TTAGGTCTCGGGGGAA",
      compSeq: "AATCCAGAGCCCCCTT",
      circular: false
    };

    const digestResults = agaroseDigest(["BsaI"], part, DIGEST_MAP_LADDER);
    expect(digestResults).toHaveLength(3);
    expect(digestResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          end: [{ enzymes: ["End of sequence"], index: 15 }],
          meta: {},
          size: "1",
          start: [{ enzymes: ["BsaI"], index: 14 }],
          top: 97.9
        }),
        expect.objectContaining({
          end: [{ enzymes: ["BsaI"], index: 14 }],
          meta: {},
          size: "4",
          start: [{ enzymes: ["BsaI"], index: 10 }],
          top: 97.9
        }),
        expect.objectContaining({
          end: [{ enzymes: ["BsaI"], index: 10 }],
          meta: {},
          size: "10",
          start: [{ enzymes: ["BsaI", "Start of sequence"], index: 0 }],
          top: 97.9
        })
      ])
    );
  });

  /**
   * make sure agarose digest works for plasmids
   */
  test("Agarose digest circular part with BsaI correctly", () => {
    const part = {
      ...partFactory(),
      seq: "TTAGGTCTCGGGGGAA",
      compSeq: "AATCCAGAGCCCCCTT",
      circular: true
    };

    const digestResults = agaroseDigest(["BsaI"], part, DIGEST_MAP_LADDER);
    expect(digestResults).toHaveLength(1);
    expect(digestResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          end: [{ enzymes: [], index: 16 }],
          meta: { centralIndex: 10, message: "Digest resulted in only one fragment" },
          size: "16",
          start: [{ enzymes: ["BsaI"], index: 0 }],
          top: 97.9
        })
      ])
    );
  });
});
