import { Part } from "../../elements";
import { complement, directionality, partFactory } from "../../parser";
import randomid from "../../randomid";

/**
 * Benchling format is just JSON. Besides a slight diff in seq naming and annotation directionality,
 * Benchling's model matches seqviz's
 */
export default async (text: string): Promise<Part[]> => {
  const partJSON = JSON.parse(text);
  const { compSeq, seq } = complement(partJSON.bases);

  // throw an error if the sequence is empty
  if (seq.length < 1) {
    return Promise.reject(new Error("Empty part sequence... invalid"));
  }

  return [
    {
      ...partFactory(),
      annotations: partJSON.annotations.map(a => ({
        ...a,
        direction: directionality(a.strand),
        id: randomid(),
      })),
      compSeq: compSeq,
      name: partJSON.name || partJSON._id,
      seq: seq,
    },
  ];
};
