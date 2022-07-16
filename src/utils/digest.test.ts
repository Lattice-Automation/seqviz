import { CutSite, Enzyme } from "../elements";
import digest, { findCutSites } from "./digest";

describe("Digest", () => {
  interface test {
    name: string;
    args: {
      seq: string;
      enzymeList?: string[];
      enzymesCustom?: { [key: string]: Enzyme };
    };
    cutSites: CutSite[];
  }

  const tests: test[] = [
    {
      name: "cuts with enzyme name",
      args: {
        seq: "....GACGTC....",
        enzymeList: ["AatII"],
      },
      cutSites: [
        {
          color: "",
          direction: 1,
          end: 10,
          fcut: 9,
          id: "AatII-GACGTC-23-fwd",
          name: "AatII",
          rcut: 5,
          recogEnd: 10,
          recogStart: 18,
          start: 4,
        },
        {
          color: "",
          direction: -1,
          end: 10,
          fcut: 9,
          id: "AatII-GACGTC-23-rev",
          name: "AatII",
          rcut: 5,
          recogEnd: 10,
          recogStart: 18,
          start: 4,
        },
      ],
    },
    {
      name: "cuts with custom enzyme",
      args: {
        seq: "....GACGTC....",
        enzymesCustom: {
          custom: {
            fcut: 5,
            rcut: 1,
            rseq: "GACGTC",
          },
        },
      },
      cutSites: [
        {
          color: "",
          direction: 1,
          end: 10,
          fcut: 9,
          id: "custom-GACGTC-23-fwd",
          name: "custom",
          rcut: 5,
          recogEnd: 10,
          recogStart: 18,
          start: 4,
        },
        {
          color: "",
          direction: -1,
          end: 10,
          fcut: 9,
          id: "custom-GACGTC-23-rev",
          name: "custom",
          rcut: 5,
          recogEnd: 10,
          recogStart: 18,
          start: 4,
        },
      ],
    },
    {
      name: "returns empty",
      args: {
        seq: "GAGACTACGACTACAG",
      },
      cutSites: [],
    },
    {
      name: "deduplicates enzymes",
      args: {
        seq: "....GACGTC....",
        // AatII is the same enzyme as "custom"
        enzymeList: ["AatII", "AatII"],
        enzymesCustom: {
          custom: {
            fcut: 5,
            rcut: 1,
            rseq: "GACGTC",
          },
        },
      },
      cutSites: [
        {
          color: "",
          direction: 1,
          end: 10,
          fcut: 9,
          id: "custom-GACGTC-23-fwd",
          name: "custom",
          rcut: 5,
          recogEnd: 10,
          recogStart: 18,
          start: 4,
        },
        {
          color: "",
          direction: -1,
          end: 10,
          fcut: 9,
          id: "custom-GACGTC-23-rev",
          name: "custom",
          rcut: 5,
          recogEnd: 10,
          recogStart: 18,
          start: 4,
        },
      ],
    },
  ];

  tests.forEach(t => {
    it(t.name, () => {
      const cutSites = digest(t.args.seq, t.args.enzymeList, t.args.enzymesCustom);
      expect(cutSites).toMatchObject(t.cutSites);
    });
  });
});

describe("FindCutSites", () => {
  interface test {
    name: string;
    args: {
      enzyme: Enzyme;
      seq: string;
      enzymeName: string;
    };
    cutSites: CutSite[];
  }

  const tests: test[] = [
    {
      name: "cuts fwd",
      args: {
        enzyme: {
          fcut: 1,
          rseq: "atgc",
          rcut: 2,
          color: "gray",
        },
        seq: "....atgc....",
        enzymeName: "eco",
      },
      cutSites: [
        {
          color: "gray",
          direction: 1,
          end: 8,
          fcut: 5,
          id: "",
          name: "eco",
          rcut: 6,
          recogEnd: 8,
          recogStart: 4,
          start: 4,
        },
      ],
    },
    {
      name: "cuts rev",
      args: {
        enzyme: {
          fcut: 1,
          rseq: "atgc",
          rcut: 2,
          color: "gray",
        },
        seq: "....gcatdf....",
        enzymeName: "eco",
      },
      cutSites: [
        {
          color: "gray",
          direction: -1,
          end: 8,
          fcut: 6,
          id: "",
          name: "eco",
          rcut: 7,
          recogEnd: 8,
          recogStart: 4,
          start: 4,
        },
      ],
    },
    {
      name: "cuts ambiguous match",
      args: {
        enzyme: {
          fcut: 7,
          rseq: "GGTCTCNNNNN",
          rcut: 11,
        },
        seq: "AAAAAGGTCTCAAAAAAAAAAAAAAAAA",
        enzymeName: "BsaI",
      },
      cutSites: [
        {
          color: "",
          direction: 1,
          end: 16,
          fcut: 12,
          id: "",
          name: "BsaI",
          rcut: 16,
          recogEnd: 16,
          recogStart: 5,
          start: 5,
        },
      ],
    },
  ];

  tests.forEach(t => {
    it(t.name, () => {
      expect(findCutSites(t.args.enzyme, t.args.seq, t.args.enzymeName)).toEqual(t.cutSites);
    });
  });
});
