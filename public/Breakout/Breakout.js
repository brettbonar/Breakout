import KEY_CODE from "../util/keyCodes.js"
import Background from "./Background.js"
import Ball from "./Ball.js"
import Brick from "./Brick.js"
import Paddle from "./Paddle.js"
import Text from "../Graphics/Text.js"
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

    let scale = this.canvas.width / 1000; 
    let bottomBuffer = 10 * scale;
    let uiAreaSize = 30 * scale;
    let playArea = {
      topBuffer: 0,
      bottomBuffer: bottomBuffer,
      top: {
        x: 0,
        y: uiAreaSize,
      },
      bottom: {
        x: 0,
        y: this.canvas.height - uiAreaSize - bottomBuffer
      },
      center: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      },
      width: this.canvas.width,
      height: this.canvas.height - uiAreaSize * scale - bottomBuffer
    };
   
    let brickLineWidth = 2 * scale;
    this.gameSettings = {
      uiAreaSize: uiAreaSize,
      playArea: playArea,
      rows: params.rows,
      columns: params.columns,
      scale: scale,
      buffer: 100 * scale,
      brickHeight: 12 * scale,
      brickWidth: (playArea.width - (params.columns * (brickLineWidth * 2))) / params.columns,
      // 2x brick width by default
      paddleWidth: 120 * scale,
      brickColors: ["lawnGreen", "aqua", "orange", "yellow"],
      brickLineWidth: brickLineWidth,
      brickShadowBlur: 15 * scale,
      ballSpeed: 0.25 * scale,
      ballSpeedIncrease: 0.10 * scale,
      ballSpeedIntervals: [4, 12, 36, 62],
      ballSize: 6 * scale,
      newBallInterval: 100,
      comboThreshold: 30,
      maxCombo: 0,
      // Value by row
      brickValues: {
        0: 5,
        1: 5,
        2: 3,
        3: 3,
        4: 2,
        5: 2,
        6: 1,
        7: 1
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
      paddleBricksDestroyed: 0,
      brokeThrough: false,
      intervalCounter: 0,
      // TODO: make this better
      clearedRows: [],
      paddlesLeft: 3,
      background: new Background(this.canvas, this.gameSettings)
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
    this.keyEventListener = (event) => {
      this.handleKeyEvent(event);
    };
    this.mouseDownListener = (event) => {
      this.handleMouseDown(event);
    };
    this.pointerLockListener = (event) => {
      this.pointerLockChangeAlert(event);
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
      width: this.gameSettings.paddleWidth,
      canvas: this.canvas
    });

    this.gameState.balls.push(new Ball({
      gameSettings: this.gameSettings,
      position: {
        x: this.gameSettings.playArea.center.x,
        y: this.gameSettings.playArea.bottom.y - this.gameSettings.brickHeight - this.gameSettings.ballSize
      },
      color: this.gameState.paddle.color,
      canvas: this.canvas
    }));
  }

  drawPaddlesLeft() {
    for (let i = 0; i < this.gameState.paddlesLeft; i++) {
      Paddle.draw(this.context, {
        //color: this.gameState.paddle.color,
        color: "magenta",
        shadowBlur: this.gameSettings.brickShadowBlur,
        width: this.gameSettings.paddleWidth,
        height: this.gameSettings.brickHeight,
        position: {
          x: 10 * this.gameSettings.scale + i * (this.gameSettings.paddleWidth + 15),
          y: this.gameSettings.uiAreaSize / 2 - this.gameSettings.brickHeight / 2
        }
      });
    }
  }

  drawScore() {
    Text.draw(this.context, {
      text: "Score: " + this.gameState.score,
      fillStyle: "magenta",
      strokeStyle: "white",
      font: "40px Trebuchet MS",
      position: {
        x: 10 * this.gameSettings.scale,
        y: this.canvas.height - 10 * this.gameSettings.scale
      }
    });
    
    Text.draw(this.context, {
      text: "Combo: " + this.gameState.combo,
      fillStyle: "magenta",
      strokeStyle: "white",
      font: "40px Trebuchet MS",
      position: {
        x: 130 * this.gameSettings.scale,
        y: this.canvas.height - 10 * this.gameSettings.scale
      }
    });
    
    Text.draw(this.context, {
      text: "Bricks Destroyed: " + this.gameState.bricksDestroyed,
      fillStyle: "magenta",
      strokeStyle: "white",
      font: "40px Trebuchet MS",
      position: {
        x: 250 * this.gameSettings.scale,
        y: this.canvas.height - 10 * this.gameSettings.scale
      }
    });
  }

  render() {
    this.context.save();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPaddlesLeft();
    this.drawScore();

    // Clip canvas for remaining rendering
    this.context.beginPath(); 
    this.context.rect(this.gameSettings.playArea.top.x, this.gameSettings.playArea.top.y,
      this.gameSettings.playArea.width, this.gameSettings.playArea.height + this.gameSettings.playArea.bottomBuffer);
    this.context.clip();
    
    this.context.fillStyle = "black";
    // this.context.fillRect(this.gameSettings.playArea.top.x, this.gameSettings.playArea.top.y,
    //   this.gameSettings.playArea.width, this.gameSettings.playArea.height + this.gameSettings.playArea.bottomBuffer);
    
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
      Text.draw(this.context, {
        fillStyle: "magenta",
        strokeStyle: "white",
        font: "240px Trebuchet MS",
        text: Math.ceil(this.gameState.countdown / 1000).toFixed(),
        textAlign: "center",
        position: this.gameSettings.playArea.center
      });
    }

    this.gameState.background.render();

    this.context.restore();
  }

  updateBall(elapsedTime, ball) {
    let result = ball.update(elapsedTime, this.gameState.bricks, this.gameState.paddle);
      
    // TODO: fix this shameless hack
    if (result && result.brick) {
      // Make sure text doesn't render out of bounds
      this.gameState.score += result.brick.value;
      this.gameState.combo += result.brick.value;
      this.gameState.intervalCounter += result.brick.value;
      this.gameState.bricksDestroyed += 1;
      this.gameState.paddleBricksDestroyed += 1;

      // TODO: make this better
      if (result.brick.row === 0 && !this.gameState.brokeThrough) {
        this.gameState.brokeThrough = true;
        this.gameState.paddle.width /= 2;
      }

      if (this.gameSettings.ballSpeedIntervals.includes(this.gameState.paddleBricksDestroyed)) {
        for (const ball of this.gameState.balls) {
          ball.speed += this.gameSettings.ballSpeedIncrease;
        }
      }

      if (!this.gameState.clearedRows.includes(result.brick.row)) {
        let cleared = this.gameState.bricks[result.brick.row].every((brick) => {
          return brick.destroyed;
        });
        if (cleared) {
          this.gameState.clearedRows.push(result.brick.row);
          this.gameState.score += 25;
          this.gameState.combo += 25;
          this.gameState.intervalCounter += 25;
          if (this.gameState.clearedRows.length === this.gameSettings.rows) {
            this.done = true;
            this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);
          }
        }
      }

      while (this.gameState.intervalCounter >= this.gameSettings.newBallInterval) {
        this.gameState.intervalCounter -= this.gameSettings.newBallInterval;
        this.gameState.balls.push(
          new Ball({
            gameSettings: this.gameSettings,
            position: {
              x: this.gameState.paddle.center.x,
              y: this.gameSettings.playArea.bottom.y - this.gameSettings.brickHeight - this.gameSettings.ballSize
            },
            color: this.gameState.paddle.color,
            speed: this.gameState.balls[0].speed,
            canvas: this.canvas
        }));
      }

      // let sound = new Audio("Assets/Explosion16.wav");
      // sound.play();
      // let start = {
      //   x: Math.min(Math.max(ball.position.x, 10), this.gameSettings.playArea.width - 10),
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
          x: this.gameSettings.playArea.center.x,
          y: this.gameSettings.playArea.bottom.y - 150 * this.gameSettings.scale
        };
        
        this.gameState.scores.push(new FloatingText({
          fillStyle: "magenta",
          duration: 2000,
          fade: true,
          font: "60px Trebuchet MS",
          text: this.gameState.combo + " POINT COMBO",
          start: start,
          end: { x: start.x, y: start.y - 100 * this.gameSettings.scale }
        }));
      }

      this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);
      this.gameState.combo = 0;
      // let sound = new Audio("Assets/Blip_Select5.wav");
      // sound.play();
    } else if (ball.dead) {
      _.remove(this.gameState.balls, ball);

      if (this.gameState.balls.length === 0) {
        this.gameState.paddlesLeft -= 1;
        if (this.gameState.paddlesLeft < 0) {
          this.done = true;
        } else {
          // Start a new ball
          this.gameState.countdown = 3000;
          this.gameState.paddleBricksDestroyed = 0;
          this.gameState.paddle.width = this.gameSettings.paddleWidth;
          this.gameState.brokeThrough = false;
          this.gameState.combo = 0;
          this.gameState.balls.push(new Ball({
            gameSettings: this.gameSettings,
            position: {
              x: this.gameSettings.playArea.center.x,
              y: this.gameSettings.playArea.bottom.y - this.gameSettings.brickHeight - this.gameSettings.ballSize
            },
            color: this.gameState.paddle.color,
            canvas: this.canvas
          }));
        }
      }
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
    
    if (this.gameState.countdown > 0) {
      this.gameState.countdown -= elapsedTime;
      // TODO: put this anywhere else
      for (const ball of this.gameState.balls) {
        ball.position.x = this.gameState.paddle.center.x;
      }
    } else {
      for (const ball of this.gameState.balls) {
        this.updateBall(elapsedTime, ball);
      }
    }

    this.gameState.background.update(elapsedTime);
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
    let x = this.gameState.paddle.position.x + event.movementX * this.gameSettings.scale;
    this.gameState.paddle.position.x = x;
    if (this.gameState.paddle.position.x + this.gameState.paddle.width > this.gameSettings.playArea.width) {
      this.gameState.paddle.position.x = this.gameSettings.playArea.width - this.gameState.paddle.width;
    } else if (this.gameState.paddle.position.x < 0) {
      this.gameState.paddle.position.x = 0;
    }
    
    
    //this.gameState.paddle.position.x =  Math.min(Math.max(x, 0), this.gameSettings.playArea.width - this.gameState.paddle.width);
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

  quit() {
    this.canvas.removeEventListener("mousemove", this.mouseMoveListener);
    this.canvas.removeEventListener("keyup", this.keyEventListener);
    this.canvas.removeEventListener("mousedown", this.mouseDownListener);
    document.removeEventListener("pointerlockchange", this.pointerLockListener, false);
    document.removeEventListener("mozpointerlockchange", this.pointerLockListener, false);
  }

  // TODO: put this outside?
  pause() {
    this.paused = true;
    this.pauseMenu.style.display = "flex";
    this.canvas.style.cursor = "default";
  }

  resume() {
    this.pauseMenu.style.display = "none";
    this.canvas.style.cursor = "none";
    this.paused = false;
    this.previousTime = performance.now();
    this.canvas.requestPointerLock();
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
  }

  start() {
    document.addEventListener("pointerlockchange", this.pointerLockListener, false);
    document.addEventListener("mozpointerlockchange", this.pointerLockListener, false);
    this.canvas.addEventListener("keyup", this.keyEventListener);
    this.canvas.addEventListener("mousedown", this.mouseDownListener);

    this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
    this.canvas.requestPointerLock();

    this.previousTime = performance.now();
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
    
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
