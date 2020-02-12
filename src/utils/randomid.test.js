import randomid from "./randomid";

describe("Create random IDs", () => {
  it("creates unique IDs", () => {
    const seenIDs = new Set();

    for (let i = 0; i < 10; i++) {
      const id = randomid();

      expect(typeof id).toEqual(typeof "");
      expect(id.length).toEqual(7);
      expect(seenIDs.has(id)).toBe(false);

      seenIDs.add(id);
    }
  });
});
