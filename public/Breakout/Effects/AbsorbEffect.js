import Effect from "../../Engine/Effects/Effect.js"

const TURN_TIME = 3000;

const IMAGES = {
  lawnGreen: new Image(),
  aqua: new Image(),
  yellow: new Image(),
  orange: new Image()
};
IMAGES.lawnGreen.src = "../../Assets/lawnGreen-star.png";
IMAGES.aqua.src = "../../Assets/aqua-star.png";
IMAGES.yellow.src = "../../Assets/yellow-star.png";
IMAGES.orange.src = "../../Assets/orange-star.png";

export default class AbsorbEffect extends Effect {
  constructor(params) {
    super(params);
    this.init(params);
    // let sound = new Audio("Assets/Explosion58.wav");
    // sound.play();
  }

  static get IMAGES() { return IMAGES; }

  static drawOrb(context, orb) {
    context.drawImage(orb.image, orb.position.x - 13, orb.position.y - 13, 26, 26);
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
        color: params.brick.color,
        image: IMAGES[params.brick.color],
        rotation: 0,
        spin: 0.5
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
      orb.speed += (elapsedTime / 50) * orb.acceleration;
      let direction = this.normalizeDirection({
        x: this.ball.position.x - orb.position.x,
        y: this.ball.position.y - orb.position.y
      });
      orb.direction = this.normalizeDirection({
        x: orb.direction.x + (direction.x - orb.direction.x) / (Math.min(1, this.currentTime / TURN_TIME)),
        y: orb.direction.y + (direction.y - orb.direction.y) / (Math.min(1, this.currentTime / TURN_TIME))
      });

      if (this.ball.boundingBox.intersects(orb.position)) {
        // let sound = new Audio("Assets/absorb.wav");
        // sound.play();
        this.ball.addSpark(orb.color);
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
