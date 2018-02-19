import BoundingBox from "../Graphics/BoundingBox.js"

export default class Brick {
  constructor(params) {
    Object.assign(this, params);

    this.position = {
      x: params.column * (this.gameSettings.brickWidth + this.gameSettings.brickLineWidth + 2) + this.gameSettings.brickLineWidth,
      y: this.gameSettings.buffer + params.row * (this.gameSettings.brickHeight + this.gameSettings.brickLineWidth + 2) + this.gameSettings.brickLineWidth
    };
    this.width = this.gameSettings.brickWidth;
    this.height = this.gameSettings.brickHeight;

    this.box = new BoundingBox({
      position: this.position,
      width: this.width + this.gameSettings.brickLineWidth / 2,
      height: this.height + this.gameSettings.brickLineWidth / 2
    });

    this.pieces = [];
    this.breakDuration = 500;
  }

  get boundingBox() {
    return this.box;
  }

  getPieces(params) {

  }

  destroy(params) {
    this.destroyed = true;
    this.currentTime = 0;
    
    let x1 = _.random(this.position.x, this.position.x + this.width);
    let x2 = this.position.x + ((this.position.x + this.width) - x1);
    this.pieces = [
      {
        line: [{ x: this.position.x, y: this.position.y + this.height }, { x: x1, y: this.position.y + this.height }],
        direction: { x: -0.5, y: -0.5 },
        rotation: 0,
        rotate: -1,
        speed: 0.05
      }, {
        line: [{ x: x1, y: this.position.y + this.height }, { x: this.position.x + this.width, y: this.position.y + this.height }],
        direction: { x: 0.5, y: -0.5 },
        rotation: 0,
        rotate: 1,
        speed: 0.05
      }, {
        line: [{ x: this.position.x, y: this.position.y + this.height }, { x: x2, y: this.position.y + this.height }],
        direction: { x: -0.5, y: 0.5 },
        rotation: 0,
        rotate: 1,
        speed: 0.05
      }, {
        line: [{ x: x2, y: this.position.y + this.height }, { x: this.position.x + this.width, y: this.position.y + this.height }],
        direction: { x: 0.5, y: 0.5 },
        rotation: 0,
        rotate: -1,
        speed: 0.05
      }, {
        line: [{ x: this.position.x, y: this.position.y }, { x: this.position.x, y: this.position.y + this.height }],
        direction: { x: -0.5, y: 0 },
        rotation: 0,
        rotate: 1,
        speed: 0.05
      }, {
        line: [{ x: this.position.x + this.width, y: this.position.y }, { x: this.position.x + this.width, y: this.position.y + this.height }],
        direction: { x: 0.5, y: 0 },
        rotation: 0,
        rotate: 1,
        speed: 0.05
      }
    ];
  }

  update(elapsedTime) {
    if (this.destroyed) {
      this.currentTime += elapsedTime;

      for (const piece of this.pieces) {
        piece.rotation += (elapsedTime / 50) * piece.rotate;
        for (const point of piece.line) {
          point.x += elapsedTime * piece.speed * piece.direction.x;
          point.y += elapsedTime * piece.speed * piece.direction.y;
        }
      }

      if (this.currentTime >= this.breakDuration) {
        this.done = true;
      }
    }
  }

  renderDestroyed(context) {
    for (const piece of this.pieces) {
      context.save();

      context.globalAlpha = Math.max((this.breakDuration - this.currentTime) / this.breakDuration, 0);
      context.beginPath();
      // TODO: use graphics lib
      if (piece.rotation) {
        let x = piece.line[0].x + Math.abs(piece.line[1].x - piece.line[0].x);
        let y = piece.line[0].y + Math.abs(piece.line[1].y - piece.line[0].y)
        context.translate(x, y);
        context.rotate((piece.rotation * Math.PI) / 180);
        context.translate(-x, -y);
      }
      context.moveTo(piece.line[0].x, piece.line[0].y);
      context.lineTo(piece.line[1].x, piece.line[1].y);
      context.closePath();

      context.strokeStyle = this.color;
      context.shadowColor = this.color;
      context.shadowBlur = this.gameSettings.brickShadowBlur * (1 - this.currentTime / this.breakDuration);
      context.lineWidth = this.gameSettings.brickLineWidth;
  
      context.stroke();
  
      context.restore();
    }
  }

  render(context) {
    if (this.destroyed) {
      if (!this.done) {
        this.renderDestroyed(context);
      }
    } else {
      context.save();

      context.strokeStyle = this.color;
      context.shadowColor = this.color;
      context.shadowBlur = this.gameSettings.brickShadowBlur;
      context.lineWidth = this.gameSettings.brickLineWidth;
      context.strokeRect(this.position.x, this.position.y, this.width, this.height);

      context.restore();
    }
  }
}
