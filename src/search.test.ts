import search from "./search";

describe("Search", () => {
  it("finds subsequence without mismatch or ambiguity", () => {
    const query = "tatt";
    const subject = "gcgagttattcggcgtgg";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 10,
      start: 6,
    });
  });

  it("finds subsequence without mismatch or ambiguity, uppercase query", () => {
    const query = "TATT";
    const subject = "gcgagttattcggcgtgg";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 10,
      start: 6,
    });
  });

  /* test a full range of casing possibilities for one mismatch=0, no wildcards */
  it("finds subsequence without mismatch or ambiguity, uppercase subject", () => {
    const query = "tatt";
    const subject = "GCGAGTTATTCGGCGTGG";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 10,
      start: 6,
    });
  });

  it("finds subsequence without mismatch or ambiguity, uppercase both", () => {
    const query = "TATT";
    const subject = "GCGAGTTATTCGGCGTGG";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 10,
      start: 6,
    });
  });

  it("finds subsequence without mismatch or ambiguity in RC", () => {
    const query = "aata";
    const subject = "gcgagttattcggcgtgg";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: -1,
      end: 10,
      start: 6,
    });
  });

  it("finds subsequence with ambiguity", () => {
    const query = "gcccgnn"; // N character
    const subject = "gattgcccgacggattc";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
  });

  /* test a full range of casing possibilities for one mismatch=0, with wildcards */
  it("finds subsequence with ambiguity, uppercase query, wildcard", () => {
    const query = "GCCCGNN"; // N character
    const subject = "gattgcccgacggattc";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
  });

  it("finds subsequence with ambiguity, uppercase subject, wildcard", () => {
    const query = "gcccgnn"; // N character
    const subject = "GATTGCCCGACGGATTC";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
  });

  it("finds subsequence with ambiguity, uppercase subject, wildcard", () => {
    const query = "gcccg.."; // N character
    const subject = "GATTGCCCGACGGATTC";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
  });

  it("finds subsequence with ambiguity, uppercase both, wildcard", () => {
    const query = "GCCCGNN"; // N character
    const subject = "GATTGCCCGACGGATTC";
    const mismatch = 0;

    const results = search(query, mismatch, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
  });

  it("finds subsequence with mismatch", () => {
    const query = "gccggac"; // GC mismatch
    const subject = "gattgcccgacggattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject, "dna");
    const resultsNull = search(query, 0, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
    expect(resultsNull.length).toEqual(0);
  });

  /* test a full range of casing possibilities for one mismatch=1, no wildcards */
  it("finds subsequence with mismatch", () => {
    const query = "gccggac"; // GC mismatch
    const subject = "gattgcccgacggattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject, "dna");
    const resultsNull = search(query, 0, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch", () => {
    const query = "gccggac"; // GC mismatch
    const subject = "gattgcccgacggattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject, "dna");
    const resultsNull = search(query, 0, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch", () => {
    const query = "gccggac"; // GC mismatch
    const subject = "gattgcccgacggattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject, "dna");
    const resultsNull = search(query, 0, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 11,
      start: 4,
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch, with wildcards", () => {
    const query = "gcccgacy"; // y=ct, a mismatch
    const subject = "gattgcccgacacattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject, "dna");
    const resultsNull = search(query, 0, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 12,
      start: 4,
    });
    expect(resultsNull.length).toEqual(0);
  });

  /* test a full range of casing possibilities for one mismatch=1, with wildcards */
  it("finds subsequence with mismatch, with wildcards, uppercase query", () => {
    const query = "GCCCGACY"; // y=ct, a mismatch
    const subject = "gattgcccgacacattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject, "dna");
    const resultsNull = search(query, 0, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 12,
      start: 4,
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch, with wildcards, uppercase subject", () => {
    const query = "gcccgacy"; // y=ct, a mismatch
    const subject = "GATTGCCCGACACATTC";
    const mismatch = 1;

    const results = search(query, mismatch, subject, "dna");
    const resultsNull = search(query, 0, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 12,
      start: 4,
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch, with wildcards, uppercase both", () => {
    const query = "GCCCGACY"; // y=ct, a mismatch
    const subject = "GATTGCCCGACACATTC";
    const mismatch = 1;

    const results = search(query, mismatch, subject, "dna");
    const resultsNull = search(query, 0, subject, "dna");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 12,
      start: 4,
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds amino-acid sequence with wild-card", () => {
    const query = "          BVNGH".trim(); // b is a wild-card
    const subject = "PILVELDGDVNGHKFSVSG";

    const results = search(query, 0, subject, "aa");

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      direction: 1,
      end: 13,
      start: 8,
    });
  });
});
