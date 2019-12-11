import * as React from "react";
import { shallow } from "enzyme";

import SeqViz from "./SeqViz";

/**
 * this test is for a bug where annotations on single SeqBlock
 * rows extend far past the length of the bp
 * https://user-images.githubusercontent.com/45974914/70350820-857b3900-1835-11ea-951f-32436b72b18c.png
 */
it("renders short annotations", () => {
  const wrapper = shallow(
    <SeqViz
      name="test"
      seq="ATGAT"
      annotations={[
        {
          name: "",
          start: 0,
          end: 5
        }
      ]}
      style={{ height: 600, width: 600 }}
    />
  );

  const annRows = wrapper.find(".la-vz-linear-annotations");
  const seqRows = wrapper.find(".la-vz-linear-translations");

  expect(annRows.length).toEqual(1);
  expect(seqRows.length).toEqual(1);
});
