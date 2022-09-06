import * as React from "react";

import { borderColorByIndex, colorByIndex } from "../colors";
import { InputRefFuncType, Translation } from "../elements";
import randomid from "../randomid";
import { FindXAndWidthType } from "./SeqBlock";

interface TranslationRowsProps {
  bpsPerBlock: number;
  charWidth: number;
  elementHeight: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  inputRef: InputRefFuncType;
  lastBase: number;
  onUnmount: (a: unknown) => void;
  seqBlockRef: unknown;
  translations: Translation[];
  yDiff: number;
}

/** Rows of translations */
const TranslationRows = ({
  bpsPerBlock,
  charWidth,
  elementHeight,
  findXAndWidth,
  firstBase,
  fullSeq,
  inputRef,
  lastBase,
  onUnmount,
  seqBlockRef,
  translations,
  yDiff,
}: TranslationRowsProps) => (
  <g className="la-vz-linear-translations">
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
        seqBlockRef={seqBlockRef}
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
  inputRef: (id: string, ref: unknown) => React.LegacyRef<SVGAElement>;
  lastBase: number;
  onUnmount: (a: unknown) => void;
  seqBlockRef: unknown;
  translation: Translation;
  y: number;
}

/**
 * A single translation row
 *
 * a row for translations of DNA into Amino Acid sequences so a user can
 * see the resulting protein or peptide sequence within in the viewer
 *
 * chose here to have the row itself, with the pull part seq as a reference
 * cut up the sequence into the dna associated with the current row and
 * translate
 */
class TranslationRow extends React.Component<TranslationRowProps> {
  AAs: string[] = [];

  // on unmount, clear all AA references.
  componentWillUnmount = () => {
    const { onUnmount } = this.props;
    this.AAs.forEach(a => onUnmount(a));
  };

  /**
   * make the actual path string
   *
   * c = base pair count
   * m = multiplier (FWD or REV)
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
      seqBlockRef: element,
      translation,
      y,
    } = this.props;

    const { AAseq, direction, end, id, start } = translation;

    // build up a reference to this whole translation for
    // selection handler (used only for context clicking right now)
    const type = "TRANSLATION";
    const ref = { element, end, name: "translation", start, type };

    // substring and split only the amino acids that are relevant to this
    // particular sequence block
    const AAs = AAseq.split("");
    return (
      <g ref={inputRef(id, ref)} id={id} transform={`translate(0, ${y})`}>
        {AAs.map((a, i) => {
          // generate and store an id reference (that's used for selection)
          const aaId = randomid();
          this.AAs.push(aaId);

          // calculate the start and end point of each amino acid
          // modulo needed here for translations that cross zero index
          let AAStart = (start + i * 3) % fullSeq.length;
          let AAEnd = start + i * 3 + 3;

          // build up a reference to this whole translation for
          // selection handler (used only for context clicking right now)
          const AAref = {
            element,
            end: AAEnd,
            name: "aminoacid",
            parent: ref,
            start: AAStart,
            type: "AMINOACID",
          };

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
          if (AAStart > lastBase || AAEnd < firstBase) return null;

          let textShow = true; // whether to show amino acids abbreviation
          let bpCount = 3; // start off assuming the full thing is shown
          if (AAStart < firstBase) {
            bpCount = Math.min(3, AAEnd - firstBase);
            if (bpCount < 2) {
              // w/ one bp, the amino acid is probably too small for an abbreviation
              textShow = false;
            }
          } else if (AAEnd > lastBase) {
            bpCount = Math.min(3, lastBase - AAStart);
            if (bpCount < 2) {
              textShow = false;
            }
          }

          const { x } = findXAndWidth(Math.max(AAStart, firstBase));

          // direction check needed to determine which direction the amino acid translation
          // arrow are facing
          const path = this.genPath(bpCount, direction === 1 ? 1 : -1);

          return (
            <g key={aaId} ref={inputRef(aaId, AAref)} id={aaId} transform={`translate(${x}, 0)`}>
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
              {textShow && (
                <text
                  cursor="pointer"
                  dominantBaseline="middle"
                  id={aaId}
                  style={{
                    color: "black",
                    fontSize: 13,
                    fontWeight: 400,
                  }}
                  textAnchor="middle"
                  x={charWidth * 1.5}
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

export default TranslationRows;
