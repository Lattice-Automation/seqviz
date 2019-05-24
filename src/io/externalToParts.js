import fileToParts from "./filesToParts";
import { fetchBBB } from "./igemBackbones";

/**
 * retrieve a string representation of a part from a remote server and convert it into a part
 */
export default async (accession, options) => {
  let igembrick = false;
  const { colors = [], backbone = "" } = options;
  // right now, we support either NCBI or iGEM. We parse this automatically. the user
  // doesn't specify the target registry, so we have to infer it from the passed accession
  let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession.trim()}&rettype=gbwithparts&retmode=text`;
  if (accession.includes("BB")) {
    igembrick = true;
    // it's a BioBrick... target the iGEM repo
    url = `https://cors-anywhere.herokuapp.com/http://parts.igem.org/xml/part.${accession.trim()}`;
  } else {
    if (backbone.length) {
      console.warn(
        "You've specified a backbone, were you trying to display a BioBrick part? If so, please specify the BioBrick accession number as your part input."
      );
    }
  }
  try {
    // make the call
    const response = await fetch(url).then(response => response.text());

    // convert to a part
    if (!igembrick && backbone.length) {
      console.warn(
        "The backbone option is currently only valid with BioBrick imports. If you meant to display a BioBrick, please make sure that your part input was a valid BioBrick accession number."
      );
    }
    const igembackbone =
      igembrick && backbone.length
        ? { name: backbone, backbone: fetchBBB(backbone) }
        : "";
    if (igembrick && igembackbone === "") {
      console.warn(
        "It looks like you are trying to display a BioBrick. BioBricks typically need to be inserted into a Plasmid Backbone (https://parts.igem.org/Plasmid_backbones/Assembly). Please specify one in your viewer options."
      );
    }
    const parts = await fileToParts(response, {
      colors: colors,
      backbone: igembackbone
    });
    if (parts && parts.length) return parts[0];
    throw Error("No convertible part found");
  } catch (err) {
    console.log(err);
    return err;
  }
};
