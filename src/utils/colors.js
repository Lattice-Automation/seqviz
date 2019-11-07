/**
 * @typedef {COLORS}
 * @type {Array<String>}
 *
 * a color pallete of colors (for LinearSeq right now)\
 * generated using:
 * https://material.io/color/#!/?view.left=0&view.right=0&primary.color=FFCC80
 */
export const COLORS = [
  "#9DEAED", // cyan
  "#8FDE8C", // green
  "#CFF283", // light green
  "#8CDEBD", // teal
  "#F0A3CE", // pink
  "#F7C672", // orange
  "#F07F7F", // red
  "#FAA887", // red-orange
  "#F099F7", // magenta
  "#C59CFF", // purple
  "#6B81FF", // blue
  "#85A6FF" // light blue
];

export const COLOR_BORDER_MAP = {
  "#9DEAED": "#5EB5B8", // cyan
  "#8FDE8C": "#5CA35A", // green
  "#CFF283": "#8DB041", // light green
  "#8CDEBD": "#4CA17F", // teal
  "#F0A3CE": "#BD6295", // pink
  "#F7C672": "#BD872B", // orange
  "#F07F7F": "#AD4040", // red
  "#FAA887": "#B36446", // red-orange
  "#F099F7": "#AB63B0", // magenta
  "#C59CFF": "#8A60C4", // purple
  "#6B81FF": "#2E3B85", // blue
  "#85A6FF": "#4C66AD" // light blue
};

export const INSERT_COLORS = [
  "#6bdbdc", // insert 1
  "#a066c9", // insert 2
  "#bbd44c", // insert 3
  "#f3995b" // insert 4
];

// color generator function
export const genRandomColor = (colors = []) => {
  const choices = colors.length ? colors : COLORS;
  const randIndex = Math.floor(Math.random() * choices.length);
  return choices[randIndex];
};

/** get an "indexed" color from the colors array */
export const colorByIndex = i => COLORS[i % COLORS.length];

/** get an "indexed" color from the colors array */
export const borderColorByIndex = i =>
  COLOR_BORDER_MAP[COLORS[i % COLORS.length]];
