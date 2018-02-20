import KEY_CODE from "../util/keyCodes.js"
import Ball from "./Ball.js"
import Brick from "./Brick.js"
import Paddle from "./Paddle.js"
import FloatingText from "../Graphics/FloatingText.js"

const EVENT = {
  PAUSE: "pause"
};

export default class Breakout {
  constructor(params) {
    params.rows = 8;
    params.columns = 14;

    this.canvas = params.canvas;
    this.context = this.canvas.getContext("2d");
    this.pauseMenu = document.getElementById("pause-menu");

    this.gameSettings = {
      buffer: 100,
      brickHeight: 12,
      brickWidth: (this.canvas.width - (params.columns * 4) - 2) / params.columns,
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
    this.events = [];
    this.gameState = {
      bricks: new Array(params.rows),
      paddle: null,
      balls: [],
      scores: [],
      combo: 0,
      score: 0,
      countdown: 3000,
      bricksDestroyed: 0,
      brokeThrough: false
    };
    this.initialize({
      rows: params.rows,
      columns: params.columns
    });

    this.keyBindings = {
      [KEY_CODE.ESCAPE]: EVENT.PAUSE
    };

    this.eventHandlers = {};
    this.eventHandlers[EVENT.PAUSE] = () => {
      this.pause();
    };

    this.mouseMoveListener = (event) => {
      this.handleMouseMove(event);
    };
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

    if (this.gameState.countdown > 0) {
      Graphics.Text.draw(this.context, {
        fillStyle: "magenta",
        font: "120px Trebuchet MS",
        text: Math.ceil(this.gameState.countdown / 1000).toFixed(),
        textAlign: "center",
        position: {
          x: this.canvas.width / 2,
          y: this.canvas.height / 2
        }
      });
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
      this.gameState.bricksDestroyed += 1;

      // TODO: make this better
      if (result.brick.row === 0 && !this.gameState.brokeThrough) {
        this.gameState.brokeThrough = true;
        this.gameState.paddle.width /= 2;
      }

      if (this.gameSettings.ballSpeedIntervals.includes(this.gameState.bricksDestroyed)) {
        for (const ball of this.gameState.balls) {
          ball.speed += this.gameSettings.ballSpeedIncrease;
        }
      }

      // let sound = new Audio("Assets/Explosion16.wav");
      // sound.play();
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
      // let sound = new Audio("Assets/Blip_Select5.wav");
      // sound.play();
    }
  }

  update(elapsedTime) {
    if (this.gameState.countdown > 0) {
      this.gameState.countdown -= elapsedTime;
      return; // no need to do anything else
    }

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
    let event = this.keyBindings[e.keyCode];
    if (event) {
      this.events.push(event);
    }
  }

  processInput() {
    while (this.events.length > 0) {
      let event = this.events.shift();
      if (this.eventHandlers[event]) {
        this.eventHandlers[event](event);
      }
    }
  }

  handleMouseMove(event) {
    // e.mozMovementX ||
    // e.webkitMovementX ||
    // 0;

    // TRICKY: this awful bug: http://www.html5gamedevs.com/topic/34516-pointer-lock-bug-on-chrome-with-windows-10/
    if (Math.sign(event.movementX) !== Math.sign(this.lastMovement)) {
      this.lastMovement = event.movementX;
      return;
    }

    // TODO: put in paddle update function
    let x = this.gameState.paddle.position.x + event.movementX;
    this.gameState.paddle.position.x = x;
    if (this.gameState.paddle.position.x + this.gameState.paddle.width > this.canvas.width) {
      this.gameState.paddle.position.x = this.canvas.width - this.gameState.paddle.width;
    } else if (this.gameState.paddle.position.x < 0) {
      this.gameState.paddle.position.x = 0;
    }
    
    
    //this.gameState.paddle.position.x =  Math.min(Math.max(x, 0), this.canvas.width - this.gameState.paddle.width);
  }

  gameLoop(currentTime) {
    if (this.done || this.paused) {
      return;
    }

    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
  
    this.processInput();
    this.update(elapsedTime);
    this.render(elapsedTime);
  
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
  }

  handleMouseDown(event) {
    this.canvas.requestPointerLock();
  }

  pointerLockChangeAlert() {
    if (document.pointerLockElement === this.canvas ||
      document.mozPointerLockElement === this.canvas) {
      this.canvas.addEventListener("mousemove", this.mouseMoveListener);
    } else {
      this.eventHandlers[EVENT.PAUSE]();
      this.canvas.removeEventListener("mousemove", this.mouseMoveListener);
    }
  }

  // TODO: put this outside?
  pause() {
    this.paused = true;
    this.pauseMenu.style.display = "flex";
  }

  resume() {
    this.pauseMenu.style.display = "none";
    this.paused = false;
    this.previousTime = performance.now();
    this.canvas.requestPointerLock();
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
  }

  start() {
    this.canvas.addEventListener("mousedown", (event) => this.handleMouseDown(event));
    document.addEventListener("pointerlockchange", () => this.pointerLockChangeAlert(), false);
    document.addEventListener("mozpointerlockchange", () => this.pointerLockChangeAlert(), false);

    this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
    this.canvas.requestPointerLock();

    this.previousTime = performance.now();
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));

    // TODO: don't do these until countdown is over?
    document.addEventListener("keyup", (event) => this.handleKeyEvent(event));
    
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
