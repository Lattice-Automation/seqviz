import * as path from "path";

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
import { Part } from "../part";

export interface FileOptions {
  fileName?: string;
  colors?: string[];
  backbone?: string | { name: string; backbone: string };
}

/**
 * filesToParts can convert either string contents of
 * DNA files or a list of File objects into SeqViz parts
 */
export default async (
  files: string | string[] | File | File[],
  options: FileOptions = { fileName: "", colors: COLORS, backbone: "" }
): Promise<Part[]> => {
  const partLists: Promise<Part[]>[] = [];
  const { fileName = "", colors = [], backbone = "" } = options;

  // if it's just a single file string
  if (typeof files === "string") {
    partLists.push(fileToParts(files, { fileName, colors, backbone }));
  } else {
    if (!Array.isArray(files)) {
      files = [files];
    }

    // a list of file strings or a FileList
    files.forEach((file: string | File) => {
      if (typeof file === "string") {
        partLists.push(fileToParts(file, options));
      } else if (file.type === "application/zip") {
        throw new Error("zip files are not supported by SeqViz");
      } else {
        partLists.push(
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => {
              if (e.target && e.target.result) {
                resolve(fileToParts(e.target.result, fileOptions));
              } else {
                reject("Failed to load results from FileReader");
              }
            };

            // set fileName in options if available
            // fileName used in naming part and determining which file parser to use
            const fileOptions = file.name ? { ...options, fileName: file.name } : options;

            // SnapGene files are buffers, rest are strings
            if (fileOptions.fileName != null && fileOptions.fileName.endsWith(".dna")) {
              reader.readAsArrayBuffer(file);
            } else {
              reader.readAsText(file);
            }
          })
        );
      }
    });
  }

  return (await Promise.all(partLists)).reduce((acc, partList) => acc.concat(partList), []);
};

/**
 * Takes in a file, in string format, figures out which type of file it is,
 * converts the file into a part, and returns the part
 */
const fileToParts = async (
  file: string | ArrayBuffer,
  options: FileOptions = { fileName: "", colors: [], backbone: "" }
): Promise<Part[]> => {
  const { fileName = "", colors = [], backbone = "" } = options;
  const sourceName = fileName.split(path.sep).pop() || fileName;
  const source = { name: sourceName, file: file instanceof ArrayBuffer ? "" : file };

  if (!file) {
    throw Error("cannot parse null or empty string");
  }

  let fileString: string;
  if (file instanceof ArrayBuffer) {
    if (fileName.endsWith(".dna")) {
      // SnapGene; first because it's a buffer, not string
      // it will fail for some string methods below
      return (await parseSnapgene(file, { fileName, colors })).map(p => cleanupPart(p, source));
    } else {
      throw Error("Unrecognized file type, ArrayBuffer but not a Snapgene file (.dna)");
    }
  } else {
    fileString = file;
  }

  // this is a check for an edge case, where the user uploads come kind
  // of file that's full of bps but doesn't fit into a defined type
  const firstLine = fileString.substring(0, fileString.search("\n"));
  const dnaCharLength = firstLine.replace(/[^atcgATCG]/, "").length;
  const dnaOnlyFile = dnaCharLength / firstLine.length > 0.8; // is it >80% dna?
  const name = fileName && sourceName ? sourceName.substring(0, sourceName.search("\\.")) : "Untitled";

  let parts: Part[];

  // another edge case check for whether the part is a JSON part from Benchling
  // just a heuristic that says 1) yes it can be parsed 2) it conaints a list of
  // fields that are common to Benchling files
  let isBenchling = false;
  try {
    const benchlingJSON = JSON.parse(fileString); // will err out if not JSON
    const benchlingJSONKeys = Object.keys(benchlingJSON);
    if (["bases", "annotations", "primers"].every(k => benchlingJSONKeys.includes(k))) {
      isBenchling = true;
    }
  } catch (_) {
    // @ts-ignore
  }

  try {
    switch (true) {
      // FASTA
      case fileString.startsWith(">"):
      case fileString.startsWith(";"):
      case fileName.endsWith(".seq"):
      case fileName.endsWith(".fa"):
      case fileName.endsWith(".fas"):
      case fileName.endsWith(".fasta"):
        parts = await parseFASTA(fileString, fileName).then(parsedFasta => {
          const ret = parsedFasta.map(p => ({
            ...partFactory(),
            ...dnaComplement(p.seq),
            ...p
          }));
          return ret;
        });
        break;

      // Genbank
      case fileString.includes("LOCUS") && fileString.includes("ORIGIN"):
      case fileName.endsWith(".gb"):
      case fileName.endsWith(".gbk"):
      case fileName.endsWith(".genbank"):
      case fileName.endsWith(".ape"):
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string[]' is not assignable to p... Remove this comment to see the full error message
        parts = await parseGenbank(fileString, fileName, colors);
        break;

      // SeqBuilder
      case fileString.includes("Written by SeqBuilder"):
      case fileName.endsWith(".sbd"):
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string[]' is not assignable to p... Remove this comment to see the full error message
        parts = await parseSeqBuilder(fileString, fileName, colors);
        break;

      // BioBrick XML
      case fileString.includes("Parts from the iGEM"):
      case fileString.includes("<part_list>"):
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'unknown' is not assignable to type 'Part[]'.
        parts = await parseBioBrick(fileString, { colors, backbone });
        break;

      // Benchling JSON
      case isBenchling:
        parts = await parseBenchling(fileString);
        break;

      // SBOL
      case fileString.includes("RDF"):
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'unknown' is not assignable to type 'Part[]'.
        parts = await parseSBOL(fileString, fileName, colors);
        break;

      // jbei
      case fileString.includes(':seq="http://jbei.org/sequence"'):
      case fileString.startsWith("<seq:seq"):
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'unknown' is not assignable to type 'Part[]'.
        parts = await parseJBEI(fileString, colors);
        break;

      // a DNA text fileString without an official formatting
      case dnaOnlyFile:
        parts = [{ ...partFactory(), ...dnaComplement(fileString), name }];
        break;

      default:
        throw Error(`${fileName} File type not recognized: ${fileString}`);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }

  // add the source information to all parts
  if (parts) {
    return parts.map(p => cleanupPart(p, source));
  }
  throw Error("unparsable file");
};

/**
 * Add source to the part and add a default annotation names.
 */
const cleanupPart = (p, source: { name: string; file: string }): Part => ({
  ...p,
  source,
  annotations: p.annotations.map(a => ({ ...a, name: a.name || "Untitled" }))
});
