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
});
