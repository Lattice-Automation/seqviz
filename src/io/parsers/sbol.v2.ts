import * as xml2js from "xml2js";
import { partFactory, dnaComplement } from "../../utils/parser";
import { annotationFactory } from "../../utils/sequence";

/**
 * SBOL v2.0 schema definition can be found at: http://sbolstandard.org/wp-content/uploads/2016/06/SBOL-data-model-2.2.1.pdf
 * differs from SBOL 1 in that the ComponentDefinitions are like the root parts,
 * and the sequence and annotations are separated (they're no longer defined relationally
 * by nesting but, instead, by id)
 *
 * we only care about components that have sequence information
 */

// get the first string/number child out of an array of possible null elements
const first = elArr => {
  if (elArr && elArr[0] && elArr[0]._) {
    return elArr[0]._;
  }
  return null;
};

/**
 * takes an SBOL file, as a string, and converts it into our DB
 * representation of a part(s). an example of this type of file can be
 * found in ../examples/j5.SBOL.xml
 */
export default async (sbol, fileName, colors = []) =>
  new Promise((resolve, reject) => {
    // util reject function that will be triggered if any fields fail
    const rejectSBOL = errType => reject(new Error(`Failed on SBOLv2 file: ${errType}`));

    // weird edge case with directed quotation characters
    const fileString = sbol.replace(/“|”/g, '"');

    xml2js.parseString(
      fileString,
      {
        xmlns: true,
        attrkey: "xml_tag",
        tagNameProcessors: [xml2js.processors.stripPrefix],
      },
      (err, parsedSBOL) => {
        if (err) {
          rejectSBOL(err);
        }

        let RDF = null;
        if (parsedSBOL.RDF) {
          ({ RDF } = parsedSBOL);
        }

        if (!RDF) {
          reject(new Error("No root RDF document"));
        }

        // check if anything is defined, return if not
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'ComponentDefinition' does not exist on t... Remove this comment to see the full error message
        const { ComponentDefinition, Sequence } = RDF;
        if (!ComponentDefinition || !ComponentDefinition.length || !Sequence) {
          resolve([]);
        }

        // it's a collection of DnaComponents, parse each to a part
        const partList = [];
        ComponentDefinition.forEach((c, i) => {
          // we're only making parts out of those with seq info
          if (!c.sequence || !c.sequence.length) {
            return;
          }

          const { displayId, description, sequence, sequenceAnnotation } = c;
          const name = first(displayId) || `${fileName}_${i + 1}`;
          const note = first(description) || "";

          const annotations = [];
          (sequenceAnnotation || []).forEach(({ SequenceAnnotation }) => {
            const ann = SequenceAnnotation[0];
            const annId = first(ann.displayId);
            const { Range } = ann.location[0];

            const range = Range[0];
            annotations.push({
              ...annotationFactory(annId),
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              name: annId,
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
              start: first(range.start) - 1,
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
              end: first(range.end) - 1,
            });
          });

          const seqID = sequence[0].xml_tag["rdf:resource"].value;

          // try and find sequence data
          const partSeq = Sequence.find(
            s =>
              (s.persistentIdentity &&
                s.persistentIdentity.length &&
                s.persistentIdentity[0].xml_tag["rdf:resource"].value === seqID) ||
              s.xml_tag["rdf:about"].value === seqID
          );

          if (partSeq && partSeq.elements) {
            const seqInput = first(partSeq.elements) || "";
            const { seq, compSeq } = dnaComplement(seqInput);
            partList.push({
              ...partFactory(),
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              name,
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
              note,
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
              seq,
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
              compSeq,
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'never[]' is not assignable to type 'never'.
              annotations,
            });
          }
        });

        // check whether any parts were created from the collection
        if (partList.length) {
          resolve(partList);
        }

        // nothing in root
        resolve([]);
      }
    );
  });
