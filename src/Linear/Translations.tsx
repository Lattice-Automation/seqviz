import * as React from "react";

import { InputRefFunc, RefSelection } from "../SelectionHandler";
import { borderColorByIndex, colorByIndex } from "../colors";
import { SeqType, Translation } from "../elements";
import { randomID } from "../sequence";
import { translationAminoAcidLabel } from "../style";
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
  onClick: (element: any, circular: boolean, linear: boolean, container: Element) => void;
  onDoubleClick: (element: any, circular: boolean, linear: boolean, container: Element) => void;
  onHover: (element: any, hover: boolean, view: "LINEAR" | "CIRCULAR", container: Element) => void;
  onUnmount: (a: unknown) => void;
  seqType: SeqType;
  translationRows: Translation[][];
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
  onClick,
  onDoubleClick,
  onHover,
  onUnmount,
  seqType,
  translationRows,
  yDiff,
}: TranslationRowsProps) => (
  <g className="la-vz-linear-translation" data-testid="la-vz-linear-translation">
    {translationRows.map((translations, i) => (
      <TranslationRow
        key={`i-${firstBase}`}
        bpsPerBlock={bpsPerBlock}
        charWidth={charWidth}
        findXAndWidth={findXAndWidth}
        firstBase={firstBase}
        fullSeq={fullSeq}
        height={elementHeight * 0.9}
        inputRef={inputRef}
        lastBase={lastBase}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onHover={onHover}
        seqType={seqType}
        translations={translations}
        y={yDiff + elementHeight * i}
        onUnmount={onUnmount}
      />
    ))}
  </g>
);

/**
 * A single row of translations. Multiple of these may be in one seqBlock
 * vertically stacked on top of one another in non-overlapping arrays.
 */
const TranslationRow = (props: {
  bpsPerBlock: number;
  charWidth: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  height: number;
  inputRef: InputRefFunc;
  lastBase: number;
  onClick: (element: any, circular: boolean, linear: boolean, container: Element) => void;
  onDoubleClick: (element: any, circular: boolean, linear: boolean, container: Element) => void;
  onHover: (element: any, hover: boolean, view: "LINEAR" | "CIRCULAR", container: Element) => void;
  onUnmount: (a: unknown) => void;
  seqType: SeqType;
  translations: Translation[];
  y: number;
}) => (
  <>
    {props.translations.map((t, i) => (
      <SingleNamedElement
        {...props} // include overflowLeft in the key to avoid two split annotations in the same row from sharing a key
        key={`translation-linear-${t.id}-${i}-${props.firstBase}-${props.lastBase}`}
        translation={t}
      />
    ))}
  </>
);

interface SingleNamedElementProps {
  bpsPerBlock: number;
  charWidth: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  height: number;
  inputRef: InputRefFunc;
  lastBase: number;
  onClick: (element: any, circular: boolean, linear: boolean, container: Element) => void;
  onDoubleClick: (element: any, circular: boolean, linear: boolean, container: Element) => void;
  onHover: (element: any, hover: boolean, view: "LINEAR" | "CIRCULAR", container: Element) => void;
  onUnmount: (a: unknown) => void;
  seqType: SeqType;
  translation: Translation;
  y: number;
}

/**
 * A single row for translations of DNA into Amino Acid sequences so a user can
 * see the resulting protein or peptide sequence in the viewer
 */
class SingleNamedElement extends React.PureComponent<SingleNamedElementProps> {
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
      onClick,
      onDoubleClick,
      onHover,
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

          const aaElement: RefSelection = {
            end: AAEnd,
            parent: { ...translation, type: "TRANSLATION" },
            start: AAStart,
            type: "AMINOACID",
            viewer: "LINEAR",
          };

          return (
            <g
              key={aaId}
              ref={inputRef(aaId, aaElement)}
              id={aaId}
              transform={`translate(${x}, 0)`}
              onClick={e => {
                onClick(aaElement, false, true, e.target as SVGGElement);
              }}
              onDoubleClick={e => {
                onDoubleClick(aaElement, false, true, e.target as SVGGElement);
              }}
              onMouseEnter={e => {
                onHover(aaElement, true, "LINEAR", e.target as SVGGElement);
              }}
              onMouseLeave={e => {
                onHover(aaElement, false, "LINEAR", e.target as SVGGElement);
              }}
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
                  style={translationAminoAcidLabel}
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
