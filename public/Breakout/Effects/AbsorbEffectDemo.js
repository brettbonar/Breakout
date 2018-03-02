import Effect from "../../Engine/Effects/Effect.js"
import AbsorbEffect from "./AbsorbEffect.js"

export default class AbsorbEffectDemo extends Effect {
  constructor(params) {
    super(params);
    this.init(params);
    // let sound = new Audio("Assets/Explosion58.wav");
    // sound.play();
  }

  getRandomDirection(orb) {
    if (!orb.direction) {
      orb.direction = this.normalizeDirection({
        x: _.random(-1, 1, true),
        y: _.random(-1, 1, true)
      });
    }
    orb.targetDirection = this.normalizeDirection({
      x: _.random(-1, 1, true),
      y: _.random(-1, 1, true)
    });
    orb.directionChangeTime = _.random(500, 3000);
  }

  init(params) {
    this.orbs = [];
    let numOrbs = _.isUndefined(params.numOrbs) ? 10 : params.numOrbs;
    for (let i = 0; i < numOrbs; i++) {
      let orb = {
        position: {
          x: _.random(0, params.canvas.width),
          y: _.random(0, params.canvas.height)
        },
        speed: 0.3,
        acceleration: 0,
        radius: 2,
        image: AbsorbEffect.IMAGES[_.sample(params.brickColors)],
        currentTime: 0
      };
      this.getRandomDirection(orb);
      this.orbs.push(orb);
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
      AbsorbEffect.drawOrb(context, orb);
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
      if (orb.position.x < -10) {
        orb.position.x = this.canvas.width;
      } else if (orb.position.x > this.canvas.width + 10) {
        orb.position.x = 0;
      }

      if (orb.position.y < -10) {
        orb.position.y = this.canvas.height;
      } else if (orb.position.y > this.canvas.height + 10) {
        orb.position.y = 0;
      }

      orb.direction = this.normalizeDirection({
        x: orb.direction.x + (orb.targetDirection.x - orb.direction.x) * elapsedTime / 1000,
        y: orb.direction.y + (orb.targetDirection.y - orb.direction.y) * elapsedTime / 1000
      });

      orb.currentTime += elapsedTime;
      if (orb.currentTime >= orb.directionChangeTime) {
        orb.currentTime = 0;
        this.getRandomDirection(orb);
      } else {
        // orb.direction = this.normalizeDirection({
        //   x: orb.direction.x + orb.directionChange.x,
        //   y: orb.direction.y + orb.directionChange.y
        // });
      }
    }
  }
}
