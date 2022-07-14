export default async (text, fileName) => {
  // partFactory returns a negative "circular" prop, we assume they're all linear

  if (text.trim().startsWith(">")) {
    return text
      .split(">") // split up if it's a multi-seq FASTA file
      .map(t => {
        // this starts at the end of the first line, grabs all other characters,
        // and removes any newlines (leaving only the original sequence)
        // sequence "cleaning" happens in complement (we don't support bps other than
        // the most common right now)
        const seq = t.substr(t.indexOf("\n"), t.length).replace(/\s/g, "");

        // the first line contains the name, though there's lots of variability around
        // the information on this line...
        // >MCHU - Calmodulin - Human, rabbit, bovine, rat, and chicken
        const name = t.substring(0, t.search(/\n|\|/)).replace(/\//g, "");

        return {
          name,
          seq,
        };
      })
      .filter(p => p.name && p.seq);
  }
  if (text.trim().startsWith(";")) {
    // it's an old-school style FASTA that's punctuated with semi-colons
    // ;my|NAME
    // ;my comment
    // actGacgata
    const name = text.substring(0, text.search(/\n|\|/)).replace(/\//g, "");
    const newlineBeforeSeq = text.indexOf("\n", text.lastIndexOf(";"));
    const seq = text.substring(newlineBeforeSeq, text.length);
    return [
      {
        name,
        seq,
      },
    ];
  }
  // assume that it's a no name FASTA. Ie it's just a file with dna and no header
  // try and get the name from the fileName
  const lastChar = fileName.lastIndexOf(".") || fileName.length;
  const name = fileName.substring(0, lastChar) || "Untitled";
  const seq = text;
  return [
    {
      name,
      seq,
    },
  ];
};
