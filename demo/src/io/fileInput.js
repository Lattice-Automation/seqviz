const fasta = require("./parsers/fasta");
const fs = require("fs");
const path = require("path");

// https://react.semantic-ui.com/modules/search/#types-category
const extractMeta = parts => {
  const partsMeta = parts.map(part => {
    const { 0: id, ...rest } = part.name.split(" ");
    const { 0: linear, 1: year, 2: type } = rest[1].split("-");
    return { id, linear, year, type };
  });

  const distinctTypes = partsMeta
    .map(({ type }) => type)
    .filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

  const partsOfType = type => {
    return partsMeta.reduce((ofType, part) => {
      if (part.type === type) {
        ofType.push({
          title: part.id,
          description: `(${part.year}) ${part.linear}`
        });
      }
      return ofType;
    }, []);
  };

  return distinctTypes.map(type => {
    return { name: type, results: partsOfType(type) };
  });
};

const parseFASTA = async file => {
  if (!file) throw Error("Cannot parse null or empty string");
  const parts = await fasta.parseFASTA(file);
  return extractMeta(parts);
};

/**
 * Reads the file, passes the string to be proccessed
 * then rewrites the file with bash executed
 */
const curateBBInfo = async input => {
  try {
    const file = fs.readFileSync(input, "utf-8");
    const BBInfo = await parseFASTA(file);
    fs.writeFile(
      path.join(__dirname, "biobricks", "biobricks.json"),
      JSON.stringify(BBInfo),
      "utf8",
      err => {
        if (err) throw err;
        console.log(`${input} file has been saved!`);
      }
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`${input} file does not exist`);
    } else {
      throw error;
    }
  }
};

// grab the file name input from node
const input = process.argv.slice(2)[0];
if (!input) {
  throw new Error("No file input found.");
}
try {
  curateBBInfo(input);
} catch (error) {
  console.error(error);
  process.exit(1);
}
