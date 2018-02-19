import KEY_CODE from "../util/keyCodes.js"
import Ball from "./Ball.js"
import Brick from "./Brick.js"
import Paddle from "./Paddle.js"
import FloatingText from "../Graphics/FloatingText.js"

export default class Breakout {
  constructor(params) {
    params = {
      rows: 8,
      columns: 14
    };

    this.canvas = document.getElementById("canvas-main");
    this.context = this.canvas.getContext("2d");

    this.gameSettings = {
      buffer: 100,
      brickHeight: 12,
      brickWidth: (this.canvas.width - (params.columns * 4) - 2) / params.columns,
      brickColors: ["lawnGreen", "aqua", "orange", "yellow"],
      brickLineWidth: 2,
      brickShadowBlur: 15,
      ballSpeed: 0.5,
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
    this.gameState = {
      bricks: new Array(params.rows),
      paddle: null,
      balls: [],
      scores: [],
      combo: 0,
      score: 0
    };
    this.initialize({
      rows: params.rows,
      columns: params.columns
    });
    this.start();
  }

  initialize(params) {
    for (let row = 0; row < params.rows; row++) {
      this.gameState.bricks[row] = new Array(params.columns);
      this.gameState.bricks[row].fill(null);
      this.gameState.bricks[row] = this.gameState.bricks[row].map((val, column) => {
        return new Brick({
          row: row,
          column: column,
          canvas: this.canvas,
          gameSettings: this.gameSettings,
          color: this.gameSettings.brickColors[Math.floor(row / 2)],
          value: this.gameSettings.brickValues[row]
        });
      });
    }

    this.gameState.paddle = new Paddle({
      gameSettings: this.gameSettings,
      canvas: this.canvas
    });

    this.gameState.balls.push(new Ball({
      gameSettings: this.gameSettings,
      color: this.gameState.paddle.color,
      canvas: this.canvas
    }));
  }

  render() {
    this.context.save();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (const row of this.gameState.bricks) {
      for (const brick of row) {
        brick.render(this.context);
      }
    }

    this.gameState.paddle.render(this.context);

    for (const ball of this.gameState.balls) {
      ball.render(this.context);
    }

    for (const score of this.gameState.scores) {
      score.render(this.context);
    }

    this.context.restore();
  }

  updateBall(elapsedTime, ball) {
    let result = ball.update(elapsedTime, this.gameState.bricks, this.gameState.paddle);
      
    // TODO: fix this shameless hack
    if (result && result.brick) {
      // Make sure text doesn't render out of bounds
      this.gameState.score += result.brick.value;
      this.gameState.combo += result.brick.value;
      // let start = {
      //   x: Math.min(Math.max(ball.position.x, 10), this.canvas.width - 10),
      //   y: ball.position.y
      // };
      // this.gameState.scores.push(new FloatingText({
      //   fillStyle: result.brick.color,
      //   duration: 1000,
      //   text: result.brick.value,
      //   start: start,
      //   end: { x: start.x, y: start.y - 100 },
      //   fade: true
      // }));
    } else if (result && result.paddle) {
      if (this.gameState.combo >= this.gameSettings.comboThreshold) {
        let start = {
          x: this.canvas.width / 2,
          y: this.canvas.height - 150
        };
        
        this.gameState.scores.push(new FloatingText({
          fillStyle: "magenta",
          duration: 2000,
          fade: true,
          font: "60px Trebuchet MS",
          text: this.gameState.combo + " POINT COMBO",
          start: start,
          end: { x: start.x, y: start.y - 100 }
        }));
      }

      this.gameState.combo = 0;
    }
  }

  update(elapsedTime) {
    this.gameState.scores = this.gameState.scores.filter((score) => !score.done);
    for (const score of this.gameState.scores) {
      score.update(elapsedTime);
    }

    for (const row of this.gameState.bricks) {
      for (const brick of row) {
        brick.update(elapsedTime);
      }
    }

    for (const ball of this.gameState.balls) {
      this.updateBall(elapsedTime, ball);
    }
  }
    
  handleKeyEvent(e) {
    // let event = this.keyBindings[e.keyCode];
    // if (event) {
    //   this.events.push(event);
    // }
  }

  processInput() {
    // while (this.events.length > 0) {
    //   let event = this.events.shift();
    //   if ((!this.done || event === EVENTS.QUIT) && this.eventHandlers[event]) {
    //     this.eventHandlers[event](event);
    //   }
    // }
  }

  handleMouseMove(event) {
    let rect = this.canvas.getBoundingClientRect();
    let pos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // TODO: put in update function
    this.gameState.paddle.position.x =  Math.min(Math.max(pos.x, 0), this.canvas.width - this.gameState.paddle.width);
  }

  gameLoop(currentTime) {
    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
  
    this.processInput();
    this.update(elapsedTime);
    this.render(elapsedTime);
  
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
  }

  start() {
    this.previousTime = performance.now();
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
    document.addEventListener("keydown", (event) => this.handleKeyEvent(event));
    this.canvas.addEventListener("mousemove", (event) => this.handleMouseMove(event));
  }
}
