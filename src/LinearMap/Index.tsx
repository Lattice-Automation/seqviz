import * as React from "react";
import { indexLine, indexTick, indexTickLabel } from "../style";
import { useBuilder } from "./hooks/useBuilder";
import { Tick } from "./Tick";


/**
 * The Index component renders the Linear Map's:
 * 		1. name (center or bottom)
 * 		2. number of bps (center or bottom)
 * 		3. index ticks and numbers along the Linear Map
 */

export interface IndexProps {
  height: number
  width: number
  seqLength: number
}

export function Index(props: IndexProps) {
  const { ruler, ticks } = useBuilder(props) 

  return (
    <g>

      {/* The ticks and their index labels */}
      {ticks.map((tick: Tick) => (
        <g key={`la-vz-tick-${tick.position}`}>
          <path
            className="la-vz-index-tick"
            d={tick.path}
            style={indexTick}
          />
          <text
            className="la-vz-index-tick-label"
            style={indexTickLabel}
            textAnchor="middle"
            x={tick.text.x}
            y={tick.text.y}
          >
            {tick.position}
          </text>
        </g>
      ))
    }

      {/* The ruler is abstract line representing sequence length and giving relative references for other elements as Annotations, Cut sites, Primers, etc. */}
      <g>
        <path
          className="la-vz-index-line"
          d={ruler.path}
          style={indexLine}
        />
      </g>
    </g>
  );
}
