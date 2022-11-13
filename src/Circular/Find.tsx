import * as React from "react";

import { InputRefFunc } from "../SelectionHandler";
import { HighlightProp, Range } from "../elements";
import { Arc, GenArcFunc, RENDER_SEQ_LENGTH_CUTOFF } from "./Circular";

const Find = (props: {
  genArc: GenArcFunc;
  getRotation: (index: number) => string;
  highlights: HighlightProp[];
  inputRef: InputRefFunc;
  lineHeight: number;
  radius: number;
  search: Range[];
  seqLength: number;
}) => {
  const { genArc, getRotation, highlights, inputRef, lineHeight, radius, search, seqLength } = props;
  const threshold = seqLength > RENDER_SEQ_LENGTH_CUTOFF ? search.length / seqLength <= 0.02 : true;

  return (
    <g className="la-vz-circular-search">
      {threshold &&
        search.map(s => (
          <Arc
            key={JSON.stringify(s)}
            className="la-vz-search"
            direction={s.direction || 1}
            end={s.end}
            genArc={genArc}
            getRotation={getRotation}
            inputRef={inputRef}
            lineHeight={lineHeight}
            radius={radius}
            seqLength={seqLength}
            start={s.start}
          />
        ))}

      {highlights.map(({ color, end, start }) => (
        <Arc
          key={`la-vz-highlight-${start}-${end}`}
          className="la-vz-highlight"
          color={color}
          direction={1}
          end={end}
          genArc={genArc}
          getRotation={getRotation}
          inputRef={inputRef}
          lineHeight={lineHeight}
          radius={radius}
          seqLength={seqLength}
          start={start}
        />
      ))}
    </g>
  );
};

export default Find;
