import { complement, partFactory } from "../../utils/parser";
import randomid from "../../utils/randomid";

/**
 * Benchling presents the easiest format to parse, because their JSON
 * format is very close to our own
 */
export default async text => {
  // we've already checked, outside this file, that's it's JSON parseable
  const partJSON = JSON.parse(text);

  const { compSeq, seq } = complement(partJSON.bases);

  // throw an error if the sequence is empty
  if (seq.length < 1) {
    return Promise.reject(new Error("Empty part sequence... invalid"));
  }

  const part = {
    ...partFactory(),
    annotations: partJSON.annotations.map(a => ({
      ...a,
      direction: a.strand === 0 ? 1 : a.strand === 1 ? -1 : "NONE",
      id: randomid(),
    })),
    compSeq: compSeq,
    date: new Date(partJSON.modifiedAt).getTime(),
    name: partJSON.name || partJSON._id,
    seq: seq,
  };

  return [part];
};
