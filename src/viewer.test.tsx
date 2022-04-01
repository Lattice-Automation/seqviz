import { mount } from "enzyme";
import * as fs from "fs";
import * as path from "path";
import * as React from "react";
import filesToParts from "./io/filesToParts";
import Linear from "./SeqViz/Linear/Linear";
import SeqBlock from "./SeqViz/Linear/SeqBlock/SeqBlock";
import SeqViewer from "./SeqViz/SeqViewer";
import { SeqViz } from "./viewer";

const defaultProps = {
  name: "test_part",
  seq: "ATGGTAGTTAGATAGGGATACCGAT",
  annotations: [
    {
      name: "ann_1",
      start: 0,
      end: 10,
    },
  ],
  style: { height: 200, width: 400 },
  size: { height: 200, width: 400 },
};

describe("SeqViz rendering (React)", () => {
  it("renders with manual part meta", () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ name: string; seq: string; annotations: { ... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} />);

    // renders both a circular and linear viewer by default
    expect(wrapper.find(SeqViewer)).toHaveLength(2);
    expect(wrapper.find(".la-vz-linear-scroller")).toHaveLength(1);
    expect(wrapper.find(".la-vz-circular-viewer")).toHaveLength(1);
    const firstViewer = wrapper.find(SeqViewer).first();
    expect(firstViewer.find(".la-vz-linear-scroller").length).toBeFalsy();
    expect(firstViewer.find(".la-vz-circular-viewer").length).toBeTruthy();
    // renders bp for the sequence (only works for smaller seqs
    // where the infinite scroll doesn't truncate)
    expect(wrapper.find("text").length).toBeGreaterThanOrEqual(defaultProps.seq.length * 2);
  });

  it("renders with linear viewer only", async () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ viewer: "linear"; name: string; seq: strin... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} viewer="linear" />);

    expect(wrapper.find(SeqViewer)).toHaveLength(1);
    expect(wrapper.find(".la-vz-linear-scroller")).toHaveLength(1);
    expect(wrapper.find(".la-vz-circular-viewer")).toHaveLength(0);
  });

  it("renders with circular viewer only", () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ viewer: "circular"; name: string; seq: str... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} viewer="circular" />);

    expect(wrapper.find(SeqViewer)).toHaveLength(1);
    expect(wrapper.find(".la-vz-linear-scroller")).toHaveLength(0);
    expect(wrapper.find(".la-vz-circular-viewer")).toHaveLength(1);
  });

  it("renders with both viewers flipped", () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ viewer: "both_flip"; name: string; seq: st... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} viewer="both_flip" />);

    expect(wrapper.find(SeqViewer)).toHaveLength(2);
    expect(wrapper.find(".la-vz-linear-scroller")).toHaveLength(1);
    expect(wrapper.find(".la-vz-circular-viewer")).toHaveLength(1);
    const firstViewer = wrapper.find(SeqViewer).first();
    expect(firstViewer.find(".la-vz-linear-scroller").length).toBeTruthy();
    expect(firstViewer.find(".la-vz-circular-viewer").length).toBeFalsy();
  });

  it("renders with Genbank file string input", async () => {
    const file = path.join(__dirname, "io", "examples", "genbank", "pBbE0c-RFP_1.gb");
    const fileContents = fs.readFileSync(file, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: "pBbE0c-RFP_1.gb",
    }); // expected part
    const part = parts[0];

    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ file: string; name: string; seq: string; a... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} file={fileContents} />);
    const componentDidMount = wrapper.instance().componentDidMount;
    if (componentDidMount) {
      await componentDidMount();
    } else {
      throw new Error("componentDidMount not defined");
    }

    // check that the part state matches the state of the Genbank file
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'part' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    expect(wrapper.state().part.seq).toEqual(part.seq);
  });

  it("renders with Genbank File/Blob input", async () => {
    const fileName = path.join(__dirname, "io", "examples", "genbank", "pBbE0c-RFP_1.gb");
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName,
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ file: File; name: string; seq: string; ann... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    const componentDidMount = wrapper.instance().componentDidMount;
    if (componentDidMount) {
      await componentDidMount();
    } else {
      throw new Error("componentDidMount not defined");
    }

    // check that the part state matches the state of the Genbank file
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'part' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq,
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with FASTA File/Blob input", async () => {
    const fileName = path.join(__dirname, "io", "examples", "fasta", "R0010_AB.gb");
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName,
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ file: File; name: string; seq: string; ann... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    const componentDidMount = wrapper.instance().componentDidMount;
    if (componentDidMount) {
      await componentDidMount();
    } else {
      throw new Error("componentDidMount not defined");
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'part' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq,
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with SBOL File/Blob input", async () => {
    const fileName = path.join(__dirname, "io", "examples", "sbol", "v2", "A1.xml");
    const fileContents = fs.readFileSync(fileName, "utf8");
    const parts = await filesToParts([fileContents], {
      fileName: fileName,
    });
    const part = parts[0];
    const file = new File([fileContents], fileName, { type: "text/plain" });

    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ file: File; name: string; seq: string; ann... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    const componentDidMount = wrapper.instance().componentDidMount;
    if (componentDidMount) {
      await componentDidMount();
    } else {
      throw new Error("componentDidMount not defined");
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'part' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq,
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with SnapGene File/Blob input", async () => {
    const fileName = path.join(__dirname, "io", "examples", "snapgene", "pBbB8c-GFP.dna");
    const fileContents = fs.readFileSync(fileName);
    const file = new File([fileContents], fileName);
    const parts = await filesToParts([file], { fileName });
    const part = parts[0];

    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ file: File; name: string; seq: string; ann... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} file={file} />);
    const componentDidMount = wrapper.instance().componentDidMount;
    if (componentDidMount) {
      await componentDidMount();
    } else {
      throw new Error("componentDidMount not defined");
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'part' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    expect(wrapper.state().part).toMatchObject({
      seq: part.seq,
      compSeq: part.compSeq,
    });
    expect(part.name).toMatch(/.{2,}/);
    expect(part.seq).toMatch(/.{2,}/);
  });

  it("renders with an Amino Acid sequence", async () => {
    const seq =
      "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTFSYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK*";

    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ seq: string; viewer: "linear"; name: strin... Remove this comment to see the full error message
    const wrapper = mount(<SeqViz {...defaultProps} seq={seq} viewer="linear" />);
    const componentDidMount = wrapper.instance().componentDidMount;
    if (componentDidMount) {
      await componentDidMount();
    } else {
      throw new Error("componentDidMount not defined");
    }

    expect(wrapper.find(SeqViewer)).toHaveLength(1);
    expect(wrapper.find(Linear)).toHaveLength(1);
    expect(wrapper.find(SeqBlock).length).toBeGreaterThan(3);
    expect(wrapper.find(SeqBlock).first().text()).toContain(seq.substring(0, 30));
  });
});
