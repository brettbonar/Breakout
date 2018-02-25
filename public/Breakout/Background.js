import Brick from "./Objects/Brick.js"

export default class Background {
  constructor(mainCanvas, gameSettings) {
    this.canvasGroup = document.getElementsByClassName("canvas-group")[0];
    this.canvas = document.createElement("canvas");
    this.canvas.width = mainCanvas.width;
    this.canvas.height = mainCanvas.height;
    this.canvas.classList.add("game-canvas");
    this.canvas.classList.add("background");
    this.canvasGroup.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");

    this.gameSettings = gameSettings;
  }

  update(elapsedTime) {
  }

  render(elapsedTime) {
    this.context.save();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
    this.context.strokeStyle = "magenta";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.strokeRect(this.gameSettings.playArea.top.x, this.gameSettings.playArea.top.y,
      this.gameSettings.playArea.width, this.gameSettings.playArea.height);

    this.context.restore();
  }
}
