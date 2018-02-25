import Brick from "./Objects/Brick.js"
import Game from "../Engine/Game.js"
import PhysicsEngine from "../Engine/Physics/PhysicsEngine.js"
import FlatRenderingEngine from "../Engine/Rendering/FlatRenderingEngine.js"

export default class BreakoutDemo extends Game {
  constructor(params) {
    super(params);
    this.bricks = [];
    this.physicsEngine = new PhysicsEngine();
    this.renderingEngine = new FlatRenderingEngine({
      context: this.context
    });
    
    let scale = this.canvas.width / 1000;
    this.gameSettings = {
      brickHeight: 12 * scale,
      brickWidth: (this.canvas.width - (14 * 4) - 2) / 14,
      brickColors: ["lawnGreen", "aqua", "orange", "yellow"],
      brickLineWidth: 2 * scale,
      brickShadowBlur: 15 * scale
    };
    this.previousTime = performance.now();

    for (let i = 0; i < 8 * 14; i++) {
      this.bricks.push(new Brick({
        canvas: this.canvas,
        gameSettings: this.gameSettings,
        position: {
          x: _.random(this.canvas.width),
          y: _.random(this.canvas.height)
        },
        direction: {
          x: 0,
          y: 1
        },
        spin: _.random(-1, 1, true),
        speed: _.random(0.1, 0.3, true) * scale,
        rotation: _.random(0, 90),
        color: _.sample(this.gameSettings.brickColors),
        demo: true
      }));
    }
  }

  update(elapsedTime) {
    this.physicsEngine.update(elapsedTime, this.bricks);
    for (const brick of this.bricks) {
      if (brick.position.y > this.canvas.height + brick.width) {
        brick.position.y = -brick.width;
      }
    }
  }

  render(elapsedTime) {
    this.context.save();

    // TODO: figure out how to do background
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderingEngine.render(this.bricks, elapsedTime);

    this.context.restore();
  }
}
