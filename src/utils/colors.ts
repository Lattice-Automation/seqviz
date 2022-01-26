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
  "#85A6FF", // light blue
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
  "#85A6FF": "#4C66AD", // light blue
};

export const INSERT_COLORS = [
  "#6bdbdc", // insert 1
  "#a066c9", // insert 2
  "#bbd44c", // insert 3
  "#f3995b", // insert 4
];

// color generator function
export const chooseRandomColor = (colors?: string[]) => {
  const choices = colors || COLORS;
  const randIndex = Math.floor(Math.random() * choices.length);
  return choices[randIndex];
};

/** get an "indexed" color from the colors array */
export const colorByIndex = (i, colors: string[]) => (colors || COLORS)[i % (colors || COLORS).length];

/** get an "indexed" color from the colors array */
export const borderColorByIndex = i => COLOR_BORDER_MAP[COLORS[i % COLORS.length]];

/** cache for input color to those 50% darker */
const darkerColorCache = {};

/** darken a HEX color by 50% */
export const darkerColor = c => {
  if (darkerColorCache[c]) {
    return darkerColorCache[c];
  }

  // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
  const darkerColor = pSBC(-0.5, c);
  darkerColorCache[c] = darkerColor;
  return darkerColor;
};

// Version 4.0
// from: https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
const pSBC = (p, c0, c1, l) => {
  let r,
    g,
    b,
    P,
    f,
    t,
    h,
    i = parseInt,
    m = Math.round,
    a = typeof c1 == "string";

  if (
    typeof p !== "number" ||
    p < -1 ||
    p > 1 ||
    typeof c0 !== "string" ||
    (c0[0] !== "r" && c0[0] !== "#") ||
    (c1 && !a)
  ) {
    return null;
  }

  const pSBCr = d => {
    let n = d.length;
    let x = {};
    if (n > 9) {
      [r, g, b, a] = d = d.split(",");
      n = d.length;

      if (n < 3 || n > 4) return null;

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'r' does not exist on type '{}'.
      x.r = i(r[3] === "a" ? r.slice(5) : r.slice(4));
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'g' does not exist on type '{}'.
      x.g = i(g);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'b' does not exist on type '{}'.
      x.b = i(b);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'a' does not exist on type '{}'.
      x.a = a ? parseFloat(a) : -1;
    } else {
      if (n === 8 || n === 6 || n < 4) return null;
      if (n < 6) {
        d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
      }
      d = i(d.slice(1), 16);

      if (n === 9 || n === 5) {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'r' does not exist on type '{}'.
        x.r = (d >> 24) & 255;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'g' does not exist on type '{}'.
        x.g = (d >> 16) & 255;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'b' does not exist on type '{}'.
        x.b = (d >> 8) & 255;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'a' does not exist on type '{}'.
        x.a = m((d & 255) / 0.255) / 1000;
      } else {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'r' does not exist on type '{}'.
        x.r = d >> 16;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'g' does not exist on type '{}'.
        x.g = (d >> 8) & 255;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'b' does not exist on type '{}'.
        x.b = d & 255;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'a' does not exist on type '{}'.
        x.a = -1;
      }
    }

    return x;
  };

  h = c0.length > 9;
  h = a ? (c1.length > 9 ? true : c1 === "c" ? !h : false) : h;
  f = pSBCr(c0);
  P = p < 0;
  t = c1 && c1 !== "c" ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
  p = P ? p * -1 : p;
  P = 1 - p;
  if (!f || !t) return null;

  if (l) {
    r = m(P * f.r + p * t.r);
    g = m(P * f.g + p * t.g);
    b = m(P * f.b + p * t.b);
  } else {
    r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5);
    g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5);
    b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
  }

  a = f.a;
  t = t.a;
  // @ts-expect-error ts-migrate(2365) FIXME: Operator '>=' cannot be applied to types 'boolean'... Remove this comment to see the full error message
  f = a >= 0 || t >= 0;
  // @ts-expect-error ts-migrate(2365) FIXME: Operator '<' cannot be applied to types 'boolean' ... Remove this comment to see the full error message
  a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;

  if (h) {
    // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
    return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
  } else {
    return (
      "#" +
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
    );
  }
};
