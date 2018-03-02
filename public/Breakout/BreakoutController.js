import { registerController, GameController } from "../Engine/GameController.js"
import Game from "../Engine/Game.js"
import BreakoutDemo from "./BreakoutDemo.js"
import BreakoutUI from "./BreakoutUI.js"
import Breakout from "./Breakout.js"

const HIGH_SCORE_STORAGE = "breakout_highScores";

export default class BreakoutController extends GameController {
  constructor(element, params) {
    super(element, params, {
      game: new BreakoutDemo({ canvas: document.getElementById("canvas-main") }),
      menus: new BreakoutUI()
    });
    this.highScores = localStorage.getItem(HIGH_SCORE_STORAGE);
    if (this.highScores) {
      this.highScores = JSON.parse(this.highScores);
    } else {
      this.highScores = [];
    }
    this.start();
  }

  getHighScores() {
    // Get top 5
    return this.highScores;
  }

  saveScore(game) {
    this.highScores.push({
      score: game.gameState.score,
      bricksDestroyed: game.gameState.bricksDestroyed,
      maxCombo: game.gameState.maxCombo
      // time
    });
    _.sortBy(this.highScores, (score) => -score.score);
    localStorage.setItem(HIGH_SCORE_STORAGE, JSON.stringify(this.highScores));
  }

  clearScores() {
    this.highScores.length = 0;
    localStorage.setItem(HIGH_SCORE_STORAGE, JSON.stringify(this.highScores));
    this.menus.showScores(getHighScores())
  }

  newGame() {
    this.game = new Breakout({
      canvas: document.getElementById("canvas-main"),
      menus: this.menus,
      rows: 8,
      columns: 14
    });
    this.game.onStateChange(Game.STATE.DONE, (game) => this.saveScore(game));
    this.game.onStateChange(Game.STATE.GAME_OVER, (game) => this.saveScore(game));

    this.menus.hideAll();
    this.start();
  }
  
  returnToMain() {
    if (this.game instanceof Breakout) {
      this.game = new BreakoutDemo({ canvas: document.getElementById("canvas-main") });
      this.game.start();
    }
  }
}

registerController("BreakoutController", BreakoutController);
