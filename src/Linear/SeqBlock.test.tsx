import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";

import * as React from "react";

import { SeqBlock } from "./SeqBlock";

const defaultProps = {
  blockHeight: 40,
  bpsPerBlock: 100,
  charWidth: 12,
  cutSiteRows: [],
  elementHeight: 16,
  firstBase: 0,
  forwardPrimerRows: [],
  highlightedRegions: [],
  highlights: [],
  id: "",
  inputRef: () => {
    // do nothing
  },
  key: "",
  lineHeight: 14,
  mouseEvent: () => {},
  name: "",
  onUnmount: () => {},
  reversePrimerRows: [],
  searchRows: [],
  selection: {},
  seqFontSize: 12,
  showComplement: true,
  showIndex: true,
  size: { height: 600, width: 1200 },
  translationRows: [],
  y: 0,
  zoom: { linear: 50 },
  zoomed: true,
};

/**
 * a test for a scenario where there's annotations on a single SeqBlock
 * that spans the whole viewer
 *
 * at the time of writing this test, the annotation and index are
 * longer than the sequence (whose width is determined by charWidth)
 */
describe("SeqBlock", () => {
  it("renders with a single block", async () => {
    const seq = "gcgaaaaatcaataaggaggcaacaagatgtgcgaaaaacatcttaatcatgcggtggagggtttctaatg";
    render(
      // @ts-ignore
      <SeqBlock
        {...defaultProps}
        annotationRows={[
          [
            {
              color: "#80D849",
              direction: 1,
              end: 71,
              id: "test-annotation",
              name: "RBS",
              start: 0,
            },
          ],
        ]}
        compSeq="cgctttttagttattcctccgttgttctacacgctttttgtagaattagtacgccacctcccaaagattac"
        fullSeq={seq}
        seq={seq}
      />
    );

    // Verify it was rendered with the test seq
    const seqBlock = screen.getByTestId("la-vz-seq");
    expect(seqBlock).toBeTruthy();
    expect(seqBlock.textContent).toEqual(seq);

    cleanup();
  });
});
