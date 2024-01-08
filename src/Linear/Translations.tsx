import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { borderColorByIndex, colorByIndex } from "../colors";
import { NameRange, SeqType, Translation } from "../elements";
import { randomID } from "../sequence";
import { translationAminoAcidLabel, translationHandle, translationHandleLabel } from "../style";
import { FindXAndWidthElementType, FindXAndWidthType } from "./SeqBlock";

const hoverOtherTranshlationHandleRows = (className: string, opacity: number) => {
  if (!document) return;
  const elements = document.getElementsByClassName(className) as HTMLCollectionOf<HTMLElement>;
  for (let i = 0; i < elements.length; i += 1) {
    elements[i].style.fillOpacity = `${opacity}`;
  }
};

interface TranslationRowsProps {
  bpsPerBlock: number;
  charWidth: number;
  elementHeight: number;
  findXAndWidth: FindXAndWidthType;
  findXAndWidthElement: FindXAndWidthElementType;
  firstBase: number;
  fullSeq: string;
  inputRef: InputRefFunc;
  lastBase: number;
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
  findXAndWidthElement,
  firstBase,
  fullSeq,
  inputRef,
  lastBase,
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
        elementHeight={elementHeight}
        findXAndWidth={findXAndWidth}
        findXAndWidthElement={findXAndWidthElement}
        firstBase={firstBase}
        fullSeq={fullSeq}
        height={elementHeight * 0.9}
        inputRef={inputRef}
        lastBase={lastBase}
        seqType={seqType}
        translations={translations}
        y={yDiff + elementHeight * 2 * i} // * 2 because we have two elements per row, the aminoacids and the handle
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
  elementHeight: number;
  findXAndWidth: FindXAndWidthType;
  findXAndWidthElement: FindXAndWidthElementType;
  firstBase: number;
  fullSeq: string;
  height: number;
  inputRef: InputRefFunc;
  lastBase: number;
  onUnmount: (a: unknown) => void;
  seqType: SeqType;
  translations: Translation[];
  y: number;
}) => (
  <>
    {props.translations.map((t, i) => (
      <>
        <SingleNamedElementAminoacids
          {...props}
          key={`translation-linear-${t.id}-${i}-${props.firstBase}-${props.lastBase}`}
          translation={t}
        />
        <SingleNamedElementHandle
          {...props}
          key={`translation-handle-linear-${t.id}-${i}-${props.firstBase}-${props.lastBase}`}
          element={t}
          elements={props.translations}
          index={i}
        />
      </>

    ))}
  </>
);

interface SingleNamedElementAminoacidsProps {
  bpsPerBlock: number;
  charWidth: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  fullSeq: string;
  height: number;
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
class SingleNamedElementAminoacids extends React.PureComponent<SingleNamedElementAminoacidsProps> {
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


/**
 * SingleNamedElement is a single rectangular element in the SeqBlock.
 * It does a bunch of stuff to avoid edge-cases from wrapping around the 0-index, edge of blocks, etc.
 */
const SingleNamedElementHandle = (props: {
  element: NameRange;
  elementHeight: number;
  elements: NameRange[];
  findXAndWidthElement: FindXAndWidthElementType;
  height: number;
  index: number;
  inputRef: InputRefFunc;
  y: number;
}) => {
  const { element, elementHeight, elements, findXAndWidthElement, index, inputRef, y } = props;

  const { color, end, name, start } = element;
  const { width, x: origX } = findXAndWidthElement(index, element, elements);


  // 0.591 is our best approximation of Roboto Mono's aspect ratio (width / height).
  const fontSize = 12;
  const characterWidth = 0.591 * fontSize;
  // Use at most 1/4 of the width for the name handle.
  const availableCharacters = Math.floor((width / 4) / characterWidth);

  let displayName = name;
  if (name.length > availableCharacters) {
    const charactersToShow = availableCharacters - 1;
    if (charactersToShow < 3) {
      // If we can't show at least three characters, don't show any.
      displayName = "";
    } else {
      displayName = `${name.slice(0, charactersToShow)}…`;
    }
  }
  


  // What's needed for the display + margin at the start + margin at the end
  const nameHandleMargin = 10
  const nameHandleWidth = displayName.length * characterWidth + nameHandleMargin * 2

  const x = origX;
  const w = width;
  const height = props.height;

  
  let linePath = ""
  // First rectangle that contains the name and has the whole height
  linePath += `M 0 0 L ${nameHandleWidth} 0 L ${nameHandleWidth} ${height} L 0 ${height}`;
  // Second rectangle with half the height and centered
  linePath += `M ${nameHandleWidth} ${height / 4} L ${w} ${height / 4} L ${w} ${3 * height / 4} L ${nameHandleWidth} ${3 * height / 4}`;

  return (
    <g
      ref={inputRef(element.id, {
        end,
        name,
        start,
        type: "TRANSLATION_HANDLE",
        viewer: "LINEAR",
      })}
      id={element.id}
      transform={`translate(0, ${y + elementHeight})`}
    >
      <g id={element.id} transform={`translate(${x}, 0)`}>
        {/* <title> provides a hover tooltip on most browsers */}
        <title>{name}</title>
        <path
          className={`${element.id} la-vz-translation-handle`}
          cursor="pointer"
          d={linePath}
          fill={color}
          id={element.id}
          style={translationHandle}
          onBlur={() => {
            // do nothing
          }}
          onFocus={() => {
            // do nothing
          }}
          onMouseOut={() => hoverOtherTranshlationHandleRows(element.id, 0.7)}
          onMouseOver={() => hoverOtherTranshlationHandleRows(element.id, 1.0)}
        />
        <text
          className="la-vz-handle-label"
          cursor="pointer"
          dominantBaseline="middle"
          fontSize={fontSize}
          id={element.id}
          style={translationHandleLabel}
          textAnchor="start"
          x={nameHandleMargin}
          y={height / 2 + 1}
          onBlur={() => {
            // do nothing
          }}
          onFocus={() => {
            // do nothing
          }}
          onMouseOut={() => hoverOtherTranshlationHandleRows(element.id, 0.7)}
          onMouseOver={() => hoverOtherTranshlationHandleRows(element.id, 1.0)}
        >
          {displayName}
        </text>
      </g>
    </g>
  );
};

