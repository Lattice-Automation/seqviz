import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

import * as React from "react";

import { SeqType, Translation } from "../elements";
import { createTranslations } from "../sequence";
import { TranslationRows } from "./Translations";

const renderRow = (translation: Translation, seq: string, firstBase: number, lastBase: number, seqType: SeqType) => {
  const refs = new Map();
  const row = (yDiff = 0) => (
    <React.StrictMode>
      <svg>
        <TranslationRows
          bpsPerBlock={lastBase - firstBase}
          charWidth={10}
          elementHeight={16}
          findXAndWidth={start => ({ width: 10, x: ((start ?? 0) - firstBase) * 10 })}
          findXAndWidthElement={() => ({ overflowLeft: false, overflowRight: false, width: 100, x: 0 })}
          firstBase={firstBase}
          fullSeq={seq}
          inputRef={(id, range) => {
            refs.set(id, range);
          }}
          lastBase={lastBase}
          seqType={seqType}
          translationRows={[[translation]]}
          yDiff={yDiff}
          onUnmount={id => {
            refs.delete(id);
          }}
        />
      </svg>
    </React.StrictMode>
  );
  return { ...render(row()), refs, row };
};

afterEach(() => jest.restoreAllMocks());

it("processes only the protein row and reuses its residue IDs", () => {
  const seq = "ACDEFGHIKLMNPQRSTVWY".repeat(30);
  const split = jest.spyOn(String.prototype, "split");
  const random = jest.spyOn(Math, "random");
  const translation = { AAseq: seq, direction: 1 as const, end: seq.length, id: "protein", name: "", start: 0 };
  const { container, refs, rerender, row, unmount } = renderRow(translation, seq, 201, 241, "aa");

  expect(container.textContent).toBe(seq.slice(201, 241));
  // The original renderer split the whole protein and allocated an ID for every residue.
  expect(split.mock.contexts.map(String)).not.toContain(seq);
  expect(random).toHaveBeenCalledTimes(40);
  const residues = Array.from(refs).filter(([id]) => id !== "protein");
  expect(residues.every(([, range]) => range.type === "AMINOACID" && range.parent?.type === "TRANSLATION")).toBe(true);
  expect(residues.map(([, range]) => [range.start, range.end])).toEqual(
    Array.from({ length: 40 }, (_, i) => [201 + i, 202 + i]),
  );
  rerender(row(16));
  expect(random).toHaveBeenCalledTimes(40);
  expect(Array.from(refs).filter(([id]) => id !== "protein")).toEqual(residues);
  unmount();
  expect(residues.filter(([id]) => refs.has(id))).toEqual([]);
});

it.each(["dna", "rna"] as SeqType[])("keeps partial %s codons at row boundaries", seqType => {
  const seq = "ATGCCCGGGT".repeat(3).replace(/T/g, seqType === "rna" ? "U" : "T");
  const [translation] = createTranslations([{ direction: -1, end: 27, id: "cds", name: "", start: 3 }], seq, seqType);
  const { container, refs } = renderRow({ ...translation, direction: -1 }, seq, 7, 17, seqType);
  expect(container.textContent).toBe(translation.AAseq.slice(1, 5));
  const codons = Array.from(refs).filter(([id]) => id !== "cds");
  expect(codons.map(([, range]) => [range.start, range.end])).toEqual([
    [6, 9],
    [9, 12],
    [12, 15],
    [15, 18],
  ]);
});
