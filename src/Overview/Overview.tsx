import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { Annotation, NameRange, Size } from "../elements";
import { createMultiRows, createSingleRows, stackElements } from "../elementsToRows";
import isEqual from "../isEqual";
import { createTranslations } from "../sequence";

export interface OverviewProps {
  annotations: Annotation[];
  compSeq: string;
  elementHeight: number;
  handleMouseEvent: React.MouseEventHandler;
  inputRef: InputRefFunc;
  lineHeight: number;
  onUnmount: (id: string) => void;
  search: NameRange[];
  seq: string;
  seqFontSize: number;
  showComplement: boolean;
  showIndex: boolean;
  size: Size;
  zoom: { overview: number };
}

/**
 * A single row Overview of a sequence.
 */
export default class Overview extends React.Component<OverviewProps> {
  /**
   * Deep equality comparison
   */
  shouldComponentUpdate = (nextProps: OverviewProps) => !isEqual(nextProps, this.props);

  render() {
    const {
      annotations,
      compSeq,
      elementHeight,
      lineHeight,
      onUnmount,
      seq,
      showComplement,
      showIndex,
      size,
      zoom,
    } = this.props;

    const annotationRows = createMultiRows(
      stackElements(annotations, seq.length),
      seq.length,
      1
    );

    const seqBlocks: JSX.Element[] = [];
    let yDiff = 0;
    for (let i = 0; i < arrSize; i += 1) {
      const firstBase = i * bpsPerBlock;
      seqBlocks.push(
        <SeqBlock
          key={ids[i]}
          annotationRows={annotationRows[i]}
          blockHeight={blockHeights[i]}
          bpColors={this.props.bpColors}
          bpsPerBlock={bpsPerBlock}
          charWidth={this.props.charWidth}
          compSeq={compSeqs[i]}
          cutSiteRows={cutSiteRows[i]}
          elementHeight={elementHeight}
          firstBase={firstBase}
          fullSeq={seq}
          handleMouseEvent={this.props.handleMouseEvent}
          highlights={highlightRows[i]}
          id={ids[i]}
          inputRef={this.props.inputRef}
          lineHeight={lineHeight}
          searchRows={searchRows[i]}
          seq={seqs[i]}
          seqFontSize={this.props.seqFontSize}
          seqType={seqType}
          showComplement={showComplement}
          showIndex={showIndex}
          size={size}
          translations={translationRows[i]}
          y={yDiff}
          zoom={zoom}
          zoomed={zoomed}
          onUnmount={onUnmount}
        />
      );
      yDiff += blockHeights[i];
    }
  }
}
