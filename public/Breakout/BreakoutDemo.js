import Brick from "./Brick.js"

export default class BreakoutDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.bricks = [];
    
    this.gameSettings = {
      buffer: 100,
      brickHeight: 12,
      brickWidth: (this.canvas.width - (14 * 4) - 2) / 14,
      brickColors: ["lawnGreen", "aqua", "orange", "yellow"],
      brickLineWidth: 2,
      brickShadowBlur: 15,
      ballSpeed: 0.25,
      ballSpeedIncrease: 0.15,
      ballSpeedIntervals: [4, 12, 36, 62],
      ballSize: 6,
      comboThreshold: 300,
      // Value by row
      brickValues: {
        0: 50,
        1: 50,
        2: 30,
        3: 30,
        4: 20,
        5: 20,
        6: 10,
        7: 10
      }
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
        rotate: _.random(-1, 1, true),
        speed: _.random(0.1, 0.5, true),
        rotation: _.random(0, 90),
        color: _.sample(this.gameSettings.brickColors),
        demo: true
      }));
    }

    requestAnimationFrame((currentTime) => this.loop(currentTime));
  }

  update(elapsedTime) {
    for (const brick of this.bricks) {
      if (brick.position.y > this.canvas.height + brick.width) {
        brick.position.y = -brick.width;
      }
      brick.position.y += elapsedTime * brick.speed;
      brick.rotation += (elapsedTime / 50) * brick.rotate;
    }
  }

  render(elapsedTime) {
    this.context.save();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (const brick of this.bricks) {
      brick.render(this.context);
    }

    this.context.restore();
  }
  
  loop(currentTime) {
    if (this.done) {
      return;
    }

    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
  
    this.update(elapsedTime);
    this.render(elapsedTime);
  
    requestAnimationFrame((currentTime) => this.loop(currentTime));
  }
}
