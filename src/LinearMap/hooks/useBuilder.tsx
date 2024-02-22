import { useMemo } from "react"
import { IndexProps } from "../Index"
import { Ruler } from "../Ruler"
import { RulerTicks } from "../Tick"

type BuilderProps = IndexProps
export function useBuilder({ height, width, seqLength }: BuilderProps) {
  const { ruler, ticks } = useMemo(() => {
    const ruler = new Ruler(height, width, seqLength)
    const ticks = new RulerTicks(ruler).ticks
    return { 
      ruler,
      ticks
    }
  }, [height, width, seqLength]) 

  return { ruler, ticks }
}
