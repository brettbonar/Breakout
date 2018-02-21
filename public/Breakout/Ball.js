import BoundingBox from "../Graphics/BoundingBox.js"
import Vector from "../Graphics/Vector.js"

export default class Ball {
  constructor(params) {
    Object.assign(this, params);

    this.lastPosition = {
      x: this.position.x,
      y: this.position.y
    };

    _.defaults(this, {
      radius: this.gameSettings.ballSize,
      speed: this.gameSettings.ballSpeed,
      direction: {
        x: _.random(-0.5, 0.5, true),
        y: -1
      }
    });

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

  get vector() {
    let mid = new Vector([this.lastPosition, this.position]);
    let left = mid.getParallelLine(this.radius);
    let right = mid.getParallelLine(-this.radius);
    mid.extend(this.radius);
    return [mid, left, right];
  }

  render(context) {
    context.save();

    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    context.closePath();

    context.fillStyle = this.color;
    context.fill();

    context.restore();

    // DEBUG
    // for (const vector of this.vector) {
    //   vector.render(context);
    // }
  }

  checkBrickCollision(elapsedTime, row, paddle) {
    // TODO: FIX ALL THIS
    // Handle brick collision
    let box = this.boundingBox;
    for (const brick of row) {
      let brickBox = brick.boundingBox;
      if (brick.destroyed) {
        continue;
      }

      // TODO: https://www.gamasutra.com/view/feature/3383/simple_intersection_tests_for_games.php?page=3
      let vectors = this.vector;
      let box = this.boundingBox;
      let intersections = _.map(brickBox.lines, (line, location) => {
        let result = {
          location: location,
          weight: 0
        };

        // TODO: see if direction check should go here for performance

        result.weight = vectors.reduce((prev, vector, index) => {
          // Afford special weight to center vector
          let weight = index === 0 ? 1.5 : 1;
          return vector.intersects(brickBox.lines[location]) ? prev + weight : prev;
        }, 0);
        
        return result;
      })
      .filter((res) => res.weight > 0)
      .sort((a, b) => b.weight - a.weight);

      for (const intersection of intersections) {      
        if (this.direction.y > 0 && intersection.location === "top") {
          this.position.y = brickBox.lines.top[0].y - this.radius;
          brick.destroy({
            position: this.position,
            direction: this.direction,
            speed: this.speed,
            location: "top"
          });
          this.direction.y = -this.direction.y;
          this.color = brick.color;
          return { brick: brick };
        } else if (this.direction.y < 0 && intersection.location === "bottom") {
          this.position.y = brickBox.lines.bottom[0].y + this.radius;
          brick.destroy({
            position: this.position,
            direction: this.direction,
            speed: this.speed,
            location: "bottom"
          });
          this.direction.y = -this.direction.y;
          this.color = brick.color;
          return { brick: brick };
        } else if (this.direction.x > 0 && intersection.location === "left") {
          this.position.x = brickBox.lines.left[0].x - this.radius;
          brick.destroy({
            position: this.position,
            direction: this.direction,
            speed: this.speed,
            location: "left"
          });
          this.direction.x = -this.direction.x;
          this.color = brick.color;
          return { brick: brick };
        } else if (this.direction.x < 0 && intersection.location === "right") {
          this.position.x = brickBox.lines.right[0].x + this.radius;
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

  update(elapsedTime, bricks, paddle) {
    Object.assign(this.lastPosition, this.position);
    this.position.x += elapsedTime * this.speed * this.direction.x;
    this.position.y += elapsedTime * this.speed * this.direction.y;
    
    // Handle paddle collision
    let vector = this.vector;
    if (this.direction.y > 0 && vector.some((vec) => vec.intersects(paddle.boundingBox))) {
      this.direction.y = -this.direction.y;
      this.position.y = paddle.position.y - paddle.height - this.gameSettings.brickLineWidth;
      paddle.color = this.color;

      this.direction.x = (this.position.x - (paddle.position.x + paddle.width / 2)) / (paddle.width / 2);
      this.normalizeDirection();

      // TODO: increase speed
      
      return { paddle: paddle };
    }

    let brick;
    let iterator = _.each;
    if (this.direction.y < 0) {
      iterator = _.eachRight;
    }
    iterator(bricks, (row) => {
      if (brick) {
        return false;
      }
      brick = this.checkBrickCollision(elapsedTime, row, paddle);
    });
    if (brick) {
      return brick;
    }
    
    // Handle top and side collision
    if (this.position.y - this.radius < this.gameSettings.playArea.top.y) {
      this.position.y = this.gameSettings.playArea.top.y + this.radius;
      this.direction.y = -this.direction.y;
    } else if (this.position.y - this.radius > this.gameSettings.playArea.bottom.y + this.gameSettings.playArea.bottomBuffer) {
      this.dead = true;
    }
    if (this.position.x - this.radius < this.gameSettings.playArea.top.x) {
      this.position.x = this.gameSettings.playArea.top.x + this.radius;
      this.direction.x = -this.direction.x;
    } else if (this.position.x + this.radius > this.gameSettings.playArea.top.x + this.gameSettings.playArea.width) {
      this.position.x = this.gameSettings.playArea.top.x + this.gameSettings.playArea.width - this.radius;
      this.direction.x = -this.direction.x;
    }
  }
}
