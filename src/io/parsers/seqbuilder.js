import { dnaComplement, partFactory, extractDate } from "../../utils/parser";
// @ts-ignore
import { annotationFactory } from "../../utils/sequence.ts";

// a list of recognized types that would constitute an annotation name
const tagNameList = ["gene", "product", "note", "db_xref", "protein_id", "label", "lab_host"];

// a list of tags that could represent colors
const tagColorList = ["ApEinfo_fwdcolor", "ApEinfo_revcolor", "loom_color"];

/**
 * takes in a string representation of a SeqBuilder file and outputs our
 * part representation of it. an example of a SeqBuilder file can be found
 * at imports/io/examples/seqbuilder, though there may be variations to the
 * format
 */
export default async (fileInput, fileName, colors = []) =>
  fileInput.split(/\/\/\s/g).map(file => {
    // +++++SEQUENCE+++++//
    // the part sequence comes after the line that specifies the seqbuilder version number
    const SEQ_ROWS = file
      .substring(
        file.search(/.*?written by seqbuilder .*?[0-9.]+[^actg]+/i) +
          file.match(/.*?written by seqbuilder .*?[0-9.]+[^actg]+/i)[0].length,
        file.length
      )
      .match(/[actgyrwskmdvhbxn]+/gim)[0];

    let seq = SEQ_ROWS;
    let compSeq = "";
    ({ seq, compSeq } = dnaComplement(seq)); // seq and compSeq
    // there may be a genbank-like header row after the sequence
    // LOCUS       SCU49845     5028 bp    DNA             PLN       21-JUN-1999
    let parsedName = fileName.length > 0 ? fileName : "Unnamed";
    let date = Date.now();
    let circular = false;

    if (seq.length > 500000) {
      throw new Error(
        `Import of sequence length ${seq.length}bp failed. Please keep sequences under 500000bp.`,
        seq.length
      );
    }
    if (~file.indexOf("LOCUS")) {
      const HEADER_ROW = file.substring(file.indexOf("LOCUS"), file.search(/\\n|\n/));
      if (HEADER_ROW && HEADER_ROW.split(/\s{2,}/g)) {
        const [, name, ...headerRest] = HEADER_ROW.split(/\s{2,}/g).filter(h => h);
        parsedName = name;
        date = extractDate(headerRest);
        if (HEADER_ROW.includes("circular")) {
          circular = true;
        }
      }
    }
    // Name setting logic ported from GenBank parser
    if (
      (parsedName === "Exported" && file.includes("SnapGene")) || // stupid Snapgene name
      Number.parseInt(parsedName, 10) // it thinks seq-length is the name
    ) {
      // first try and get the name from ACCESSION
      let accessionName = false;
      if (file.includes("ACCESSION")) {
        // this will be undefined is there is no
        const accession = file
          .substring(file.indexOf("ACCESSION"), file.indexOf("\n", file.indexOf("ACCESSION")))
          .replace(".", "")
          .split(/\s{2,}/)
          .filter(a => a !== "ACCESSION")
          .pop();
        if (accession) {
          parsedName = accession;
          accessionName = true;
        }
      }

      // otherwise, revert to trying to get the part name from the file name
      if (!accessionName && fileName) {
        parsedName = fileName
          .substring(0, Math.max(fileName.search(/\n|\||\./), fileName.lastIndexOf(".")))
          .replace(/\/\s/g, "");
      } else if (!accessionName) {
        parsedName = "Unnamed"; // give up
      }
    }

    // +++++ANNOTATIONS+++++//
    // the features are translated into annotations
    // region is FEATURES thru ORIGIN
    // FEATURES             Location/Qualifiers
    //   source          1..5028
    //                   /organism="Saccharomyces cerevisiae"
    //                   /db_xref="taxon:4932"
    //                   /chromosome="IX"
    //                   /map="9"
    //
    // in the example above, source is the annotation "type" and name is "taxon:4932"
    // because "db_xref" is a recognized name type
    // the name depends on whether the tag type is in the reocgnized list of types
    const annotations = [];
    if (file.indexOf("FEATURES")) {
      const FEATURES_LINE = file.indexOf("FEATURES");
      const FEATURES_NEW_LINE = file.indexOf("\n", FEATURES_LINE);
      let ORIGIN_LINE = file.lastIndexOf("ORIGIN");

      // some files have a contig file line that needs to parsed out/ shouldn't be included in
      // the features parsing
      if (file.includes("CONTIG")) {
        ORIGIN_LINE = Math.min(ORIGIN_LINE, file.indexOf("CONTIG"));
      }
      const FEATURES_ROWS = file
        .substring(FEATURES_NEW_LINE, ORIGIN_LINE)
        .split(/\n/)
        .filter(r => r);

      FEATURES_ROWS.forEach(r => {
        // in the example above, the following converts it to ['source', '1..5028']
        const currLine = r.split(/\s{2,}/g).filter(l => l);
        if (currLine.length > 1) {
          // it's the beginning of a new feature/annotation
          const [type, rangeString] = currLine;
          // console.log(currLine);
          const rangeRegex = /\d+/g;
          const direction = r.includes("complement") ? -1 : 1;

          // using the example above, this parses 1..5028 into 1 and 5028
          let [start, end] = [0, 0];
          const startSearch = rangeRegex.exec(rangeString);

          if (startSearch) {
            // the - 1 is because genbank is 1-based while we're 0
            start = +startSearch[0] - (1 % seq.length);
            const endSearch = rangeRegex.exec(rangeString);
            // console.log(endSearch);
            if (endSearch) {
              end = +endSearch[0] % seq.length;
            }
          }

          if (type !== "source") {
            // source would just be an annotation for the entire sequence so remove
            // create a new annotation around the properties in this line (type and range)
            annotations.push({
              ...annotationFactory(),
              type,
              start,
              end,
              direction
            });
          }
        } else if (currLine.length === 1) {
          // it's a continuation of a prior feature/annotation
          // any updates (to name or color) to the last annotation should affect
          // the last annotation that's in the array
          let [tag] = currLine;
          tag = tag.replace(/[/"]/g, ""); // get rid of quotation marks and forward slaches
          // should now look like ['organism', 'Saccharomyces cerevisiae']
          const [tagName, tagValue] = tag.split(/=/);

          // the two values that can be extracted are name or color
          const lastAnnIndex = annotations.length - 1;
          if (tagNameList.includes(tagName)) {
            // it's key value pair where the key is something we recognize as an annotation name
            if (lastAnnIndex > -1 && !annotations[annotations.length - 1].name) {
              // defensively check that there isn't already a defined annotation w/o a name
              annotations[annotations.length - 1].name = tagValue.trim();
            }
          } else if (tagColorList.includes(tagName)) {
            // it's key value pair where the key is something we recognize as an annotation color
            if (lastAnnIndex > -1) {
              // defensively check that there's already been a defined annotation
              annotations[annotations.length - 1].color = tagValue;
            }
          }
        }
      });
    }

    // try to figure out whether the part is linear or circular
    // hints for a part being circular include:
    // circular in the header row
    // annotations that cross zero index
    // words like circular within the circular row
    // words like plasmid within the text/name
    if (annotations.find(a => !(a.end === 0 && a.start) && a.start > a.end)) {
      circular = true;
    }

    return {
      ...partFactory(),
      name: parsedName.trim() || fileName,
      date: date,
      seq: seq,
      compSeq: compSeq,
      annotations: annotations,
      circular: circular
    };
  });
