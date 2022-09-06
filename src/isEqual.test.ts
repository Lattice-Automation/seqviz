import isEqual from "./isEqual";

describe("Deep equality checking", () => {
  it("compares two objects", () => {
    const o1 = { test: [1, 2, 3, 4] };
    const o2 = { test: [1, 2, 3, 4] };
    const o3 = { test: [1, 2, 3, 4, 5] };

    expect(o1 == o2).toBe(false);
    expect(isEqual(o1, o2)).toBe(true);
    expect(isEqual(o1, o3)).toBe(false);
  });
});
