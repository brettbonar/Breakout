import Effect from "../../Engine/Effects/Effect.js"

export default class AbsorbEffect extends Effect {
  constructor(params) {
    super(params);
    this.init(params);
    // let sound = new Audio("Assets/Explosion58.wav");
    // sound.play();
  }

  init(params) {
    this.orbs = [];
    let numOrbs = params.brick.value;
    for (let i = 0; i < numOrbs; i++) {
      this.orbs.push({
        position: {
          x: _.random(params.brick.left.x, params.brick.right.x),
          y: _.random(params.brick.top.y, params.brick.bottom.y)
        },
        direction: Object.assign({}, params.ball.direction),
        speed: 0,
        acceleration: 0.015,
        radius: 2,
        fillStyle: params.brick.color
      });
    }
  }
  
  normalizeDirection(direction) {
    let norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (norm !== 0) {
      return {
        x: direction.x / norm,
        y: direction.y / norm
      };
    }
    return direction;
  }

  drawOrbs(context) {
    context.save();

    for (const orb of this.orbs) {
      context.beginPath();
      context.arc(orb.position.x, orb.position.y, orb.radius, 0, 2 * Math.PI);
      context.closePath();
  
      context.shadowColor = orb.fillStyle;
      context.shadowBlur = 35;
      context.fillStyle = orb.fillStyle;
      context.fill();
      context.strokeStyle = orb.strokeStyle;
      context.stroke();
    }

    context.restore();
  }

  render(context) {
    this.drawOrbs(context);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;

    for (const orb of this.orbs) {
      orb.position.x += elapsedTime * orb.speed * orb.direction.x;
      orb.position.y += elapsedTime * orb.speed * orb.direction.y;
      orb.speed += (elapsedTime / 50) * orb.acceleration;
      orb.direction = this.normalizeDirection({
        x: this.ball.position.x - orb.position.x,
        y: this.ball.position.y - orb.position.y
      });

      if (this.ball.boundingBox.intersects(orb.position)) {
        // let sound = new Audio("Assets/absorb.wav");
        // sound.play();
        this.ball.addSpark(orb.fillStyle);
        orb.done = true;
      } else if (orb.position.y > this.gameSettings.playArea.bottom.y + 15) {
        orb.done = true;
      }
    }
    
    _.remove(this.orbs, "done");

    if (this.orbs.length === 0) {
      this.done = true;
    }
  }
}
