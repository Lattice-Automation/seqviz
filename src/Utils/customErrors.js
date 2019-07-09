export function ImportErrorTooLarge(message, seqLength) {
  this.name = "ImportErrorTooLarge";
  this.message = message || "";
  this.seqLength = seqLength || "";
  this.prototype = Error.prototype;
}

export function ImportError(message) {
  this.name = "ImportError";
  this.message = message || "";
  this.prototype = Error.prototype;
}
