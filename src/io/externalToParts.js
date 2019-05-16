import axios from "axios";
import path from "path";
import fileToParts from "./filesToParts";

/**
 * retrieve a string representation of a part from a remote server and convert it into a part
 */
export default async (accession, colors = []) => {
  // right now, we support either NCBI or iGEM. We parse this automatically. the user
  // doesn't specify the target registry, so we have to infer it from the passed accession
  let url = `https://cors-anywhere.herokuapp.com/https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=nuccore&id=${accession.trim()}&rettype=gbwithparts&retmode=text`;
  if (accession.includes("BB")) {
    // it's a BioBrick... target the iGEM repo
    url = `https://cors-anywhere.herokuapp.com/http://parts.igem.org/xml/part.${accession.trim()}`;
  }
  try {
    const axiosOptions = {};
    if (process.env.NODE_ENV === "test") {
      // this is a hack needed to avoid a cross origin complain when testing
      // the file: https://stackoverflow.com/a/42678578/7541747
      axiosOptions.adapter = require(`${path.join(
        path.dirname(require.resolve("axios")),
        "lib/adapters/http"
      )}`);
      axiosOptions.headers = {
        Authorization: "Basic YWRtaW46bHVveGlueGlhbjkx"
      };
    }

    // make the call
    const response = await axios.get(url, axiosOptions);

    // convert to a part
    const parts = await fileToParts(response.data, { colors });
    if (parts && parts.length) return parts[0];
    throw Error("No convertible part found");
  } catch (err) {
    console.log(err);
    return err;
  }
};
