import BoundingBox from "../Graphics/BoundingBox.js"

export default class Paddle {
  constructor(params) {
    Object.assign(this, params);
    
    this.position = {
      x: this.canvas.width / 2 - this.gameSettings.brickWidth / 2,
      y: this.canvas.height - this.gameSettings.brickHeight - 5
    };
    this.width = this.gameSettings.brickWidth * 2;
    this.height = this.gameSettings.brickHeight;
    this.color = this.gameSettings.brickColors[this.gameSettings.brickColors.length - 1];
  }

  get boundingBox() {
    return new BoundingBox({
      position: this.position,
      width: this.width,
      height: this.height
    });
  }

  render(context) {
    context.save();

    context.strokeStyle = this.color;
    context.fillStyle = this.color;
    context.shadowColor = this.color;
    context.shadowBlur = this.gameSettings.brickShadowBlur;
    //this.context.lineWidth = this.gameSettings.brickLineWidth;
    //this.context.strokeRect(this.x - this.width, this.canvas.height - this.height - 5, this.width, this.height);
    context.fillRect(this.position.x, this.position.y, this.width, this.height);

    context.restore();
  }
}
