import * as React from "react";

import { Size } from "../elements";
import { FindXAndWidthType } from "./SeqBlock";

interface IndexProps {
  charWidth: number;
  findXAndWidth: FindXAndWidthType;
  firstBase: number;
  lastBase: number;
  seq: string;
  showIndex: boolean;
  size: Size;
  transform: string | undefined;
  zoom: { linear: number };
}

/**
 * Index is a row with numbers showing the indexes of base pairs in the sequence.
 */
export default class Index extends React.PureComponent<IndexProps> {
  // given each basepair in the sequence, go through each and find whether 1) it is divisible
  // by the number set for tally thresholding and, if it is, 2) add its location to the list
  // of positions for tickInc
  genTicks = () => {
    const { charWidth, findXAndWidth, firstBase, seq, size, zoom } = this.props;
    const seqLength = seq.length;

    // the tally's distance on the x-axis is zoom dependent:
    // (0, 10]: every 50
    // (10, 40]: every 20
    // (40, 70]: every 10
    // (70, 100] every 5
    let tickInc = 0;
    switch (true) {
      case zoom.linear > 85:
        tickInc = 5;
        break;
      case zoom.linear > 40:
        tickInc = 10;
        break;
      case zoom.linear > 10:
        tickInc = 20;
        break;
      case zoom.linear >= 0:
        tickInc = 50;
        break;
      default:
        tickInc = 10;
    }

    // create the array that will hold all the indexes in the array
    const tickIndexes: number[] = [];
    if (firstBase === 0) {
      tickIndexes.push(1);
    }

    let i = 0;
    while ((i + firstBase) % tickInc !== 0) {
      i += 1;
    }
    while (i < seqLength) {
      if (i + firstBase !== 0) {
        tickIndexes.push(i + firstBase);
      }
      i += tickInc;
    }

    const tickStyle = {
      height: 8,
      width: 1,
      // shapeRendering: "crispEdges"
    };

    return tickIndexes.map(p => {
      let { x: tickFromLeft } = findXAndWidth(p - 1, p - 1); // for midpoint
      tickFromLeft += charWidth / 2;

      let digits = Math.ceil(Math.log10(p + 1)); // digits in num
      digits -= 1; // don't shift for the middle digit

      const indexCharWidth = 7.7; // this is pretty stable, can calculate w/ a long number's width / char count
      const textWidth = digits * indexCharWidth;

      let { x: textFromLeft } = findXAndWidth(p - 1, p - 1);
      textFromLeft += charWidth / 2;
      textFromLeft -= textWidth / 2 + 2; // this +2 I cannot explain
      textFromLeft = Math.max(0, textFromLeft); // keep off left edge
      textFromLeft = Math.min(size.width - textWidth / 2, textFromLeft); // keep off right edge

      const transTick = `translate(${tickFromLeft}, 1)`;
      const transText = `translate(${textFromLeft}, 10)`;

      return (
        <React.Fragment key={p}>
          <rect fill="#A3A3A3" style={tickStyle} transform={transTick} />
          <text
            style={{
              dominantBaseline: "hanging",
              fontSize: 11,
              textRendering: "optimizeLegibility",
            }}
            transform={transText}
          >
            {p}
          </text>
        </React.Fragment>
      );
    });
  };

  render() {
    const { findXAndWidth, firstBase, lastBase, showIndex, transform } = this.props;

    if (!showIndex) return null;

    const { width } = findXAndWidth(firstBase, lastBase);

    return (
      <g transform={transform}>
        <rect
          fill="#B0B9C2"
          style={{
            height: 1,
            shapeRendering: "crispEdges",
            width: width,
          }}
        />
        {this.genTicks()}
      </g>
    );
  }
}
