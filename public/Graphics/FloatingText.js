import Text from "./Text.js"

export default class FloatingText extends Text {
  constructor(spec) {
    super(spec);
    this.currentTime = 0;
    this.fillStyle = spec.fillStyle || "gold";
    this.textAlign = "center";
    this.position = spec.start;
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;
    this.position = {
      x: this.start.x + (this.end.x - this.start.x) * Math.min(this.currentTime / this.duration, 1),
      y: this.start.y + (this.end.y - this.start.y) * Math.min(this.currentTime / this.duration, 1)
    };

    if (this.y === this.end.y && this.x === this.end.x) {
      this.done = true;
    }
  }

  render(context) {
    context.save();

    if (this.fade) {
      context.globalAlpha = Math.max((this.duration - this.currentTime) / this.duration, 0);
    }
    super.render(context);

    context.restore();
  }
}
