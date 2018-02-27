import KEY_CODE from "../util/keyCodes.js"
import Game from "../Engine/Game.js"
import GameObject from "../Engine/GameObject/GameObject.js"
import Bounds from "../Engine/GameObject/Bounds.js"
import Background from "./Background.js"
import Ball from "./Objects/Ball.js"
import Brick from "./Objects/Brick.js"
import Paddle from "./Objects/Paddle.js"
import Text from "../Graphics/Text.js"
import FloatingText from "../Graphics/FloatingText.js"
import PhysicsEngine from "../Engine/Physics/PhysicsEngine.js"
import FlatRenderingEngine from "../Engine/Rendering/FlatRenderingEngine.js"
import ParticleEngine from "../Engine/Effects/ParticleEngine.js"
import { MOVEMENT_TYPE } from "../Engine/Physics/PhysicsConstants.js";
import BrickDestroyedEffect from "./Effects/BrickDestroyedEffect.js";
import GameOverEffect from "./Effects/GameOverEffect.js";

export default class Breakout extends Game {
  constructor(params) {
    super(Object.assign(params, { requestPointerLock: true }));
    this.physicsEngine = new PhysicsEngine();
    this.renderingEngine = new FlatRenderingEngine({
      context: this.context
    });
    this.particleEngine = new ParticleEngine({
      context: this.context
    });
    this.menus = params.menus;

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

    playArea.bounds = {
      ul: playArea.top,
      ur: {
        x: playArea.top.x + playArea.width,
        y: playArea.top.y
      },
      lr: {
        x: playArea.bottom.x + playArea.width,
        y: playArea.bottom.y
      },
      ll: playArea.bottom
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
      numPaddles: 3,
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
      paddlesLeft: [],
      walls: []
      //background: new Background(this.canvas, this.gameSettings)
    };
    
    this.initialize({
      rows: params.rows,
      columns: params.columns
    });

    this.keyBindings[KEY_CODE.ESCAPE] = Game.EVENT.PAUSE;

    // this.eventHandlers = {};
    // this.eventHandlers[EVENT.PAUSE] = () => {
    //   this.pause();
    // };
    this.addEventHandler(Game.EVENT.PAUSE, () => this.pause());

    this.stateFunctions[Game.STATE.PLAYING].update = (elapsedTime) => this._update(elapsedTime);
    this.stateFunctions[Game.STATE.PLAYING].render = (elapsedTime) => this._render(elapsedTime);

    this.stateFunctions[Game.STATE.PAUSED].update = _.noop;//(elapsedTime) => this._update(elapsedTime);
    this.stateFunctions[Game.STATE.PAUSED].render = _.noop;//(elapsedTime) => this._render(elapsedTime);
    this.stateFunctions[Game.STATE.DONE].processInput = _.noop;
    this.stateFunctions[Game.STATE.DONE].update = (elapsedTime) => this._update(elapsedTime);
    this.stateFunctions[Game.STATE.DONE].render = (elapsedTime) => this._render(elapsedTime);
    this.stateFunctions[Game.STATE.GAME_OVER].processInput = _.noop;
    this.stateFunctions[Game.STATE.GAME_OVER].update = (elapsedTime) => this.updateGameOver(elapsedTime);
    this.stateFunctions[Game.STATE.GAME_OVER].render = (elapsedTime) => this.renderGameOver(elapsedTime);
    this.stateFunctions[Game.STATE.INITIALIZING].update = _.noop;//(elapsedTime) => this._update(elapsedTime);
    this.stateFunctions[Game.STATE.INITIALIZING].render = _.noop;//(elapsedTime) => this._render(elapsedTime);
  }

  createBall(params) {
    this.gameState.balls.push(new Ball(Object.assign({
      gameSettings: this.gameSettings,
      color: this.gameState.paddle.color,
      canvas: this.canvas,
      dimensions: {
        radius: this.gameSettings.ballSize
      },
      speed: this.gameSettings.ballSpeed,
      direction: {
        x: _.random(-0.5, 0.5, true),
        y: -1
      }
    }, params)));
  }

  quit() {
    super.quit();
    this.menus.transition("MAIN");
  }

  // TODO: put this outside?
  pause() {
    this.menus.transition("PAUSE");
    //this.pauseMenu.style.display = "flex";
    this.canvas.style.cursor = "default";
    this.transitionState(Game.STATE.PAUSED);
  }

  resume() {
    // this.pauseMenu.style.display = "none";
    // this.canvas.style.cursor = "none";
    this.menus.hideAll();
    this.previousTime = performance.now();
    this.canvas.requestPointerLock();
    this.transitionState(Game.STATE.PLAYING);
  }

  initialize(params) {
    let col = 1;
    for (let row = 0; row < params.rows; row++) {
      this.gameState.bricks[row] = new Array(params.columns);
      this.gameState.bricks[row].fill(null);
      // this.gameState.bricks[row] = [
      //   new Brick({
      //     row: row,
      //     column: col += 2,
      //     canvas: this.canvas,
      //     static: true,
      //     gameSettings: this.gameSettings,
      //     color: this.gameSettings.brickColors[Math.floor(row / 2)],
      //     value: this.gameSettings.brickValues[row]
      //   })];
      this.gameState.bricks[row] = this.gameState.bricks[row].map((val, column) => {
        return new Brick({
          row: row,
          column: column,
          canvas: this.canvas,
          static: true,
          gameSettings: this.gameSettings,
          color: this.gameSettings.brickColors[Math.floor(row / 2)],
          value: this.gameSettings.brickValues[row]
        });
      });
    }
    
    // Add number of paddles left
    for (let i = 0; i < this.gameSettings.numPaddles; i++) {
      this.gameState.paddlesLeft.push(new Paddle({        
        shadowBlur: this.gameSettings.brickShadowBlur,
        dimensions: {
          width: this.gameSettings.paddleWidth,
          height: this.gameSettings.brickHeight
        },
        position: {
          x: 10 * this.gameSettings.scale + i * (this.gameSettings.paddleWidth + 15),
          y: this.gameSettings.uiAreaSize / 2 - this.gameSettings.brickHeight / 2
        },
        color: "magenta"
      }));
    }

    this.gameState.paddle = new Paddle({
      shadowBlur: this.gameSettings.brickShadowBlur,
      dimensions: {
        width: this.gameSettings.paddleWidth,
        height: this.gameSettings.brickHeight
      },
      position: {
        x: this.gameSettings.playArea.center.x,
        y: this.gameSettings.playArea.bottom.y - this.gameSettings.brickHeight
      },
      color: this.gameSettings.brickColors[this.gameSettings.brickColors.length - 1]
    });

    this.createBall({
      position: {
        x: this.gameSettings.playArea.center.x,
        y: this.gameSettings.playArea.bottom.y - this.gameSettings.brickHeight - this.gameSettings.ballSize
      }
    });

    // Add walls
    // Left:
    this.gameState.walls.push(new GameObject({
      position: {
        x: this.gameSettings.playArea.top.x,
        y: this.gameSettings.playArea.center.y
      },
      dimensions: {
        line: [this.gameSettings.playArea.bounds.ul, this.gameSettings.playArea.bounds.ll]
      },
      boundsType: Bounds.TYPE.LINE,
      physics: {
        movementType: MOVEMENT_TYPE.FIXED
      }
    }));
    // Right:
    this.gameState.walls.push(new GameObject({
      position: {
        x: this.gameSettings.playArea.top.x + this.gameSettings.playArea.width,
        y: this.gameSettings.playArea.center.y
      },
      dimensions: {
        line: [this.gameSettings.playArea.bounds.ur, this.gameSettings.playArea.bounds.lr]
      },
      boundsType: Bounds.TYPE.LINE,
      physics: {
        movementType: MOVEMENT_TYPE.FIXED
      }
    }));
    // Top:
    this.gameState.walls.push(new GameObject({
      position: {
        x: this.gameSettings.playArea.center.x,
        y: this.gameSettings.playArea.top.y
      },
      dimensions: {
        line: [this.gameSettings.playArea.bounds.ul, this.gameSettings.playArea.bounds.ur]
      },
      boundsType: Bounds.TYPE.LINE,
      physics: {
        movementType: MOVEMENT_TYPE.FIXED
      }
    }));
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

  destroyBrick(brick, ball) {
    for (const row of this.gameState.bricks) {
      if (row.includes(brick)) {
        _.remove(row, brick);
        this.particleEngine.addEffect(new BrickDestroyedEffect({
          gameSettings: this.gameSettings,
          brick: brick,
          ball: ball,
          duration: 5000
        }));
        ball.setColor(brick.color);
      
        // Make sure text doesn't render out of bounds
        this.gameState.score += brick.value;
        this.gameState.combo += brick.value;
        this.gameState.intervalCounter += brick.value;
        this.gameState.bricksDestroyed += 1;
        this.gameState.paddleBricksDestroyed += 1;
  
        // TODO: make this better
        if (brick.row === 0 && !this.gameState.brokeThrough) {
          this.gameState.brokeThrough = true;
          this.gameState.paddle.dimensions.width /= 2;
        }
  
        if (this.gameSettings.ballSpeedIntervals.includes(this.gameState.paddleBricksDestroyed)) {
          for (const ball of this.gameState.balls) {
            ball.speed += this.gameSettings.ballSpeedIncrease;
          }
        }
  
        if (!this.gameState.clearedRows.includes(brick.row)) {
          if (row.length === 0) {
            this.gameState.clearedRows.push(brick.row);
            this.gameState.score += 25;
            this.gameState.combo += 25;
            this.gameState.intervalCounter += 25;
            if (this.gameState.clearedRows.length === this.gameSettings.rows) {
              this.win();
              this.gameState.maxCombo = Math.max(this.gameState.maxCombo, this.gameState.combo);
            }
          }
        }
        
        while (this.gameState.intervalCounter >= this.gameSettings.newBallInterval) {
          this.gameState.intervalCounter -= this.gameSettings.newBallInterval;
          this.createBall({
            position: {
              x: this.gameState.paddle.center.x,
              y: this.gameSettings.playArea.bottom.y - this.gameSettings.brickHeight - this.gameSettings.ballSize
            },
            speed: this.gameState.balls[0].speed
          })
        }
  
        // let sound = new Audio("Assets/Explosion16.wav");
        // sound.play();
        // let start = {
        //   x: Math.min(Math.max(ball.position.x, 10), this.gameSettings.playArea.width - 10),
        //   y: ball.position.y
        // };
        // this.gameState.scores.push(new FloatingText({
        //   fillStyle: brick.color,
        //   duration: 1000,
        //   text: brick.value,
        //   start: start,
        //   end: { x: start.x, y: start.y - 100 },
        //   fade: true
        // }));

      }
    }
  }

  hitPaddle(paddle, ball) {
    paddle.setColor(ball.color);

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
  }

  gameOver() {
    super.quit();
    this.transitionState(Game.STATE.GAME_OVER);
    this.currentTime = 0;
    this.particleEngine.effects.length = 0;
    this.particleEngine.addEffect(new GameOverEffect({
      canvas: this.canvas,
      context: this.context,
      gameSettings: this.gameSettings,
      duration: 5000
    }));
  }

  killBall(ball) {
    _.remove(this.gameState.balls, ball);

    if (this.gameState.balls.length === 0) {
      if (this.gameState.paddlesLeft.length === 0) {
        this.gameOver();
      } else {
        this.gameState.paddlesLeft.pop();
        // Start a new ball
        this.gameState.countdown = 3000;
        this.gameState.paddleBricksDestroyed = 0;
        this.gameState.paddle.dimensions.width = this.gameSettings.paddleWidth;
        this.gameState.brokeThrough = false;
        this.gameState.combo = 0;
        
        this.createBall({
          position: {
            x: this.gameState.paddle.center.x,
            y: this.gameSettings.playArea.bottom.y - this.gameSettings.brickHeight - this.gameSettings.ballSize
          }
        });
      }
    }
    this.gameOver();
  }

  win() {
    super.quit();
    this.transitionState(Game.STATE.DONE);
    this.menus.transition("RETRY");
  }

  handleCollisions(collisions) {
    for (const collision of collisions) {
      if (collision.target === this.gameState.paddle) {
        this.hitPaddle(collision.target, collision.source);
      } else if (collision.target instanceof Brick) {
        this.destroyBrick(collision.target, collision.source);
      }
    }

    if (this.state !== Game.STATE.DONE) {
      for (const ball of this.gameState.balls) {
        if (ball.position.y - ball.radius > this.gameSettings.playArea.bottom.y + this.gameSettings.playArea.bottomBuffer) {
          this.killBall(ball);
        }
      }
    }
  }

  handleMouseMove(event) {
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

  getUIRenderObjects() {
    return this.gameState.paddlesLeft;
  }

  getPlayRenderObjects() {
    let objs = [];
    for (const row of this.gameState.bricks) {
      objs = objs.concat(row);
    }
    return objs.concat(this.gameState.balls).concat([this.gameState.paddle]);
  }

  getPhysicsObjects() {
    let objs = [];
    for (const row of this.gameState.bricks) {
      objs = objs.concat(row);
    }
    return objs.concat(this.gameState.balls).concat([this.gameState.paddle]).concat(this.gameState.walls);
  }

  updateGameOver(elapsedTime) {
    this.particleEngine.update(elapsedTime);
  }

  renderGameOver(elapsedTime) {
    this.currentTime += elapsedTime;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    Text.draw(this.context, {
      fillStyle: "magenta",
      strokeStyle: "white",
      font: "240px Trebuchet MS",
      text: "GAME OVER",
      textAlign: "center",
      position: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2
      }
    });
    Text.draw(this.context, {
      text: "Score: " + this.gameState.score,
      fillStyle: "magenta",
      strokeStyle: "white",
      font: "60px Trebuchet MS",
      textAlign: "center",
      position: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2 + this.context.measureText("m").width / 2
      }
    });
    this.particleEngine.render(elapsedTime);
    if (this.currentTime >= 3000) {
      this.menus.transition("RETRY");
    }
  }
  
  _update(elapsedTime) {
    this.gameState.scores = this.gameState.scores.filter((score) => !score.done);
    for (const score of this.gameState.scores) {
      score.update(elapsedTime);
    }
    
    if (this.gameState.countdown > 0) {
      this.gameState.countdown -= elapsedTime;
      // TODO: put this anywhere else
      for (const ball of this.gameState.balls) {
        ball.position.x = this.gameState.paddle.center.x;
      }
    } else {
      let collisions = this.physicsEngine.update(elapsedTime, this.getPhysicsObjects());
      this.handleCollisions(collisions);
    }

    this.particleEngine.update(elapsedTime);

    //this.gameState.background.update(elapsedTime);
  }

  _render(elapsedTime) {
    this.context.save();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.strokeStyle = "magenta";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.strokeRect(this.gameSettings.playArea.top.x, this.gameSettings.playArea.top.y,
      this.gameSettings.playArea.width, this.gameSettings.playArea.height);
      
    this.drawScore();
    this.renderingEngine.render(this.getUIRenderObjects(), elapsedTime);

    // Clip canvas for remaining rendering
    this.context.beginPath(); 
    this.context.rect(this.gameSettings.playArea.top.x, this.gameSettings.playArea.top.y,
      this.gameSettings.playArea.width, this.gameSettings.playArea.height + this.gameSettings.playArea.bottomBuffer);
    this.context.clip();
    
    this.context.fillStyle = "black";
    // this.context.fillRect(this.gameSettings.playArea.top.x, this.gameSettings.playArea.top.y,
    //   this.gameSettings.playArea.width, this.gameSettings.playArea.height + this.gameSettings.playArea.bottomBuffer);
    
    this.renderingEngine.render(this.getPlayRenderObjects(), elapsedTime);
    this.particleEngine.render(elapsedTime);

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
    } else if (this.state === Game.STATE.DONE) {
      Text.draw(this.context, {
        fillStyle: "magenta",
        strokeStyle: "white",
        font: "240px Trebuchet MS",
        text: "YOU WIN",
        textAlign: "center",
        position: this.gameSettings.playArea.center
      });
    }

    //this.gameState.background.render();

    this.context.restore();
  }
}
