import { dnaComplement, partFactory } from "../Utils/parser";
import JSZip from "jszip";
import path from "path";
import parseBenchling from "./parsers/benchling";
import parseBioBrick from "./parsers/biobrick";
import parseFASTA from "./parsers/fasta";
import parseGenbank from "./parsers/genbank";
import parseJBEI from "./parsers/jbei";
import parseSBOL from "./parsers/sbol";
import parseSnapgene from "./parsers/snapgene";

/**
 * unzips a dropped zip file
 */
const zipHandler = file => {
  const zip = new JSZip();
  const zippedFiles = [];
  return new Promise(resolve => {
    zip.loadAsync(file).then(zipf => {
      let count = 0;
      const entries = [];
      Object.keys(zipf.files).forEach(name => {
        if (name.includes("/.") || zipf.files[name].dir) return;
        entries.push(zipf.files[name]);
      });

      entries.forEach(entry => {
        const zipRec = {};
        zipRec.fileName = entry.name.slice(0, -4);
        entry.async("uint8array").then(u8 => {
          const stringData = new TextDecoder("utf-8").decode(u8);
          zipRec.data = stringData;
          zippedFiles.push(zipRec);
          count += 1;
          if (count === entries.length) {
            resolve(zippedFiles);
          }
        });
      });
    });
  });
};

/**
 * Takes in a file, in string format, figures out which type of file it is,
 * converts the file into a part, and returns the part
 *
 * @param {String} file  the string representation of the passed file
 */
const fileToParts = async (file, options) => {
  const { fileName = "", colors = [], backbone = "" } = options;
  if (!file) throw Error("Cannot parse null or empty string");

  // this is a check for an edge case, where the user uploads come kind
  // of file that's full of bps but doesn't fit into a defined type
  const firstLine = file.substring(0, file.search("\n"));
  const dnaCharLength = firstLine.replace(/[^atcg]/, "").length;
  const dnaOnlyFile = dnaCharLength / firstLine.length > 0.8; // is it >80% dna?
  const name = fileName
    ? fileName.substring(0, fileName.search("\\."))
    : "Untitled";
  const sourceName = fileName.split(path.sep).pop();
  const source = { name: sourceName, file: file };

  // another edge case check for whether the part is a JSON part from Benchling
  // just a heuristic that says 1) yes it can be parsed 2) it conaints a list of
  // fields that are common to Benchling files
  let isBenchling = false;
  try {
    const benchlingJSON = JSON.parse(file); // will err out if not JSON
    const benchlingJSONKeys = Object.keys(benchlingJSON);
    if (
      ["bases", "annotations", "primers"].every(k =>
        benchlingJSONKeys.includes(k)
      )
    ) {
      isBenchling = true;
    }
  } catch (_) {}

  let parts;

  try {
    switch (true) {
      case file.startsWith(">"):
      case file.startsWith(";"):
      case fileName.endsWith(".seq"):
      case fileName.endsWith(".fa"):
      case fileName.endsWith(".fas"):
      case fileName.endsWith(".fasta"):
        // FASTA
        parts = await parseFASTA(file, fileName).then(parsedFasta => {
          const ret = parsedFasta.map(p => ({
            ...partFactory(),
            ...dnaComplement(p.seq),
            ...p
          }));
          return ret;
        });
        break;
      case file.includes("LOCUS") && file.includes("ORIGIN"):
      case fileName.endsWith(".gb"):
        // Genbank
        parts = await parseGenbank(file, fileName, colors);
        break;
      case fileName.endsWith(".dna"):
        // Snapgene
        parts = await parseSnapgene(file, { fileName, colors });
        break;
      case file.includes("Parts from the iGEM"):
      case file.includes("<part_list>"):
        // BioBrick XML
        parts = await parseBioBrick(file, { colors, backbone });
        break;
      case isBenchling:
        parts = await parseBenchling(file);
        break;
      case file.includes("RDF"):
        // SBOL
        parts = await parseSBOL(file, fileName, colors);
        break;
      case file.includes(':seq="http://jbei.org/sequence"'):
      case file.startsWith("<seq:seq"):
        // jbei
        parts = await parseJBEI(file, colors);
        break;
      case dnaOnlyFile:
        // a DNA text file without an official formatting
        parts = [{ ...partFactory(), ...dnaComplement(file), name }];
        break;
      default:
        throw Error(`${fileName} File type not recognized`);
    }
  } catch (e) {
    return [{ failedToParse: fileName }];
  }

  // add the source information to all parts
  if (parts) return parts.map(p => ({ ...p, source }));
  throw Error("Unreachable code");
};

/**
 * filesToParts can convert either string representations of
 * dna files, or a list of HTML5 File objects, into Parts that
 * can then be saved to our DB
 */
export default async (files, options) =>
  new Promise(resolve => {
    const { fileName = "", colors = [], backbone = "" } = options;
    // if it's just a single file string
    if (typeof files === "string")
      resolve(fileToParts(files, { fileName, colors, backbone }));

    // a list of file strings or a FileList has been dropped
    let numToUpload = files.length;
    let partsList = [];
    files.forEach(file => {
      if (file.type === "application/zip") {
        zipHandler(file).then(unzipped => {
          // minus one because of the zip file
          // plus one for every sub part that was inside the zip
          numToUpload += unzipped.length - 1;
          // for every unzipped file
          unzipped.forEach(rec => {
            // convert it to a part
            fileToParts(rec.data, {
              fileName: rec.fileName,
              colors: colors,
              backbone: backbone
            }).then(convertedParts => {
              partsList = partsList.concat(...convertedParts);
              if (partsList.length >= numToUpload) {
                resolve(Promise.all(partsList));
              }
            });
          });
        });
      } else {
        const fr = new FileReader();
        if (!file.name.endsWith(".dna")) {
          fr.onload = e => {
            fileToParts(e.target.result, {
              fileName: file.name,
              colors: colors,
              backbone: backbone
            }).then(parts => {
              numToUpload += parts.length - 1;
              partsList = partsList.concat(...parts);
              if (partsList.length >= numToUpload) {
                resolve(Promise.all(partsList));
              }
            });
          };
          fr.readAsText(file);
        } else {
          fr.onload = e => {
            parseSnapgene(e.target.result, {
              fileName: file.name,
              colors: colors
            }).then(part => {
              partsList = partsList.concat(part);
              if (partsList.length >= numToUpload) {
                resolve(Promise.all(partsList));
              }
            });
          };
          fr.readAsArrayBuffer(file);
        }
      }
    });
  });
