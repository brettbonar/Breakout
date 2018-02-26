import { registerController, GameController } from "../Engine/GameController.js"
import Game from "../Engine/Game.js"
import BreakoutDemo from "./BreakoutDemo.js"
import BreakoutUI from "./BreakoutUI.js"
import Breakout from "./Breakout.js"

export default class BreakoutController extends GameController {
  constructor(element, params) {
    super(element, params, {
      game: new BreakoutDemo({ canvas: document.getElementById("canvas-main") }),
      menus: new BreakoutUI()
    });
    this.start();
  }

  getHighScores() {
    return [
      {
        score: 100,
        bricksDestroyed: 33,
        maxCombo: 22
      },
      {
        score: 10,
        bricksDestroyed: 4,
        maxCombo: 5
      },
      {
        score: 455,
        bricksDestroyed: 65,
        maxCombo: 100
      }
    ];
  }

  newGame() {
    this.game = new Breakout({
      canvas: document.getElementById("canvas-main"),
      menus: this.menus,
      rows: 8,
      columns: 14
    });

    this.game.onStateChange(Game.STATE.DONE, () => {
      //this.returnToMain();
    });

    this.menus.hideAll();
    this.start();
  }

  returnToMain() {
    this.menus.transition("MAIN");
    this.game = new BreakoutDemo({ canvas: document.getElementById("canvas-main") });
  }
}

registerController("BreakoutController", BreakoutController);
