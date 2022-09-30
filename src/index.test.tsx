import "@testing-library/jest-dom";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

import * as fs from "fs";
import * as path from "path";
import * as React from "react";

import { SeqViz } from ".";

const props = {
  annotations: [
    {
      end: 10,
      name: "ann_1",
      start: 0,
    },
  ],
  name: "test_part",
  seq: "ATGGTAGTTAGATAGGGATACCGATAGACTTGAGAGATACCGCATCTATTTACGACCAGCGAGCAG",
  testSize: { height: 600, width: 800 },
};

describe("SeqViz rendering (React)", () => {
  it("renders", async () => {
    const { getAllByTestId } = render(<SeqViz {...props} />);
    await waitFor(() => expect(getAllByTestId("la-vz-seqviz-rendered")).toBeTruthy());

    // renders both a circular and linear viewer by default
    expect(getAllByTestId("la-vz-seq-viewer")).toHaveLength(2);

    // renders full sequence
    const seqs = getAllByTestId("la-vz-seq");
    const seq = seqs.map(s => s.textContent).join("");
    expect(seq).toEqual(props.seq);

    cleanup();
  });

  it("renders with linear viewer only", async () => {
    const { getAllByTestId, getByTestId } = render(<SeqViz {...props} viewer="linear" />);
    await waitFor(() => expect(getAllByTestId("la-vz-seqviz-rendered")).toBeTruthy());

    expect(getByTestId("la-vz-viewer-linear")).toBeTruthy();
    expect(getAllByTestId("la-vz-viewer-linear")).toHaveLength(1);

    cleanup();
  });

  it("renders with circular viewer only", async () => {
    const { getAllByTestId, getByTestId } = render(<SeqViz {...props} viewer="circular" />);
    await waitFor(() => expect(getAllByTestId("la-vz-seqviz-rendered")).toBeTruthy());

    expect(getByTestId("la-vz-viewer-circular")).toBeTruthy();
    expect(getAllByTestId("la-vz-viewer-circular")).toHaveLength(1);

    cleanup();
  });

  it("renders with Genbank file string input", async () => {
    const file = path.join(__dirname, "data", "pBbS0c-RFP.gb");
    const fileContents = fs.readFileSync(file, "utf8");

    // TODO: what the hell is it complaining about
    render(<SeqViz {...props} file={fileContents} />);
    await waitFor(() => expect(screen.getAllByTestId("la-vz-seqviz-rendered")).toBeTruthy());

    expect(screen.getAllByTestId("la-vz-seq-viewer")).toHaveLength(2);

    // Verify the file's sequence is rendered.
    // The linear viewer will cut off the end, this is just the prefix
    const seqs = screen.getAllByTestId("la-vz-seq");
    const seq = seqs.map(s => s.textContent).join("");
    expect(seq).toContain(
      "ttgacagctagctcagtcctaggtactgtgctagctactagtgaaagaggagaaatactagatggcttcctccgaagacgttatcaaagagtt"
    );

    cleanup();
  });

  it("renders with an Amino Acid sequence", async () => {
    const aaSeq =
      "MSKGEELFTGVVPILVELDGDVNGHKFSVSGEGEGDATYGKLTLKFICTTGKLPVPWPTLVTTFSYGVQCFSRYPDHMKQHDFFKSAMPEGYVQERTIFFKDDGNYKTRAEVKFEGDTLVNRIELKGIDFKEDGNILGHKLEYNYNSHNVYIMADKQKNGIKVNFKIRHNIEDGSVQLADHYQQNTPIGDGPVLLPDNHYLSTQSALSKDPNEKRDHMVLLEFVTAAGITHGMDELYK*";

    const { getAllByTestId, getByTestId } = render(<SeqViz {...props} seq={aaSeq} viewer="linear" />);
    await waitFor(() => expect(getAllByTestId("la-vz-seqviz-rendered")).toBeTruthy());

    expect(getByTestId("la-vz-viewer-linear")).toBeTruthy();
    expect(getAllByTestId("la-vz-viewer-linear")).toHaveLength(1);

    const seqs = screen.getAllByTestId("la-vz-seq");
    const seq = seqs.map(s => s.textContent).join("");
    expect(seq).toEqual(aaSeq);

    cleanup();
  });
});
