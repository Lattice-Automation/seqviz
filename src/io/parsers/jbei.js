import { colorByIndex } from "../../utils/colors";
import { dnaComplement, partFactory } from "../../utils/parser";
import shortid from "shortid";
import xml2js, { processors } from "xml2js";

/**
 * takes an JBEI file, as a string, and converts it into our DB
 * representation of a part(s). an example of this type of file can be
 * found in ../examples/jbei
 */
export default async (JBEI, colors = []) =>
  new Promise((resolve, reject) => {
    // util reject function that will be triggered if any fields fail
    const rejectJBEI = errType =>
      reject(new Error(`Failed on JBEI file; ${errType}`));

    // weird edge case with directed quotation characters
    const fileString = JBEI.replace(/“|”/g, '"');

    xml2js.parseString(
      fileString,
      {
        xmlns: true,
        attrkey: "xml_tag",
        tagNameProcessors: [processors.stripPrefix]
      },
      (err, parsedJBEI) => {
        if (err) rejectJBEI(err);

        // destructure the paramaeters from JBEI
        const { seq } = parsedJBEI;
        const { name, sequence, features, circular } = seq;

        // attempt to get the name out of the JBEI
        let parsedName = "Unnamed";
        if (name && name[0] && name[0]._) {
          parsedName = name[0]._;
        }

        // attempt to get the sequence. fail if it's not findable
        let parsedSeq = "";
        if (sequence && sequence[0] && sequence[0]._) {
          parsedSeq = sequence[0]._;
        }
        const { seq: parsedSeq2, compSeq: parsedCompSeq } = dnaComplement(
          parsedSeq
        ); // seq and compSeq
        if (!parsedSeq2) return null;

        // attempt to figure out whether it's circular or linear. if circular
        // isn't a valid root level field, guess whether it's circular based
        // on length
        // https://www.researchgate.net/post/What_is_the_smallest_plasmid_vector_available
        let parsedCircular = parsedSeq2.length > 2000; // smallest plasmid is around 2k, see link above
        if (circular && circular[0] && circular[0]._) {
          parsedCircular = circular[0]._ === "true";
        }

        // attempt to parse the JBEI annotations into our version of annotations
        const annotations = [];
        if (features && features[0] && features[0].feature) {
          features[0].feature.forEach((feature, i) => {
            if (!feature) return;

            const {
              label = [{}],
              type = [{}],
              complement = [{}],
              location = []
            } = feature;
            if (
              location &&
              location[0] &&
              location[0].genbankStart &&
              location[0].end
            ) {
              annotations.push({
                id: shortid.generate(),
                color: colorByIndex(i),
                start: +location[0].genbankStart[0]._ - 1 || 0, // JBEI is 1-based
                end: +location[0].end[0]._ || 0,
                direction: complement[0]._ === "true" ? -1 : 1,
                type: type[0]._ || "N/A",
                name: label[0]._ || "Untitled"
              });
            }
          });
        }

        resolve([
          {
            ...partFactory(),
            seq: parsedSeq2,
            compSeq: parsedCompSeq,
            name: parsedName,
            annotations: annotations,
            circular: parsedCircular,
            source: fileString
          }
        ]);
      }
    );
  });
