import BoundingBox from "../Graphics/BoundingBox.js"

export default class Paddle {
  constructor(params) {
    Object.assign(this, params);
    
    this.position = {
      x: this.gameSettings.playArea.center.x,
      y: this.gameSettings.playArea.bottom.y - this.gameSettings.brickHeight
    };
    this.height = this.gameSettings.brickHeight;
    this.color = this.gameSettings.brickColors[this.gameSettings.brickColors.length - 1];
    this.shadowBlur = this.gameSettings.brickShadowBlur;
  }

  get boundingBox() {
    return new BoundingBox({
      position: this.position,
      width: this.width,
      height: this.height
    });
  }

  get center() {
    return {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };
  }

  static draw(context, params) {
    context.save();

    context.strokeStyle = params.color;
    context.fillStyle = params.color;
    context.shadowColor = params.color;
    context.shadowBlur = params.shadowBlur;
    //this.context.lineWidth = this.gameSettings.brickLineWidth;
    //this.context.strokeRect(this.x - this.width, this.canvas.height - this.height - 5, this.width, this.height);
    context.fillRect(params.position.x, params.position.y, params.width, params.height);

    context.restore();
  }

  render(context) {
    Paddle.draw(context, this);
  }
}
