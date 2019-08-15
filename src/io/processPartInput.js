import { partFactory, dnaComplement, partStub } from "../Utils/parser";
import {
  annotationFactory,
  validSequenceCharacters,
  trimNewLines
} from "../Utils/sequence";
import filesToParts from "../io/filesToParts";
import externalToParts from "../io/externalToParts";

/**
 * Determine what the input was to see if we need a parser or factory.
 * The output should always be a part consumable by seqviz
 * Currently this means it needs a sequence, a complement sequence,
 * and an array of annotations. Check partFactory for latest
 * part object structure
 */
const processPartInput = async (newPart, partInput, options) => {
  const { colors = [], backbone = "" } = options;
  // We might be getting a FileList input from JS file input
  if (partInput.constructor.name === "FileList") {
    if (backbone.length) {
      console.warn(
        "You've specified a backbone, were you trying to display a BioBrick part? If so, please specify the BioBrick accession number as your part input."
      );
    }
    if (partInput.length < 1) {
      console.error(
        "Instantiation Error: There are no valid files in your part input"
      );
      return null;
    } else {
      if (partInput.length > 1) {
        console.warn(
          "seqviz can only display one part at a time. The first valid file in your file list will be displayed."
        );
      }
      return partFromFiles(partInput, colors);
    }
  }
  // We might be getting a single File
  else if (partInput.constructor.name === "File") {
    if (backbone.length) {
      console.warn(
        "You've specified a backbone, were you trying to display a BioBrick part? If so, please specify the BioBrick accession number as your part input."
      );
    }
    return partFromFile(partInput, colors);
  }
  // We might have been passed a valid part already
  else if (partInput.constructor.name === "Object") {
    if (backbone.length) {
      console.warn(
        "You've specified a backbone, were you trying to display a BioBrick part? If so, please specify the BioBrick accession number as your part input."
      );
    }
    const {
      seq: sequence = "",
      compSeq: complement = "",
      annotations = []
    } = partInput;
    if (typeof sequence !== "string" || sequence === "") {
      console.error(
        "Instantiation Error: Your part object input needs to have a string `seq` field"
      );
      return null;
    } else {
      const part = { ...partFactory(), ...partInput };
      part.seq = sequence;
      if (typeof complement !== "string" || complement === "") {
        part.compSeq = dnaComplement(sequence).compSeq;
      }
      part.annotations = validateAnnotations(part.name, annotations, colors);
      return part;
    }
  }
  // We might get a string
  else if (partInput.constructor.name === "String") {
    if (partInput.length < 1) {
      console.error("Instantiation Error: No valid part found.");
      return partStub(colors);
    }
    // If the string contains numbers it could be an NCBI or BioBrick accession number
    if (/\d/.test(partInput)) {
      try {
        return externalToParts(newPart, partInput, { colors, backbone });
      } catch (err) {
        console.warn(
          "Were you trying to display a BioBrick or NCBI part? We were not able to fetch the part: ",
          err
        );
        return null;
      }
    }
    // Otherwise check if it's just a sequence string
    else {
      if (backbone.length) {
        console.warn(
          "You've specified a backbone, were you trying to display a BioBrick part? If so, please specify the BioBrick accession number as your part input."
        );
      }
      const invalidSequence = new RegExp(
        `[^${Object.keys(validSequenceCharacters).join("")}()|]`,
        "gi"
      );
      if (!invalidSequence.test(trimNewLines(partInput))) {
        return {
          ...partFactory(),
          seq: partInput,
          compSeq: dnaComplement(partInput).compSeq,
          name: "Untitled"
        };
      } else {
        console.error(
          "Instantiation Error: Your sequence string has invalid characters. Only nucleotides and nucleotide wildcards are allowed."
        );
      }
    }
  } else {
    console.error("Instantiation Error: No valid part found.");
    return partStub(colors);
  }
};

const partFromFiles = async (files, colors = []) => {
  let parts;
  try {
    const parsedFiles = await filesToParts(Array.from(files), {
      colors: colors
    });
    const unrecognizedFiles = parsedFiles.reduce((acc, p) => {
      if (
        p.failedToParse &&
        p.error &&
        p.error.name === "ImportErrorTooLarge"
      ) {
        console.error(p.error.message);
      } else if (p.failedToParse) {
        return acc.concat(p.failedToParse);
      }
      return acc;
    }, []);
    if (unrecognizedFiles.length) {
      console.warn(`Unrecognized files ${unrecognizedFiles.join(", ")}`);
    }
    parts = parsedFiles.filter(p => !p.failedToParse);
  } catch (err) {
    console.error("Unable to parse files", { error: err });
  }
  if (parts.length) {
    return parts[0];
  }
  console.error("Instantiation Error: No file could be parsed into a part");
  return null;
};

const partFromFile = async (file, colors = []) => {
  let part = null;
  try {
    const parsedFile = await filesToParts(file, {
      fileName: file.name,
      colors: colors
    });
    if (parsedFile.failedToParse) {
      console.error("Instantiation Error: No file could be parsed into a part");
    } else {
      part = parsedFile;
    }
  } catch (err) {
    console.error("Unable to parse files", { error: err });
  }
  return part;
};

/**
 * Determine if there are annotations, and format them
 * correctly if there are
 */
const validateAnnotations = (fileName, annotations, colors = []) => {
  if (!Array.isArray(annotations) || annotations === []) {
    return [];
  } else {
    return annotations.map(annotation => ({
      ...annotationFactory(fileName, annotation.name, colors),
      ...annotation
    }));
  }
};

export default processPartInput;
