import { shallow } from "enzyme";
import * as React from "react";

import SeqBlock from "./SeqBlock";

const defaultProps = {
  name: "",
  bpsPerBlock: 100,
  lineHeight: 14,
  elementHeight: 16,
  charWidth: 12,
  seqFontSize: 12,
  zoom: { linear: 50 },
  translations: [],
  primers: [],
  id: "",
  y: 0,
  blockHeight: 40,
  searchRows: [],
  cutSiteRows: [],
  annotationRows: [],
  forwardPrimerRows: [],
  reversePrimerRows: [],
  firstBase: 0,
  onUnmount: () => {},
  zoomed: false,
  size: { height: 600, width: 1200 },
  inputRef: () => {},
  mouseEvent: () => {},
};

/**
 * a test for a scenario where there's annotations on a single SeqBlock
 * that spans the whole viewer
 *
 * at the time of writing this test, the annotation and index are
 * longer than the sequence (whose width is determined by charWidth)
 */
describe("SeqBlock", () => {
  it("renders with a single block", () => {
    const seq = "gcgaaaaatcaataaggaggcaacaagatgtgcgaaaaacatcttaatcatgcggtggagggtttctaatg";
    const wrapper = shallow(
      <SeqBlock
        {...defaultProps}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        name="BCDRBS_alt1_BD14"
        seq={seq}
        compSeq="cgctttttagttattcctccgttgttctacacgctttttgtagaattagtacgccacctcccaaagattac"
        fullSeq={seq}
        annotations={[
          {
            start: 0,
            end: 71,
            direction: 1,
            name: "RBS",
            type: "RBS",
            color: "#80D849",
          },
        ]}
      />
    );

    const seqBlock = wrapper.instance();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findXAndWidth' does not exist on type 'C... Remove this comment to see the full error message
    const { x, width } = seqBlock.findXAndWidth(0, seq.length);

    expect(x).toEqual(0);
    expect(width).toBeGreaterThan(defaultProps.charWidth * seq.length - 5);
    expect(width).toBeLessThan(defaultProps.charWidth * seq.length + 5);
  });
});
