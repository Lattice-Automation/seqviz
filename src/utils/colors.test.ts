import { COLORS, chooseRandomColor, darkerColor } from "./colors";

describe("Colors", () => {
  it("chooses a random color", () => {
    const randomColor = chooseRandomColor();

    expect(COLORS).toContain(randomColor);
  });

  it("darkens colors", () => {
    const hexMap = {
      "#F07": "#b40054",
      "#F7C672": "#af8c51",
      "#9DEAED": "#6fa5a8",
      "rgb(157, 234, 237)": "rgb(111,165,168)",
      "rgba(157, 234, 237, 0.3)": "rgba(111,165,168,0.3)",
    };

    Object.keys(hexMap).forEach(k => {
      expect(darkerColor(k)).toEqual(hexMap[k]);
    });
  });
});
