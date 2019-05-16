import sbolV1 from "./sbol.v1";
import sbolV2 from "./sbol.v2";

/**
 * takes in an SBOL file in v1 or v2 format, and parses to an array of parts
 * that match the Loom data model
 */
export default async (sbol, fileName, colors = []) =>
  sbol.includes("sbols.org/v1#")
    ? sbolV1(sbol, colors)
    : sbolV2(sbol, fileName, colors);
