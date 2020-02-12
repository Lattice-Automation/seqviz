import xml2js, { processors } from "xml2js";

import { colorByIndex } from "../../utils/colors";
import { dnaComplement, partFactory } from "../../utils/parser";
import randomid from "../../utils/randomid";

/*
  <sbol:Sequence rdf:about="https://synbiohub.cidarlab.org/public/Demo/A1_sequence/1">
    <sbol:persistentIdentity rdf:resource="https://synbiohub.cidarlab.org/public/Demo/A1_sequence"/>
    <sbol:displayId>A1_sequence</sbol:displayId>
    <sbol:version>1</sbol:version>
    <prov:wasDerivedFrom rdf:resource="https://github.com/CIDARLAB/cello/blob/master/resources/UCF/Eco1C1G1T0.UCF.json"/>
    <prov:wasGeneratedBy rdf:resource="https://synbiohub.cidarlab.org/public/Demo/cello2sbol/1"/>
    <dcterms:title>A1_sequence</dcterms:title>
    <sbh:ownedBy rdf:resource="https://synbiohub.cidarlab.org/user/prash"/>
    <sbh:topLevel rdf:resource="https://synbiohub.cidarlab.org/public/Demo/A1_sequence/1"/>
    <sbol:elements>AATGTTCCCTAATAATCAGCAAAGAGGTTACTAG</sbol:elements>
    <sbol:encoding rdf:resource="http://www.chem.qmul.ac.uk/iubmb/misc/naseq.html"/>
  </sbol:Sequence>
*/

/**
 * after getting a DnaComponent out of the SBOL document,
 * at either the root RDF level or from within a Collection/Annotation
 * heirarchy, convert that DnaComponent to a part
 *
 * @param {boolean}  strict  if we're digging through the SBOL, desperate to
 * 							 find something that looks remotely like a valid part
 * 							 (ie, after we can't make a valid part from root DnaComponent
 * 							 or root Collection), we will only accept parts that have both
 * 							 name and sequence information. Otherwise we might get too
 * 							 desperate and wind up with some oddly malformed parts
 */
const dnaComponentToPart = (DnaComponent, options) => {
  const { strict = false, file } = options;
  // destructure the paramaeters from DnaComponent
  const { name, displayId, dnaSequence, annotation } = DnaComponent;

  // attempt to get the name out of the SBOL
  let parsedName = "Unnamed";
  if (name && name[0] && name[0]._) {
    parsedName = name[0]._;
  } else if (displayId && displayId[0] && displayId[0]._) {
    parsedName = displayId[0]._;
  } else if (strict) {
    // in this scenario, we're really scrapping to find parts, but shouldn't
    // accept any that don't at least have some name and sequence information
    return null;
  }

  // attempt to get the sequence. fail if it's not findable
  let seq = "";
  if (dnaSequence && dnaSequence[0] && dnaSequence[0].DnaSequence) {
    const { DnaSequence } = dnaSequence[0];
    if (
      DnaSequence[0] &&
      DnaSequence[0].nucleotides &&
      DnaSequence[0].nucleotides[0] &&
      DnaSequence[0].nucleotides[0]._
    ) {
      seq = DnaSequence[0].nucleotides[0]._;
    }
  }
  const { seq: parsedSeq, compSeq: parsedCompSeq } = dnaComplement(seq); // seq and compSeq
  if (!parsedSeq) return null;

  // attempt to parse the SBOL annotations into our version of annotations
  const annotations = [];
  if (annotation) {
    annotation.forEach(({ SequenceAnnotation }, i) => {
      if (!SequenceAnnotation || !SequenceAnnotation[0]) return;

      const {
        bioStart = [{}],
        bioEnd = [{}],
        strand,
        subComponent
      } = SequenceAnnotation[0];
      if (
        subComponent &&
        subComponent[0] &&
        subComponent[0].DnaComponent &&
        subComponent[0].DnaComponent[0]
      ) {
        const {
          type: annType = [{}],
          displayId: annId = [{}],
          name: annName = [{}]
        } = subComponent[0].DnaComponent[0];

        annotations.push({
          id: randomid(),
          color: colorByIndex(i),
          start: bioStart[0]._ - 1 || 0, // sbol is 1-based
          end: bioEnd[0]._ || 0, // we're 0-based
          direction: strand[0]._ === "+" ? 1 : -1,
          type: annType[0]._ || "N/A",
          name: annName[0]._ || annId[0]._ || "Untitled"
        });
      }
    });
  }

  // guess whether it's circular or not based on the presence of a word like vector.
  // very ad hoc
  const circular = file.search(/plasmid/i) > 0;

  return {
    ...partFactory(),
    seq: parsedSeq,
    compSeq: parsedCompSeq,
    name: parsedName,
    annotations: annotations,
    circular: circular
  };
};

/**
 * find all nodes that of the type Sequence, and convert those to parts "Sequence" -> Part
 *
 * @param {String}  file    the original file that was used to make the parts
 * this is not the standard format. see A1.xml
 */
const sequenceToPart = (Seq, file) => {
  // get the name
  const name =
    (Seq.displayId[0] && Seq.displayId[0]._) ||
    (Seq.title[0] && Seq.title[0]._) ||
    "Unnamed";

  // get the sequence
  const seqOrig = (Seq.elements[0] && Seq.elements[0]._) || "";

  const { seq, compSeq } = dnaComplement(seqOrig);

  // guess whether it's circular or not based on the presence of a word like vector.
  // very ad hoc
  const circular = file.search(/plasmid/i) > 0;

  return { ...partFactory(), name, seq, compSeq, circular };
};

/**
 * find all the nodes within the SBOL JSON document that are keyed "DnaComponent"
 *
 * this is a last-resort scrapper that tries to find valid parts that aren't within a root
 * DnaComponent document or within a root Collection array
 */
const findDnaComponentNodes = (acc, doc) => {
  Object.keys(doc).forEach(k => {
    if (k === "DnaComponent" && doc[k].length) acc.push(...doc[k]);
    if (Array.isArray(doc[k])) {
      doc[k].forEach(nestedNode => {
        findDnaComponentNodes(acc, nestedNode);
      });
    }
  });
};

/**
 * find all the nodes within the JSON document that are keyed "Sequence"
 *
 * this is another last-resort scrapper for trying to find valid parts
 */
const findSequenceNodes = (acc, doc) => {
  Object.keys(doc).forEach(k => {
    if (k === "Sequence" && doc[k].length) acc.push(...doc[k]);
    if (Array.isArray(doc[k])) {
      doc[k].forEach(nestedNode => {
        findSequenceNodes(acc, nestedNode);
      });
    }
  });
};

/**
 * takes an SBOL file, as a string, and converts it into our DB
 * representation of a part(s). an example of this type of file can be
 * found in ../examples/j5.SBOL.xml
 */
export default async (sbol, colors = []) =>
  new Promise((resolve, reject) => {
    // it shouldn't take longer than this to parse the SBOL file
    setTimeout(() => {
      reject(new Error("Took to long to parse SBOL"));
    }, 2000);

    // util reject function that will be triggered if any fields fail
    const rejectSBOL = errType =>
      reject(new Error(`Failed on SBOL file; ${errType}`));

    // weird edge case with directed quotation characters
    const fileString = sbol.replace(/“|”/g, '"');

    xml2js.parseString(
      fileString,
      {
        xmlns: true,
        attrkey: "xml_tag",
        tagNameProcessors: [processors.stripPrefix]
      },
      (err, parsedSBOL) => {
        if (err) rejectSBOL(err);
        let RDF = null;
        if (parsedSBOL.RDF) ({ RDF } = parsedSBOL);
        if (!RDF) reject(new Error("No root RDF document"));

        const { Collection, DnaComponent } = RDF;
        if (Collection && Collection.length) {
          // it's a collection of DnaComponents, parse each to a part
          const partList = [];
          Collection.forEach(({ component }) => {
            if (component && component.length) {
              component.forEach(({ DnaComponent: nestedDnaComponent }) => {
                partList.push(
                  dnaComponentToPart(nestedDnaComponent[0], {
                    strict: false,
                    file: sbol,
                    colors: colors
                  })
                );
              });
            }
          });

          // check whether any parts were created from the collection
          if (partList.length) resolve(partList);
        } else if (DnaComponent && DnaComponent.length) {
          // create a single part from the single one passed
          const validPart = dnaComponentToPart(DnaComponent[0], {
            strict: false,
            file: sbol,
            colors: colors
          });
          // it will be null if there isnt' any sequence information beneath it
          if (validPart) resolve([validPart]);
        }

        // go on a fishing expedition for DnaComponents
        // everything else has failed
        // accumulate all that are "valid" (name + seq)
        const dnaComponentAccumulator = [];
        findDnaComponentNodes(dnaComponentAccumulator, RDF);
        const attemptedParts = dnaComponentAccumulator
          .map(p =>
            dnaComponentToPart(p, {
              strict: true,
              file: sbol,
              colors: colors
            })
          )
          .filter(p => p); // invalid parts will be null
        if (attemptedParts.length) resolve(attemptedParts);

        // go on another fishing expidition, but for Sequence nodes
        const dnaSequenceAccumulator = [];
        findSequenceNodes(dnaSequenceAccumulator, RDF);
        const sequenceNodes = dnaSequenceAccumulator
          .map(p => sequenceToPart(p, sbol))
          .filter(p => p); // invalid parts will be null
        if (sequenceNodes.length) resolve(sequenceNodes);

        // neither a DnaComponent nor Collection was found anywhere in document
        reject(new Error("no valid DnaComponent or Collection"));
      }
    );
  });
