import { dnaComplement, partFactory, extractDate } from "../../utils/parser";

import { annotationFactory } from "../../utils/sequence";

// a list of recognized types that would constitute an annotation name
const tagNameSet = new Set(["gene", "product", "note", "db_xref", "protein_id", "label", "lab_host", "locus_tag"]);

// a list of tags that could represent colors
const tagColorSet = new Set(["ApEinfo_fwdcolor", "ApEinfo_revcolor", "loom_color"]);

/**
 * takes in a string representation of a GenBank file and outputs our
 * part representation of it. an example of a Genbank file can be found
 * at ./parsers/Gebank, though there is significant variability to the
 * format
 *
 * another official example can be found at:
 * https://www.ncbi.nlm.nih.gov/Sitemap/samplerecord.html
 */
export default async (fileInput, fileName, colors = []) =>
  fileInput
    .split(/\/\/\s/g)
    .filter(f => f.length > 5)
    .map(file => {
      // the first row contains the name of the part and its creation date
      // LOCUS       SCU49845     5028 bp    DNA             PLN       21-JUN-1999
      const HEADER_ROW = file.substring(file.indexOf("LOCUS"), file.search(/\\n|\n/));
      const [, name, ...headerRest] = HEADER_ROW.split(/\s{2,}/g).filter(h => h);
      // trying to avoid giving a stupid name like Exported which Snapgene has by default
      // also, if there is not name in header, the seq length will be used as name, which should
      // be corrected (Number.parseInt to check for this case) https://stackoverflow.com/a/175787/7541747

      // +++++META DATA+++++//
      let parsedName = name;
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

      const date = extractDate(headerRest);

      // +++++SEQUENCE+++++//
      // the part sequence is contained in and after the line that begins with ORIGIN
      // do this before annotations so we can calc seqlength
      //
      // ORIGIN
      //    1 gatcctccat atacaacggt atctccacct caggtttaga tctcaacaac ggaaccattg
      //    61 ccgacatgag acagttaggt atcgtcgaga gttacaagct aaaacgagca gtagtcagct
      const SEQ_ROWS = file.substring(file.lastIndexOf("ORIGIN") + "ORIGIN".length, file.length);
      let seq = SEQ_ROWS.replace(/[^gatc]/gi, "");
      let compSeq = "";
      ({ seq, compSeq } = dnaComplement(seq)); // seq and compSeq

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
      const primers = [];
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

        FEATURES_ROWS.forEach((r, row_i) => {
          // in the example above, the following converts it to ['source', '1..5028']
          const currLine = r.split(/\s{2,}/g).filter(l => l);
          if (currLine.length > 1) {
            // it's the beginning of a new feature/annotation
            const [type, rangeString] = currLine;
            const rangeRegex = /\d+/g;
            const direction = r.includes("complement") ? -1 : 1;

            // using the example above, this parses 1..5028 into 1 and 5028
            let [start, end] = [0, 0];
            const startSearch = rangeRegex.exec(rangeString);

            if (startSearch) {
              // the - 1 is because genbank is 1-based while we're 0
              start = +startSearch[0] - (1 % seq.length);
              // single bp annotations are a thing in Genbank:
              // https://github.com/Lattice-Automation/seqviz/issues/117
              end = (start + 1) % seq.length;
              const endSearch = rangeRegex.exec(rangeString);
              if (endSearch) {
                end = +endSearch[0] % seq.length;
              }
            }

            if (type !== "source") {
              // create a new annotation around the properties in this line (type and range)
              annotations.push({
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'never[]' is not assignable to pa... Remove this comment to see the full error message
                ...annotationFactory(row_i, colors),
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'any' is not assignable to type 'never'.
                type,
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
                start,
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
                end,
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'never'.
                direction,
              });
            }
          } else if (currLine.length === 1) {
            // it's a continuation of a prior feature/annotation
            // any updates (to name or color) to the last annotation should affect
            // the last annotation that's in the array
            if (currLine[0].startsWith("/")) {
              let [tag] = currLine;
              tag = tag.replace(/[/"]/g, ""); // get rid of quotation marks and forward slaches
              // should now look like ['organism', 'Saccharomyces cerevisiae']
              const [tagName, tagValue] = tag.split(/=/);

              // the two values that can be extracted are name or color
              const lastAnn = annotations.length - 1;
              if (tagNameSet.has(tagName.toLowerCase())) {
                // the key is something we recognize as an annotation name
                // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'never'.
                if (lastAnn >= 0 && !annotations[lastAnn].name) {
                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'never'.
                  annotations[lastAnn].name = tagValue.trim();
                }
              } else if (tagColorSet.has(tagName)) {
                // the key is something we recognize as an annotation color
                if (lastAnn > -1) {
                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'color' does not exist on type 'never'.
                  annotations[lastAnn].color = tagValue;
                }
              } else if (tagName === "loom_primer_sequence") {
                // Loom specific tag used to preserve mismatches
                // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'primerFlag'.
                if (primerFlag) {
                  // @ts-expect-error ts-migrate(2339) FIXME: Property 'sequence' does not exist on type 'never'... Remove this comment to see the full error message
                  primers[primers.length - 1].sequence = tagValue;
                }
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
      let circular = false;
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'end' does not exist on type 'never'.
      if (annotations.find(a => !(a.end === 0 && a.start) && a.start > a.end) || HEADER_ROW.includes("circular")) {
        circular = true;
      }

      return {
        ...partFactory(),
        name: parsedName.trim() || fileName,
        date: date,
        seq: seq,
        compSeq: compSeq,
        annotations: annotations,
        primers: primers,
        circular: circular,
      };
    });
