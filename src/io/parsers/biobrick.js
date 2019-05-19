import { genRandomColor } from "../../Utils/colors";
import { dnaComplement, firstElement, partFactory } from "../../Utils/parser";
import shortid from "shortid";
import xml2js from "xml2js";

/**
 * converts an XML part representation of a BioBrick part into a format
 * compatible with our DB representation of a part.
 *
 * with all the error handling this file reads like a Golang script
 *
 * an exmaple of the XML file that's parsed is in ./examples/biobrick
 */
export default async (file, options) =>
  new Promise((resolve, reject) => {
    const { colors = [], backbone = "" } = options;
    // util reject function that will be triggered if any fields fail
    const rejectBioBrick = errType =>
      reject(new Error(`Failed on BioBrick because ${errType}`));

    // by default, all nodes are pushed to arrays, even if just a single child element
    // is present in the XML
    xml2js.parseString(file, {}, (err, response) => {
      if (err) rejectBioBrick(`XML to JSON: ${err}`);

      // get the first part
      let part = firstElement(response.rsbpml.part_list);
      if (!part || !part.part) rejectBioBrick("getting first part");

      // part is also an array... xml...
      part = firstElement(part.part);
      if (!part) rejectBioBrick("getting first part");

      // extract the userful fields
      const { sequences, part_name, features: featureArray } = part;

      // go another level...
      const seq_data = firstElement(sequences);
      if (!seq_data || !seq_data.seq_data) rejectBioBrick("getting seq_data");

      const seq = firstElement(seq_data.seq_data) + backbone;
      const name = firstElement(part_name);

      // assume it failed
      if (!seq || !name || !featureArray) {
        rejectBioBrick("seq || name || featureArray");
      }

      resolve([
        {
          ...partFactory(),
          ...dnaComplement(seq), // seq and compSeq
          name: name,
          annotations: featureArray
            .map(f => {
              if (!f.feature) return null;
              const currFet = f.feature[0];

              if (!currFet) return null;
              const { direction, startpos, endpos, type, title } = currFet;

              return {
                id: shortid.generate(),
                direction: direction[0] === "forward" ? "FORWARD" : "REVERSE",
                start: +startpos[0] || 0,
                end: +endpos[0] || 0,
                name: title[0] || "Untitled",
                color: genRandomColor(colors),
                type: type[0] || "N/A"
              };
            })
            .filter(a => a)
        }
      ]);
    });
  });
