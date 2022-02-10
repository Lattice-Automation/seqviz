import { partFactory, dnaComplement } from "../../utils/parser";
import randomid from "../../utils/randomid";

/**
 * Benchling presents the easiest format to parse, because their JSON
 * format is very close to our own
 */
export default async text => {
  // we've already checked, outside this file, that's it's JSON parseable
  const partJSON = JSON.parse(text);

  const { seq, compSeq } = dnaComplement(partJSON.bases);

  // throw an error if the sequence is empty
  if (seq.length < 1) {
    return Promise.reject(new Error("Empty part sequence... invalid"));
  }

  const part = {
    ...partFactory(),
    name: partJSON.name || partJSON._id,
    date: new Date(partJSON.modifiedAt).getTime(),
    seq: seq,
    compSeq: compSeq,
    annotations: partJSON.annotations.map(a => ({
      ...a,
      id: randomid(),
      direction: a.strand === 0 ? 1 : a.strand === 1 ? -1 : "NONE",
    })),
  };

  return [part];
};
