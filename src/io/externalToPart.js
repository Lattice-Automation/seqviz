import fetch, { Request } from "node-fetch";

import fileToParts from "./filesToParts";
import { fetchBBB } from "./igemBackbones";

/**
 * retrieve a string representation of a part from a remote server and convert it into a part
 */
export default async (accession, options = { backbone: "", colors: [] }) => {
  let igem = false;

  // get from cache
  const key = accession + options.backbone || "";
  if (accession && key && localStorage.getItem(key)) {
    return JSON.parse(localStorage.getItem(key));
  }

  const { colors = [], backbone = "" } = options;
  // right now, we support either NCBI or iGEM. We parse this automatically. the user
  // doesn't specify the target registry, so we have to infer it from the passed accession
  let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession.trim()}&rettype=gbwithparts&retmode=text`;
  if (accession.startsWith("BB")) {
    // it's a BioBrick... target the iGEM repo
    igem = true;
    url = `https://cors-anywhere.herokuapp.com/http://parts.igem.org/xml/part.${accession.trim()}`;
  } else if (backbone.length) {
    throw new Error(
      "You've specified a backbone. Were you trying to display a BioBrick part? If so, please specify the BioBrick through the 'accession' prop."
    );
  }

  const response = await fetch(
    new Request(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
  )
    .then(response => response.text())
    .catch(console.error);

  if (!response) {
    throw new Error(
      `Failed to retrieve a seq with accession ${accession} from ${url}`
    );
  }

  // convert to a part
  const igemBackbone =
    igem && backbone.length
      ? { name: backbone, backbone: fetchBBB(backbone) }
      : "";

  if (igem && igemBackbone === "") {
    throw new Error(
      `Failed to find an iGEM backbone with ID ${backbone}. Please contact us if you think this is a mistake.`
    );
  }

  const parts = await fileToParts(response, {
    colors: colors,
    backbone: igemBackbone
  });

  if (parts && parts.length) {
    const part = parts[0];
    if (key && part && part.seq) {
      localStorage.setItem(key, JSON.stringify(part));
      return part;
    }
  }

  throw new Error(
    `Failed to retrieve a seq with accession ${accession} from ${url}`
  );
};
