import xml2js from "xml2js";

import { dnaComplement, firstElement, partFactory } from "../../utils/parser";
import { annotationFactory } from "../../utils/sequence";

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
    const { backbone = "" } = options;
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

      // go another level to get features...
      let features = firstElement(featureArray);
      if (features && "feature" in features) {
        features = features.feature;
      }

      const seq = firstElement(seq_data.seq_data) + backbone.backbone;
      const backboneName = backbone.name.length < 20 ? backbone.name : "";
      const name = `${firstElement(part_name)}-${backboneName}`;

      if (!seq || !name) {
        // assume it failed
        rejectBioBrick("seq || name || featureArray");
      }

      // parse the iGEM annotations
      const annotations = features
        .map(f => {
          if (!f) return null;

          const { direction, startpos, endpos, type, title } = f;

          return {
            ...annotationFactory(title[0] || `${direction[0]}-${startpos[0]}`),
            direction: direction[0] === "forward" ? "FORWARD" : "REVERSE",
            start: +startpos[0] || 0,
            end: +endpos[0] || 0,
            name: title[0] || "Untitled",
            type: type[0] || "N/A"
          };
        })
        .filter(a => a);

      // add another annotation for the backbone
      annotations.push({
        ...annotationFactory(backbone.name),
        start: firstElement(seq_data.seq_data).length,
        end: 0
      });

      resolve([
        {
          ...partFactory(),
          ...dnaComplement(seq), // seq and compSeq
          name: name,
          annotations: annotations
        }
      ]);
    });
  });
