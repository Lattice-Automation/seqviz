export class Ruler {
  readonly LATERAL_PADDING = 10

  height: number
  width: number
  seqLength: number
  start: number
  end: number
  padByBp: number

  constructor(
    height: number,
    width: number,
    seqLength: number
  ) {
    this.height = height/2
    this.start = this.LATERAL_PADDING
    this.end = width - this.LATERAL_PADDING
    this.width = this.end - this.start
    this.seqLength = seqLength
    this.padByBp = this.width / seqLength
  }

  get path() {
    return `
      M ${this.start} ${this.height}
      L ${this.end} ${this.height}
    `
  }
} 
