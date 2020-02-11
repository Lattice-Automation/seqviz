import fs from "fs";
import path from "path";

import { mount } from "enzyme";
import * as React from "react";

import filesToParts from "./io/filesToParts";
import { SeqViz } from "./viewer";
import SeqViewer from "./SeqViz/SeqViewer";

const defaultProps = {
  name: "test_part",
  seq: "ATGGTAGTTAGATAGGGATACCGAT",
  annotations: [
    {
      name: "ann_1",
      start: 0,
      end: 10
    }
  ],
  style: { height: 200, width: 400 },
  size: { height: 200, width: 400 }
};

describe("SeqViz rendering (React)", () => {
  it("renders with manual part meta", () => {
    const wrapper = mount(<SeqViz {...defaultProps} />);

    // renders both a circular and linear viewer by default
    expect(wrapper.find(SeqViewer)).toHaveLength(2);
    // renders bp for the sequence (only works for smaller seqs
    // where the infinite scroll doesn't truncate)
    expect(wrapper.find("text").length).toBeGreaterThanOrEqual(
      defaultProps.seq.length * 2
    );
  });

  it("renders with Genbank file string input", async () => {
    const file = path.join(
      __dirname,
      "io",
      "examples",
      "genbank",
      "pBbE0c-RFP_1.gb"
    );
    const fileContents = fs.readFileSync(file, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: "pBbE0c-RFP_1.gb"
    }); // expected part
    const part = parts[0];

    const wrapper = mount(<SeqViz {...defaultProps} file={fileContents} />);
    await wrapper.instance().componentDidMount();

    // check that the part state matches the state of the Genbank file
    expect(wrapper.state().part.seq).toEqual(part.seq);
  });

  it("renders with Genbank File/Blob input", async () => {
    const fileName = path.join(
      __dirname,
      "io",
      "examples",
      "genbank",
      "pBbE0c-RFP_1.gb"
    );
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    await wrapper.instance().componentDidMount();

    // check that the part state matches the state of the Genbank file
    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with FASTA File/Blob input", async () => {
    const fileName = path.join(
      __dirname,
      "io",
      "examples",
      "fasta",
      "R0010_AB.gb"
    );
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    await wrapper.instance().componentDidMount();

    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with SBOL File/Blob input", async () => {
    const fileName = path.join(
      __dirname,
      "io",
      "examples",
      "sbol",
      "v2",
      "A1.xml"
    );
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    await wrapper.instance().componentDidMount();

    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with SnapGene File/Blob input", async () => {
    const fileName = path.join(
      __dirname,
      "io",
      "examples",
      "snapgene",
      "pBbB8c-GFP.dna"
    );
    const fileContents = fs.readFileSync(fileName);
    const file = new File([fileContents], fileName);
    const parts = await filesToParts([file], { fileName });
    const part = parts[0];

    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    await wrapper.instance().componentDidMount();

    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });
});
