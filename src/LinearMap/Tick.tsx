import { Ruler } from "./Ruler"

export class RulerTicks {
  private readonly HORIZONTAL_TICK_LENGTH = 10
  private readonly TICK_COUNT = 6
  private ruler: Ruler

  constructor(ruler: Ruler) {
    this.ruler = ruler
  }

  private getPadByPosition(bpPosition: number) {
    return this.ruler.start + this.ruler.padByBp * bpPosition
  }

  private getTickPath(position: number) {
    const pad = this.getPadByPosition(position)
    return `
      M ${pad} ${this.ruler.height}
      L ${pad} ${this.ruler.height + this.HORIZONTAL_TICK_LENGTH}
    `
  }

  private getTickText(rightPad: number) {
    const TICK_TEXT_LINE = this.HORIZONTAL_TICK_LENGTH * 2
    const textLineHeight = this.ruler.height + TICK_TEXT_LINE 
    return {
      x: rightPad,
      y: textLineHeight
    }
  }

  private getTick(position: number): Tick {
    const rightPad = this.getPadByPosition(position)
    return {
      position,
      path: this.getTickPath(position),
      text: this.getTickText(rightPad)
    }
  }
  
  private buildTicks(positions: number[]) {
    return positions.map(position => this.getTick(position))
  }

  get positions(): number[] {
    const increments = Math.floor(this.ruler.seqLength / this.TICK_COUNT);
    let indexInc = Math.max(+increments.toPrecision(2), 10);
    while (indexInc % 10 !== 0) indexInc += 1;
  //
    let ticks: number[] = [];
    for (let i = indexInc; i <= this.ruler.seqLength - indexInc; i += indexInc) {
      ticks.push(i === 0 ? 1 : i);
    }

    return ticks
  }

  get ticks(): Tick[] {
    return this.buildTicks(this.positions)
  }
} 


export interface Tick {
  position: number
  path: string
  text: {
    x: number
    y: number
  }
}
