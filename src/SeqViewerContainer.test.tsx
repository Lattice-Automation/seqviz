import "@testing-library/jest-dom";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import * as React from "react";

import { SeqViz } from ".";
import Circular from "./Circular/Circular";
import Linear from "./Linear/Linear";
import CentralIndexContext from "./centralIndexContext";
import { ExternalSelection, Selection } from "./selectionContext";

const BLOCK_WIDTH = 800;

/** linearProps() subtracts padding from testSize in place. Ignore that so the block size is stable between renders */
const testSize = {
  height: 900,
  get width() {
    return BLOCK_WIDTH;
  },
  set width(_: number) {
    // do nothing
  },
};

const viewerProps = {
  annotations: [{ end: 40, name: "ann_1", start: 20 }],
  name: "test_part",
  seq: "ATGC".repeat(500),
  testSize,
};

/** The two ways consumers feed onSelection back into the selection prop */
const roundTrips: [string, (s: Selection) => any][] = [
  ["the payload passed back untouched", s => s],
  ["the documented { start, end, clockwise } shape", s => ({ clockwise: s.clockwise, end: s.end, start: s.start })],
];

const viewers = ["linear", "both"] as const;

let setSelectionProp: (selection: any) => void;
let scrollToken: number;
let latest: Selection;

/** Renders a viewer whose selection is controlled, recording the linear scroll token */
const ControlledViewer = ({
  toProp,
  viewer = "linear",
}: {
  toProp: (s: Selection) => ExternalSelection;
  viewer?: "both" | "linear";
}) => {
  const [selection, setSelection] = React.useState<ExternalSelection>({ end: 0, start: 0 });
  setSelectionProp = setSelection;

  return (
    <SeqViz
      {...viewerProps}
      selection={selection}
      viewer={viewer}
      onSelection={s => {
        latest = s;
        setSelection(toProp(s));
      }}
    >
      {({ circularProps, handleMouseEvent, inputRef, linearProps, onUnmount }) => (
        <CentralIndexContext.Consumer>
          {centralIndex => {
            scrollToken = centralIndex.linearScrollToken;
            const handlers = { handleMouseEvent, inputRef, onUnmount };
            return (
              <>
                <Linear {...linearProps} {...handlers} />
                {viewer === "both" && <Circular {...circularProps} {...handlers} />}
              </>
            );
          }}
        </CentralIndexContext.Consumer>
      )}
    </SeqViz>
  );
};

/** The x coordinate of a position that's some fraction of the way across a SeqBlock */
const atFraction = (fraction: number) => ({ clientX: fraction * BLOCK_WIDTH });

describe("SeqViewerContainer linear scrolling with a controlled selection", () => {
  beforeEach(() => {
    jest.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      height: 40,
      left: 0,
      right: BLOCK_WIDTH,
      toJSON: () => ({}),
      top: 0,
      width: BLOCK_WIDTH,
      x: 0,
      y: 0,
    });
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  describe.each(roundTrips)("round-tripping %s", (_, toProp) => {
    it.each(viewers)("does not scroll during a drag (viewer=%s)", viewer => {
      render(<ControlledViewer toProp={toProp} viewer={viewer} />);
      const [first, second, third] = screen.getAllByTestId("la-vz-seqblock");
      const before = scrollToken;

      fireEvent.mouseDown(first, atFraction(0.5));
      const { start } = latest;
      fireEvent.mouseMove(first, atFraction(0.75));
      const firstEnd = latest.end as number;
      fireEvent.mouseMove(second, atFraction(0.25));
      const secondEnd = latest.end as number;
      fireEvent.mouseMove(third, atFraction(0.25));
      fireEvent.mouseUp(third, atFraction(0.25));

      expect(scrollToken).toBe(before);
      expect(latest.start).toBe(start);
      expect(secondEnd).toBeGreaterThan(firstEnd);
      expect(latest.end as number).toBeGreaterThan(secondEnd);
    });

    it.each(viewers)("does not scroll on a shift-click (viewer=%s)", viewer => {
      render(<ControlledViewer toProp={toProp} viewer={viewer} />);
      const [first, , third] = screen.getAllByTestId("la-vz-seqblock");
      const before = scrollToken;

      fireEvent.mouseDown(first, atFraction(0.5));
      fireEvent.mouseUp(first, atFraction(0.5));
      const { start } = latest;
      fireEvent.mouseDown(third, { ...atFraction(0.5), shiftKey: true });
      fireEvent.mouseUp(third, { ...atFraction(0.5), shiftKey: true });

      expect(scrollToken).toBe(before);
      expect(latest.start).toBe(start);
      expect(latest.end as number).toBeGreaterThan(start as number);
    });

    it("does not scroll when an annotation is clicked in the linear viewer", () => {
      const { container } = render(<ControlledViewer toProp={toProp} />);
      const before = scrollToken;

      fireEvent.mouseDown(container.querySelector(".la-vz-annotation") as Element);

      expect(latest).toMatchObject({ end: 40, start: 20, type: "ANNOTATION" });
      expect(scrollToken).toBe(before);
    });

    it("scrolls to a programmatic selection made after a selection in the viewer", () => {
      render(<ControlledViewer toProp={toProp} />);
      const [first] = screen.getAllByTestId("la-vz-seqblock");
      fireEvent.mouseDown(first, atFraction(0.1));
      fireEvent.mouseMove(first, atFraction(0.5));
      const before = scrollToken;

      act(() => setSelectionProp({ end: 1500, start: 1400 }));

      expect(scrollToken).toBe(before + 1);
    });
  });

  it("scrolls to a programmatic selection", () => {
    render(<ControlledViewer toProp={s => s as ExternalSelection} />);
    const before = scrollToken;

    act(() => setSelectionProp({ end: 1500, start: 1400 }));

    expect(scrollToken).toBe(before + 1);
  });

  it("scrolls to a programmatic selection with the same start and a different end", () => {
    render(<ControlledViewer toProp={s => s as ExternalSelection} />);
    act(() => setSelectionProp({ end: 1500, start: 1400 }));
    const before = scrollToken;

    act(() => setSelectionProp({ end: 1600, start: 1400 }));

    expect(scrollToken).toBe(before + 1);
  });

  it("scrolls when a selection made in the viewer is reapplied programmatically", () => {
    render(<ControlledViewer toProp={s => s as ExternalSelection} />);
    const [first] = screen.getAllByTestId("la-vz-seqblock");
    fireEvent.mouseDown(first, atFraction(0.1));
    fireEvent.mouseMove(first, atFraction(0.5));
    const stored = latest;

    act(() => setSelectionProp({ end: 1500, start: 1400 }));
    const before = scrollToken;
    act(() => setSelectionProp(stored));

    expect(scrollToken).toBe(before + 1);
  });

  it("does not scroll to a collapsed programmatic selection", () => {
    render(<ControlledViewer toProp={s => s as ExternalSelection} />);
    const before = scrollToken;

    act(() => setSelectionProp({ end: 1400, start: 1400 }));

    expect(scrollToken).toBe(before);
  });
});
