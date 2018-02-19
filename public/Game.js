import Breakout from "./Breakout/Breakout.js"

let pages = {};
let scoresTable = null;

document.addEventListener("DOMContentLoaded", function (event) {
  // pages.menus = document.getElementById("menus");
  // pages.main = document.getElementById("main");
  // pages.newGame = document.getElementById("new-game");
  // pages.highScores = document.getElementById("high-scores");
  // pages.credits = document.getElementById("credits");
  // pages.canvas = document.getElementById("canvas-group");
  // scoresTable = document.getElementById("high-scores-list");

  // pages.main.style.display = "flex";
});

Game.startGame = function (size) {
  let hardMode = document.getElementById("hard-mode").checked;
  Game.thisGame = new Game.MazeGame(size, hardMode);
  Game.thisGame.start();
  pages.newGame.style.display = "none";
  pages.menus.style.display = "none";
  pages.canvas.style.display = "block";
};

Game.newGame = function () {
  pages.main.style.display = "none";
  pages.newGame.style.display = "flex";
};

function getDifficulty(size) {
  if (size === 5) {
    return "Weakling";
  } else if (size === 10) {
    return "Novice";
  } else if (size === 15) {
    return "Experienced";
  } else if (size === 20) {
    return "Adventurer";
  }
}

Game.highScores = function () {
  pages.main.style.display = "none";
  pages.highScores.style.display = "flex";

  let rows = scoresTable.rows;
  let i = rows.length - 1;
  while (i > 0) {
    scoresTable.deleteRow(i);
    i--;
  }

  Game.scores.sort((a, b) => b.score - a.score);
  i = 1;
  for (const score of Game.scores) {
    let row = scoresTable.insertRow(i);
    let scoreCell = row.insertCell(0);
    scoreCell.innerHTML = score.score.toFixed();
    let timeCell = row.insertCell(1);
    timeCell.innerHTML = score.time;
    let difficultyCell = row.insertCell(2);
    difficultyCell.innerHTML = getDifficulty(score.size);
    let hardModeCell = row.insertCell(3);
    hardModeCell.innerHTML = score.hardMode ? "Dungeoneer" : "Coward";
    i++;
  }
};

Game.credits = function () {
  pages.main.style.display = "none";
  pages.credits.style.display = "flex";
};

Game.back = function () {
  if (Game.thisGame) {
    Game.thisGame.end();
    Game.thisGame = null;
  }

  pages.menus.style.display = "block";
  pages.newGame.style.display = "none";
  pages.highScores.style.display = "none";
  pages.credits.style.display = "none";
  pages.canvas.style.display = "none";
  pages.main.style.display = "flex";
};

Game.scores = [];

Game.DIRECTION = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right"
};

Game.Breakout = new Breakout();
