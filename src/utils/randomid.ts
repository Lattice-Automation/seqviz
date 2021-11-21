/**
 * Create a random 10 digit string ID
 *
 * Lazily copied from StackOverflow: https://stackoverflow.com/a/57355127
 */
export default (n = 10) => {
  const add = 1;
  let max = 12 - add;
  max = Math.pow(10, n + add);
  const min = max / 10; // Math.pow(10, n) basically
  const number = Math.floor(Math.random() * (max - min + 1)) + min;
  return String(number).substring(add);
};
