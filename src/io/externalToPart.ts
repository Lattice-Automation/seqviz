import { Part } from "../elements";
import fileToParts from "./filesToParts";
import { fetchBBB } from "./igemBackbones";

/**
 * Get a remote sequence/part from NCBI or the iGEM registry.
 */
export default async (
  accession: string,
  options: { backbone?: string; colors?: string[] } = {
    backbone: "",
    colors: [],
  }
): Promise<Part> => {
  // First try to retrieve the part from local cache.
  const key = accession + options.backbone || "";
  const localStoragePart = localStorage.getItem(key);
  if (accession && key && localStoragePart) {
    return JSON.parse(localStoragePart);
  }

  // The user doesn't specify the target registry, so we have to infer it from the passed accession: iGEM or NCBI
  const { backbone = "" } = options;
  let url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession.trim()}&rettype=gbwithparts&retmode=text`;
  let igem = false;
  if (accession.startsWith("BB")) {
    // it's a BioBrick... target the iGEM repo
    igem = true;
    url = `http://parts.igem.org/cgi/xml/part.cgi?part=${accession.trim()}`;
  } else if (backbone.length) {
    console.error("backbone specified without a BioBrick");
  }

  // Request the XML from the webserver
  let body = "";
  try {
    const response = await fetch(url);
    body = await response.text();
    if (!body.length) {
      throw new Error("empty response body");
    }
  } catch (err) {
    throw new Error(`Error seen requesting ${accession} from ${url}: ${err}`);
  }

  const igemBackbone = igem && backbone.length ? { backbone: fetchBBB(backbone), name: backbone } : "";
  if (igem && igemBackbone === "") {
    console.error("iGEM BioBrick ID used, but no backbone ID specified.");
  }

  // Convert to a part
  const parts = await fileToParts(body, {
    backbone: igemBackbone,
    colors: options.colors || [],
  });

  // Store in cache
  if (parts && parts.length) {
    const part = parts[0];
    if (key && part && part.seq) {
      localStorage.setItem(key, JSON.stringify(part));
      return part;
    }
  }

  throw new Error(`Failed to parse a sequence from the webserver response at '${url}': ${body}`);
};
