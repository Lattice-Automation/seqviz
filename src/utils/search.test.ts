import search from "./search";

describe("Search", () => {
  it("finds subsequence without mismatch or ambiguity", () => {
    const query = "tatt";
    const subject = "gcgagttattcggcgtgg";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 6,
      end: 10,
      direction: 1
    });
  });

  it("finds subsequence without mismatch or ambiguity, uppercase query", () => {
    const query = "TATT";
    const subject = "gcgagttattcggcgtgg";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 6,
      end: 10,
      direction: 1
    });
  });

  /* test a full range of casing possibilities for one mismatch=0, no wildcards */
  it("finds subsequence without mismatch or ambiguity, uppercase subject", () => {
    const query = "tatt";
    const subject = "GCGAGTTATTCGGCGTGG";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 6,
      end: 10,
      direction: 1
    });
  });

  it("finds subsequence without mismatch or ambiguity, uppercase both", () => {
    const query = "TATT";
    const subject = "GCGAGTTATTCGGCGTGG";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 6,
      end: 10,
      direction: 1
    });
  });

  it("finds subsequence without mismatch or ambiguity in RC", () => {
    const query = "aata";
    const subject = "gcgagttattcggcgtgg";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 6,
      end: 10,
      direction: -1
    });
  });

  it("finds subsequence with ambiguity", () => {
    const query = "gcccgnn"; // N character
    const subject = "gattgcccgacggattc";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 11,
      direction: 1
    });
  });

  /* test a full range of casing possibilities for one mismatch=0, with wildcards */
  it("finds subsequence with ambiguity, uppercase query, wildcard", () => {
    const query = "GCCCGNN"; // N character
    const subject = "gattgcccgacggattc";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 11,
      direction: 1
    });
  });

  it("finds subsequence with ambiguity, uppercase subject, wildcard", () => {
    const query = "gcccgnn"; // N character
    const subject = "GATTGCCCGACGGATTC";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 11,
      direction: 1
    });
  });

  it("finds subsequence with ambiguity, uppercase both, wildcard", () => {
    const query = "GCCCGNN"; // N character
    const subject = "GATTGCCCGACGGATTC";
    const mismatch = 0;

    const results = search(query, mismatch, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 11,
      direction: 1
    });
  });

  it("finds subsequence with mismatch", () => {
    const query = "gccggac"; // GC mismatch
    const subject = "gattgcccgacggattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject);
    const resultsNull = search(query, 0, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 11,
      direction: 1
    });
    expect(resultsNull.length).toEqual(0);
  });

  /* test a full range of casing possibilities for one mismatch=1, no wildcards */
  it("finds subsequence with mismatch", () => {
    const query = "gccggac"; // GC mismatch
    const subject = "gattgcccgacggattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject);
    const resultsNull = search(query, 0, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 11,
      direction: 1
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch", () => {
    const query = "gccggac"; // GC mismatch
    const subject = "gattgcccgacggattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject);
    const resultsNull = search(query, 0, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 11,
      direction: 1
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch", () => {
    const query = "gccggac"; // GC mismatch
    const subject = "gattgcccgacggattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject);
    const resultsNull = search(query, 0, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 11,
      direction: 1
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch, with wildcards", () => {
    const query = "gcccgacy"; // y=ct, a mismatch
    const subject = "gattgcccgacacattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject);
    const resultsNull = search(query, 0, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 12,
      direction: 1
    });
    expect(resultsNull.length).toEqual(0);
  });

  /* test a full range of casing possibilities for one mismatch=1, with wildcards */
  it("finds subsequence with mismatch, with wildcards, uppercase query", () => {
    const query = "GCCCGACY"; // y=ct, a mismatch
    const subject = "gattgcccgacacattc";
    const mismatch = 1;

    const results = search(query, mismatch, subject);
    const resultsNull = search(query, 0, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 12,
      direction: 1
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch, with wildcards, uppercase subject", () => {
    const query = "gcccgacy"; // y=ct, a mismatch
    const subject = "GATTGCCCGACACATTC";
    const mismatch = 1;

    const results = search(query, mismatch, subject);
    const resultsNull = search(query, 0, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 12,
      direction: 1
    });
    expect(resultsNull.length).toEqual(0);
  });

  it("finds subsequence with mismatch, with wildcards, uppercase both", () => {
    const query = "GCCCGACY"; // y=ct, a mismatch
    const subject = "GATTGCCCGACACATTC";
    const mismatch = 1;

    const results = search(query, mismatch, subject);
    const resultsNull = search(query, 0, subject);

    expect(results.length).toEqual(1);
    expect(results[0]).toMatchObject({
      start: 4,
      end: 12,
      direction: 1
    });
    expect(resultsNull.length).toEqual(0);
  });
});
