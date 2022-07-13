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
  id: "",
  inputRef: (_: string, __: any) => React.createRef(),
  lineHeight: 14,
  mouseEvent: () => {},
  name: "",
  onUnmount: () => {},
  primers: [],
  reversePrimerRows: [],
  searchRows: [],
  seqFontSize: 12,
  size: { height: 600, width: 1200 },
  translations: [],
  y: 0,
  zoom: { linear: 50 },
  zoomed: false,
  key: "",
  selection: {},
  showIndex: false,
  showPrimers: false,
  showComplement: false,
  highlightedRegions: [],
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
              id: "test",
              color: "#80D849",
              direction: 1,
              end: 71,
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
