import path from "path";

import { COLORS } from "../utils/colors";
import { dnaComplement, partFactory } from "../utils/parser";
import parseBenchling from "./parsers/benchling";
import parseBioBrick from "./parsers/biobrick";
import parseFASTA from "./parsers/fasta";
import parseGenbank from "./parsers/genbank";
import parseJBEI from "./parsers/jbei";
import parseSBOL from "./parsers/sbol";
import parseSnapgene from "./parsers/snapgene";
import parseSeqBuilder from "./parsers/seqbuilder";

/**
 * filesToParts can convert either string contents of
 * DNA files or a list of File objects into SeqViz parts
 */
export default async (files, options = { fileName: "", colors: COLORS, backbone: "" }) => {
  try {
    const partLists = await new Promise((resolve, reject) => {
      const { fileName = "", colors = [], backbone = "" } = options;

      // if it's just a single file string
      if (typeof files === "string") {
        resolve(fileToParts(files, { fileName, colors, backbone }));
        return;
      }

      // if it's not an iterator over files, throw
      if (!Array.isArray(files)) {
        files = [files];
      }

      // a list of file strings or a FileList
      let partsList = [];
      files.forEach(file => {
        if (file.type === "application/zip") {
          reject(new Error("zip files are not supported by SeqViz"));
        } else if (typeof file === "string") {
          partsList.push(fileToParts(file, options));
        } else {
          partsList.push(
            new Promise(resolve => {
              const reader = new FileReader();
              reader.onload = e => {
                resolve(fileToParts(e.target.result, fileOptions));
              };

              // set fileName in options if available
              // fileName used in naming part and determining which file parser to use
              const fileOptions = file.name ? { ...options, fileName: file.name } : options;

              // SnapGene files are buffers, rest are strings
              if (fileOptions.fileName.endsWith(".dna")) {
                reader.readAsArrayBuffer(file);
              } else {
                reader.readAsText(file);
              }
            })
          );
        }
      });

      resolve(Promise.all(partsList));
    });

    return partLists.reduce((acc, partList) => acc.concat(partList), []);
  } catch (err) {
    throw err;
  }
};

/**
 * Takes in a file, in string format, figures out which type of file it is,
 * converts the file into a part, and returns the part
 *
 * @param {String} file  the string representation of the passed file
 */
const fileToParts = async (file, options = { fileName: "", colors: [], backbone: "" }) => {
  const { fileName = "", colors = [], backbone = "" } = options;

  if (!file) {
    throw Error("cannot parse null or empty string");
  }

  // this is a check for an edge case, where the user uploads come kind
  // of file that's full of bps but doesn't fit into a defined type
  const firstLine = file.search ? file.substring(0, file.search("\n")) : "";
  const dnaCharLength = firstLine.replace(/[^atcgATCG]/, "").length;
  const dnaOnlyFile = dnaCharLength / firstLine.length > 0.8; // is it >80% dna?
  const sourceName = fileName.split(path.sep).pop();
  const name = fileName && sourceName ? sourceName.substring(0, sourceName.search("\\.")) : "Untitled";
  const source = { name: sourceName, file: file };

  // another edge case check for whether the part is a JSON part from Benchling
  // just a heuristic that says 1) yes it can be parsed 2) it conaints a list of
  // fields that are common to Benchling files
  let isBenchling = false;
  try {
    const benchlingJSON = JSON.parse(file); // will err out if not JSON
    const benchlingJSONKeys = Object.keys(benchlingJSON);
    if (["bases", "annotations", "primers"].every(k => benchlingJSONKeys.includes(k))) {
      isBenchling = true;
    }
  } catch (_) {}

  let parts;

  try {
    switch (true) {
      // SnapGene; first because it's a buffer, not string
      // it will fail for some string methods below
      case fileName.endsWith(".dna"):
        parts = await parseSnapgene(file, { fileName, colors });
        break;

      // FASTA
      case file.startsWith(">"):
      case file.startsWith(";"):
      case fileName.endsWith(".seq"):
      case fileName.endsWith(".fa"):
      case fileName.endsWith(".fas"):
      case fileName.endsWith(".fasta"):
        parts = await parseFASTA(file, fileName).then(parsedFasta => {
          const ret = parsedFasta.map(p => ({
            ...partFactory(),
            ...dnaComplement(p.seq),
            ...p
          }));
          return ret;
        });
        break;

      // Genbank
      case file.includes("LOCUS") && file.includes("ORIGIN"):
      case fileName.endsWith(".gb"):
      case fileName.endsWith(".gbk"):
      case fileName.endsWith(".genbank"):
      case fileName.endsWith(".ape"):
        parts = await parseGenbank(file, fileName, colors);
        break;

      // SeqBuilder
      case file.includes("Written by SeqBuilder"):
      case fileName.endsWith(".sbd"):
        parts = await parseSeqBuilder(file, fileName, colors);
        break;

      // BioBrick XML
      case file.includes("Parts from the iGEM"):
      case file.includes("<part_list>"):
        parts = await parseBioBrick(file, { colors, backbone });
        break;

      // Benchling JSON
      case isBenchling:
        parts = await parseBenchling(file);
        break;

      // SBOL
      case file.includes("RDF"):
        parts = await parseSBOL(file, fileName, colors);
        break;

      // jbei
      case file.includes(':seq="http://jbei.org/sequence"'):
      case file.startsWith("<seq:seq"):
        parts = await parseJBEI(file, colors);
        break;

      // a DNA text file without an official formatting
      case dnaOnlyFile:
        parts = [{ ...partFactory(), ...dnaComplement(file), name }];
        break;

      default:
        throw Error(`${fileName} File type not recognized: ${file}`);
    }
  } catch (e) {
    console.error(e);
    return null;
  }

  // add the source information to all parts
  if (parts) {
    return parts.map(p => ({
      ...p,
      source,
      annotations: p.annotations.map(a => ({ ...a, name: a.name || "Untitled" }))
    }));
  }
  throw Error("unparsable file");
};
