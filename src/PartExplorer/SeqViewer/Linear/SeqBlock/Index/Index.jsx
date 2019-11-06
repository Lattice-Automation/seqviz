import React from "react";

/**
 * a basepair indexing row for tracking the location of the current bp of DNA.
 */
export default class Index extends React.PureComponent {
  // given each basepair in the sequence, go through each and find whether 1) it is divisible
  // by the number set for tally thresholding and, if it is, 2) add its location to the list
  // of positions for tickInc
  genTicks = () => {
    const {
      seq,
      zoom,
      firstBase,
      lineHeight,
      size,
      resizing,
      findXAndWidth,
      bpsPerBlock
    } = this.props;
    const seqLength = seq.length;
    const adjustedWidth =
      seqLength >= bpsPerBlock ? size.width - 28 : size.width; // 28 accounts for 10px padding on linear scroller and 8px scroller gutter

    // the tallie distance on the x-axis is zoom dependent:
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
    const tickIndexes = [];
    if (firstBase === 0) {
      tickIndexes.push(1);
    }

    let i = 0;
    while ((i + firstBase) % tickInc !== 0) i += 1;
    while (i < seqLength) {
      if (i + firstBase !== 0) {
        tickIndexes.push(i + firstBase);
      }

      i += tickInc;
    }

    const tickStyle = {
      width: 1,
      height: 8
      // shapeRendering: "crispEdges"
    };

    const textStyle = {
      fontSize: 11,
      textRendering: resizing ? "optimizeSpeed" : "optimizeLegibility"
    };

    return tickIndexes.map(p => {
      const { x: leftDist } = findXAndWidth(p - 0.5, p - 0.5); // for midpoint
      const tickFromLeft = leftDist;
      let textFromLeft = leftDist; // 0.05 * 11

      let digits = Math.ceil(Math.log10(p + 1)); // digits in num
      // 0.91 is the aspect ratio of roboto mono, 11 is the font width. 0.91 * 11 = 10
      const textWidth = digits * 10;
      digits -= 1; // don't shift if there's just one digit
      digits /= 2; // shift by half the number's width

      textFromLeft -= digits * 10; // 10 = 0.91 x 11
      textFromLeft = Math.max(0, textFromLeft); // keep off left edge
      textFromLeft = Math.min(adjustedWidth - textWidth / 2, textFromLeft); // keep off right edge

      const transTick = `translate(${tickFromLeft}, -${0.3 * lineHeight - 1})`;
      const transText = `translate(${textFromLeft}, ${-0.3 * lineHeight + 22})`;
      return (
        <React.Fragment key={p}>
          {!resizing && (
            <rect style={tickStyle} fill="#A3A3A3" transform={transTick} />
          )}
          <text style={textStyle} transform={transText}>
            {p}
          </text>
        </React.Fragment>
      );
    });
  };

  render() {
    const {
      lineHeight,
      size,
      transform,
      showIndex,
      resizing,
      bpsPerBlock,
      seq
    } = this.props;
    const adjustedWidth =
      seq.length >= bpsPerBlock ? size.width - 28 : size.width; // 28 accounts for 10px padding on linear scroller and 8px scroller gutter
    if (!showIndex) return null;

    const axisStyle = {
      width: adjustedWidth,
      height: 1,
      shapeRendering: resizing ? "optimizeSpeed" : "crispEdges"
    };

    return (
      <g transform={transform}>
        <rect
          style={axisStyle}
          fill="#B0B9C2"
          transform={`translate(0, -${0.3 * lineHeight})`}
        />
        {this.genTicks()}
      </g>
    );
  }
}
