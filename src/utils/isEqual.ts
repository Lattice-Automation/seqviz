/**
 * Deep equality comparison between two objects
 *
 * copy-paste from StackOverflow: https://stackoverflow.com/a/25456134
 *
 
 
 */
const isEqual = (x, y) => {
  if (x === y) {
    return true;
  } else if (typeof x === "object" && x !== null && typeof y === "object" && y !== null) {
    if (Object.keys(x).length !== Object.keys(y).length) return false;

    for (const prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!isEqual(x[prop], y[prop])) return false;
      } else return false;
    }

    return true;
  }
  return false;
};

export default isEqual;
