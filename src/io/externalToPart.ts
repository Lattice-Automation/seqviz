import { Part } from "../elements";
import fileToParts from "./filesToParts";
import { fetchBBB } from "./igemBackbones";

/**
 * retrieve a string representation of a part from a remote server and convert it into a part
 */
export default async (
  accession: string,
  options: { backbone?: string; colors?: string[] } = { backbone: "", colors: [] }
): Promise<Part> => {
  let igem = false;

  // get from cache
  const key = accession + options.backbone || "";
  const localStoragePart = localStorage.getItem(key);
  if (accession && key && localStoragePart) {
    return JSON.parse(localStoragePart);
  }

  const { colors = [], backbone = "" } = options;
  // right now, we support either NCBI or iGEM. We parse this automatically. the user
  // doesn't specify the target registry, so we have to infer it from the passed accession
  let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession.trim()}&rettype=gbwithparts&retmode=text`;
  if (accession.startsWith("BB")) {
    // it's a BioBrick... target the iGEM repo
    igem = true;
    url = `http://parts.igem.org/cgi/xml/part.cgi?part=${accession.trim()}`;
  } else if (backbone.length) {
    console.error("backbone specified without a BioBrick");
  }

  // request the XML from the webserver
  let body = "";
  try {
    const response = await fetch(url);
    body = await response.text();
  } catch (err) {
    throw new Error(`Failed to retrieve seq via accession '${accession}' from '${url}'`);
  }

  if (!body) {
    throw new Error(`Failed to retrieve seq via accession '${accession}' from '${url}'`);
  }

  // convert to a part
  const igemBackbone = igem && backbone.length ? { backbone: fetchBBB(backbone), name: backbone } : "";
  if (igem && igemBackbone === "") {
    console.error("iGEM BioBrick ID used, but no backbone ID specified.");
  }

  const parts = await fileToParts(body, {
    backbone: igemBackbone,
    colors: colors,
  });

  if (parts && parts.length) {
    const part = parts[0];
    if (key && part && part.seq) {
      localStorage.setItem(key, JSON.stringify(part));
      return part;
    }
  }

  throw new Error(`Failed to retrieve a seq with accession ${accession} from ${url}`);
};
