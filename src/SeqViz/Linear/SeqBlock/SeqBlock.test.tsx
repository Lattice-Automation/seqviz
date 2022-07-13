import { shallow } from "enzyme";
import * as React from "react";

import SeqBlock from "./SeqBlock";

const defaultProps = {
  annotationRows: [],
  blockHeight: 40,
  bpsPerBlock: 100,
  charWidth: 12,
  cutSiteRows: [],
  elementHeight: 16,
  firstBase: 0,
  forwardPrimerRows: [],
  highlightedRegions: [],
  id: "",
  inputRef: (_: string, __: any) => React.createRef(),
  key: "",
  lineHeight: 14,
  mouseEvent: () => {},
  name: "",
  onUnmount: () => {},
  primers: [],
  reversePrimerRows: [],
  searchRows: [],
  selection: {},
  seqFontSize: 12,
  showComplement: false,
  showIndex: false,
  showPrimers: false,
  size: { height: 600, width: 1200 },
  translations: [],
  y: 0,
  zoom: { linear: 50 },
  zoomed: false,
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
      // @ts-expect-error on input ref func
      <SeqBlock
        {...defaultProps}
        annotationRows={[
          [
            {
              color: "#80D849",
              direction: 1,
              end: 71,
              id: "test",
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

    const seqBlock = wrapper.instance();
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findXAndWidth' does not exist on type 'C... Remove this comment to see the full error message
    const { width, x } = seqBlock.findXAndWidth(0, seq.length);

    expect(x).toEqual(0);
    expect(width).toBeGreaterThan(defaultProps.charWidth * seq.length - 5);
    expect(width).toBeLessThan(defaultProps.charWidth * seq.length + 5);
  });
});
