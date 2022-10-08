import digest, { findCutSites } from "./digest";
import { CutSite, Enzyme } from "./elements";

describe("Digest", () => {
  interface test {
    args: {
      enzymes?: (Enzyme | string)[];
      enzymesCustom?: { [key: string]: Enzyme };
      seq: string;
    };
    cutSites: CutSite[];
    name: string;
  }

  const tests: test[] = [
    {
      args: {
        enzymes: ["AatII"],
        seq: "....GACGTC....",
      },
      cutSites: [
        {
          direction: 1,
          end: 10,
          enzyme: {
            fcut: 5,
            name: "AatII",
            rcut: 1,
            rseq: "GACGTC",
          },
          fcut: 9,
          id: "AatII-GACGTC-23-fwd",
          name: "AatII",
          rcut: 5,
          start: 4,
        },
      ],
      name: "cuts with enzyme name, deduplicates fwd and rev comp enzymes",
    },
    {
      args: {
        enzymesCustom: {
          custom: {
            fcut: 5,
            name: "custom",
            rcut: 1,
            rseq: "GACGTA",
          },
        },
        seq: "....GACGTA....",
      },
      cutSites: [
        {
          direction: 1,
          end: 10,
          enzyme: {
            fcut: 5,
            name: "custom",
            rcut: 1,
            rseq: "GACGTA",
          },
          fcut: 9,
          id: "custom-GACGTA-23-fwd",
          name: "custom",
          rcut: 5,
          start: 4,
        },
      ],
      name: "cuts with custom enzyme",
    },
    {
      args: {
        seq: "GAGACTACGACTACAG",
      },
      cutSites: [],
      name: "returns empty",
    },
    {
      args: {
        // AatII is the same enzyme as "custom"
        enzymes: ["AatII", "AatII"],
        enzymesCustom: {
          custom: {
            fcut: 5,
            name: "custom",
            rcut: 1,
            rseq: "GACGTA",
          },
        },
        seq: "....GACGTA....",
      },
      cutSites: [
        {
          direction: 1,
          end: 10,
          enzyme: {
            fcut: 5,
            name: "custom",
            rcut: 1,
            rseq: "GACGTA",
          },
          fcut: 9,
          id: "custom-GACGTA-23-fwd",
          name: "custom",
          rcut: 5,
          start: 4,
        },
      ],
      name: "dedupe enzymes",
    },
    {
      args: {
        enzymes: [
          {
            fcut: 5,
            name: "custom",
            rcut: 1,
            rseq: "GACGTA",
          },
        ],
        seq: "....GACGTA....",
      },
      cutSites: [
        {
          direction: 1,
          end: 10,
          enzyme: {
            fcut: 5,
            name: "custom",
            rcut: 1,
            rseq: "GACGTA",
          },
          fcut: 9,
          id: "custom-GACGTA-23-fwd",
          name: "custom",
          rcut: 5,
          start: 4,
        },
      ],
      name: "cuts with custom enzyme object",
    },
  ];

  tests.forEach(t => {
    it(t.name, () => {
      const cutSites = digest(t.args.seq, t.args.enzymes, t.args.enzymesCustom);
      expect(cutSites).toMatchObject(t.cutSites);
    });
  });
});

describe("FindCutSites", () => {
  interface test {
    args: {
      enzyme: Enzyme;
      seq: string;
    };
    cutSites: CutSite[];
    name: string;
  }

  const tests: test[] = [
    {
      args: {
        enzyme: {
          color: "gray",
          fcut: 1,
          name: "eco",
          rcut: 2,
          rseq: "atgc",
        },
        seq: "....atgc....",
      },
      cutSites: [
        {
          direction: 1,
          end: 8,
          enzyme: {
            color: "gray",
            fcut: 1,
            name: "eco",
            rcut: 2,
            rseq: "atgc",
          },
          fcut: 5,
          id: "eco-atgc-5-fwd",
          name: "eco",
          rcut: 6,
          start: 4,
        },
      ],
      name: "cuts fwd",
    },
    {
      args: {
        enzyme: {
          color: "gray",
          fcut: 1,
          name: "eco",
          rcut: 2,
          rseq: "atgc",
        },
        seq: "....gcatdf....",
      },
      cutSites: [
        {
          direction: -1,
          end: 8,
          enzyme: {
            color: "gray",
            fcut: 1,
            name: "eco",
            rcut: 2,
            rseq: "atgc",
          },
          fcut: 6,
          id: "eco-atgc-6-rev",
          name: "eco",
          rcut: 7,
          start: 4,
        },
      ],
      name: "cuts rev",
    },
    {
      args: {
        enzyme: {
          fcut: 7,
          name: "BsaI",
          rcut: 11,
          rseq: "GGTCTCNNNNN",
        },
        seq: "AAAAAGGTCTCAAAAAAAAAAAAAAAAA",
      },
      cutSites: [
        {
          direction: 1,
          end: 16,
          enzyme: {
            fcut: 7,
            name: "BsaI",
            rcut: 11,
            rseq: "GGTCTCNNNNN",
          },
          fcut: 12,
          id: "BsaI-GGTCTCNNNNN-12-fwd",
          name: "BsaI",
          rcut: 16,
          start: 5,
        },
      ],
      name: "cuts ambiguous match",
    },
    {
      args: {
        enzyme: {
          color: "gray",
          fcut: 1,
          name: "eco",
          range: {
            end: 10,
            start: 3,
          },
          rcut: 2,
          rseq: "atgc",
        },
        seq: "....atgc....atgc....gcat...",
      },
      cutSites: [
        {
          direction: 1,
          end: 8,
          enzyme: {
            color: "gray",
            fcut: 1,
            name: "eco",
            range: {
              end: 10,
              start: 3,
            },
            rcut: 2,
            rseq: "atgc",
          },
          fcut: 5,
          id: "eco-atgc-5-fwd",
          name: "eco",
          rcut: 6,
          start: 4,
        },
      ],
      name: "cuts with range",
    },
  ];

  tests.forEach(t => {
    it(t.name, () => {
      expect(findCutSites(t.args.enzyme, t.args.seq, t.args.seq.length)).toEqual(t.cutSites);
    });
  });
});
