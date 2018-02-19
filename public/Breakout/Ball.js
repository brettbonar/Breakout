import BoundingBox from "../Graphics/BoundingBox.js"

export default class Ball {
  constructor(params) {
    Object.assign(this, params);

    this.position = {
      x: this.canvas.width / 2,
      y: this.canvas.height - this.gameSettings.brickHeight - 15
    };

    this.radius = this.gameSettings.ballSize;
    this.speed = this.gameSettings.ballSpeed;
    this.direction = {
      x: 0,//_.random(-0.5, 0.5, true),
      y: -1
    };

    this.normalizeDirection();
  }

  normalizeDirection() {
    let norm = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
    if (norm !== 0) {
      this.direction.x = this.direction.x / norm;
      this.direction.y = this.direction.y / norm;
    }
  }

  get boundingBox() {
    return new BoundingBox({
      position: this.position,
      radius: this.radius
    });
  }

  render(context) {
    context.save();

    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    context.closePath();

    context.fillStyle = this.color;
    context.fill();

    context.restore();
  }

  update(elapsedTime, bricks, paddle) {
    this.position.x += elapsedTime * this.speed * this.direction.x;
    this.position.y += elapsedTime * this.speed * this.direction.y;

    // Handle top and side collision
    if (this.position.y < 0) {
      this.position.y = 0;
      this.direction.y = -this.direction.y;
    } else if (this.position.y > this.canvas.height) {
      this.position.y = this.canvas.height;
      this.direction.y = -this.direction.y;
      // TODO: make ball disappear
    }
    if (this.position.x < 0) {
      this.position.x = 0;
      this.direction.x = -this.direction.x;
    } else if (this.position.x > this.canvas.width) {
      this.position.x = this.canvas.width;
      this.direction.x = -this.direction.x;
    }

    let box = this.boundingBox;
    // Handle paddle collision
    if (this.direction.y > 0 && box.intersects(paddle.boundingBox)) {
      this.direction.y = -this.direction.y;
      this.position.y = paddle.position.y - paddle.height - 2;
      paddle.color = this.color;

      // TODO: fix this
      this.direction.x = (this.position.x - (paddle.position.x + paddle.width / 2)) / (paddle.width / 2);
      this.normalizeDirection();

      // TODO: increase speed
      
      return { paddle: paddle };
    }

    // Handle brick collision
    for (const row of bricks) {
      for (const brick of row) {
        let brickBox = brick.boundingBox;
        if (brick.destroyed) {
          continue;
        }
        
        if (this.direction.y > 0 && box.intersects(brickBox.lines.top)) {
          this.position.y = brickBox.lines.top[0].y;
          brick.destroy({
            position: this.position,
            direction: this.direction,
            speed: this.speed,
            location: "top"
          });
          this.direction.y = -this.direction.y;
          this.color = brick.color;
          return { brick: brick };
        } else if (this.direction.y < 0 && box.intersects(brickBox.lines.bottom)) {
          this.position.y = brickBox.lines.bottom[0].y;
          brick.destroy({
            position: this.position,
            direction: this.direction,
            speed: this.speed,
            location: "bottom"
          });
          this.direction.y = -this.direction.y;
          this.color = brick.color;
          return { brick: brick };
        } else if (this.direction.x > 0 && box.intersects(brickBox.lines.left)) {
          this.position.x = brickBox.lines.left[0].x;
          brick.destroy({
            position: this.position,
            direction: this.direction,
            speed: this.speed,
            location: "left"
          });
          this.direction.x = -this.direction.x;
          this.color = brick.color;
          return { brick: brick };
        } else if (this.direction.x < 0 && box.intersects(brickBox.lines.right)) {
          this.position.x = brickBox.lines.right[0].x;
          brick.destroy({
            position: this.position,
            direction: this.direction,
            speed: this.speed,
            location: "right"
          });
          this.direction.x = -this.direction.x;
          this.color = brick.color;
          return { brick: brick };
        } 
      }
    }
  }
}
