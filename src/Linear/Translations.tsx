import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { borderColorByIndex, colorByIndex } from "../colors";
import { SeqType, Translation } from "../elements";
import { randomID } from "../sequence";
import { FindXAndWidthType } from "./SeqBlock";

interface TranslationRowsProps {
  bpsPerBlock: number;
  charWidth: number;
  elementHeight: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  inputRef: InputRefFunc;
  lastBase: number;
  onUnmount: (a: unknown) => void;
  seqType: SeqType;
  translations: Translation[];
  yDiff: number;
}

/** Rows of translations */
export const TranslationRows = ({
  bpsPerBlock,
  charWidth,
  elementHeight,
  findXAndWidth,
  firstBase,
  fullSeq,
  inputRef,
  lastBase,
  onUnmount,
  seqType,
  translations,
  yDiff,
}: TranslationRowsProps) => (
  <g className="la-vz-linear-translation" data-testid="la-vz-linear-translation">
    {translations.map((t, i) => (
      <TranslationRow
        key={`${t.id}-${firstBase}`}
        bpsPerBlock={bpsPerBlock}
        charWidth={charWidth}
        findXAndWidth={findXAndWidth}
        firstBase={firstBase}
        fullSeq={fullSeq}
        height={elementHeight * 0.9}
        id={t.id}
        inputRef={inputRef}
        lastBase={lastBase}
        seqType={seqType}
        translation={t}
        y={yDiff + elementHeight * i}
        onUnmount={onUnmount}
      />
    ))}
  </g>
);

interface TranslationRowProps {
  bpsPerBlock: number;
  charWidth: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  height: number;
  id?: string;
  inputRef: InputRefFunc;
  lastBase: number;
  onUnmount: (a: unknown) => void;
  seqType: SeqType;
  translation: Translation;
  y: number;
}

/**
 * A single row for translations of DNA into Amino Acid sequences so a user can
 * see the resulting protein or peptide sequence in the viewer
 */
class TranslationRow extends React.PureComponent<TranslationRowProps> {
  AAs: string[] = [];

  // on unmount, clear all AA references.
  componentWillUnmount = () => {
    const { onUnmount } = this.props;
    this.AAs.forEach(a => onUnmount(a));
  };

  /**
   * make the actual path string
   */
  genPath = (count: number, multiplier: number) => {
    const { charWidth, height: h } = this.props; // width adjust

    const nW = count * charWidth;
    const wA = multiplier * 3;

    return `M 0 0
			L ${nW} 0
			L ${nW + wA} ${h / 2}
			L ${nW} ${h}
			L 0 ${h}
			L ${wA} ${h / 2}
			Z`;
  };

  render() {
    const {
      bpsPerBlock,
      charWidth,
      findXAndWidth,
      firstBase,
      fullSeq,
      height: h,
      inputRef,
      lastBase,
      seqType,
      translation,
      y,
    } = this.props;

    const { AAseq, direction, end, id, start } = translation;

    // if rendering an amino-acid sequence directly, each amino acid block is 1:1 with a "base pair".
    // otherwise, each amino-acid covers three bases.
    const bpPerBlockCount = seqType === "aa" ? 1 : 3;

    // substring and split only the amino acids that are relevant to this
    // particular sequence block
    const AAs = AAseq.split("");
    return (
      <g
        ref={inputRef(id, {
          end,
          name: "translation",
          parent: { ...translation, type: "TRANSLATION" },
          start,
          type: "AMINOACID",
          viewer: "LINEAR",
        })}
        id={id}
        transform={`translate(0, ${y})`}
      >
        {AAs.map((a, i) => {
          // generate and store an id reference (that's used for selection)
          const aaId = randomID();
          this.AAs.push(aaId);

          // calculate the start and end point of each amino acid
          // modulo needed here for translations that cross zero index
          let AAStart = (start + i * bpPerBlockCount) % fullSeq.length;
          let AAEnd = start + i * bpPerBlockCount + bpPerBlockCount;

          if (AAStart > AAEnd && firstBase >= bpsPerBlock) {
            // amino acid has crossed zero index in the last SeqBlock
            AAEnd += fullSeq.length;
          } else if (AAStart > AAEnd && firstBase < bpsPerBlock) {
            // amino acid has crossed zero index in the first SeqBlock
            AAStart -= fullSeq.length;
          } else if (AAStart === 0 && firstBase >= bpsPerBlock) {
            // extreme edge case (1/3 around zero) where modulo returns zero
            AAStart += fullSeq.length;
            AAEnd += fullSeq.length;
          }

          // build up a selection handler reference for just this amino acid,
          // so a singly translated amino acid can be selected from within the
          // larger translation

          // the amino acid doesn't fit within this SeqBlock (even partially)
          if (AAStart >= lastBase || AAEnd <= firstBase) return null;

          let showAminoAcidLabel = true; // whether to show amino acids abbreviation
          let bpCount = bpPerBlockCount; // start off assuming the full thing is shown
          if (AAStart < firstBase) {
            bpCount = Math.min(bpPerBlockCount, AAEnd - firstBase);
            if (bpCount < 2 && seqType !== "aa") {
              // w/ one bp, the amino acid is probably too small for an abbreviation
              showAminoAcidLabel = false;
            }
          } else if (AAEnd > lastBase) {
            bpCount = Math.min(bpPerBlockCount, lastBase - AAStart);
            if (bpCount < 2 && seqType !== "aa") {
              showAminoAcidLabel = false;
            }
          }

          const { x } = findXAndWidth(Math.max(AAStart, firstBase));

          // direction check needed to determine which direction the amino acid translation
          // arrow are facing
          const path = this.genPath(bpCount, direction === 1 ? 1 : -1);

          return (
            <g
              key={aaId}
              ref={inputRef(aaId, {
                end: AAEnd,
                parent: { ...translation, type: "TRANSLATION" },
                start: AAStart,
                type: "AMINOACID",
                viewer: "LINEAR",
              })}
              id={aaId}
              transform={`translate(${x}, 0)`}
            >
              <path
                d={path}
                fill={colorByIndex(a.charCodeAt(0))}
                id={aaId}
                shapeRendering="geometricPrecision"
                stroke={borderColorByIndex(a.charCodeAt(0))}
                style={{
                  cursor: "pointer",
                  opacity: 0.7,
                  strokeWidth: 0.8,
                }}
              />

              {showAminoAcidLabel && (
                <text
                  className="la-vz-translation-amino-acid-label"
                  cursor="pointer"
                  data-testid="la-vz-translation"
                  dominantBaseline="middle"
                  id={aaId}
                  textAnchor="middle"
                  x={bpCount * 0.5 * charWidth}
                  y={`${h / 2 + 1}`}
                >
                  {a}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  }
}
