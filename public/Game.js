import Breakout from "./Breakout/Breakout.js"
import BreakoutDemo from "./Breakout/BreakoutDemo.js"

let pages = {};
let scoresTable = null;

document.addEventListener("DOMContentLoaded", function (event) {
  pages.menus = document.getElementById("menus");
  pages.main = document.getElementById("main");
  pages.highScores = document.getElementById("high-scores");
  pages.credits = document.getElementById("credits");
  pages.canvasDemo = document.getElementById("canvas-demo");
  pages.canvasMain = document.getElementById("canvas-main");
  pages.pauseMenu = document.getElementById("pause-menu");
  scoresTable = document.getElementById("high-scores-list");

  pages.main.style.display = "flex";
  Game.demo = new BreakoutDemo(pages.canvasDemo);
});

Game.newGame = function () {
  Game.demo.done = true;
  Game.demo = null;
  pages.menus.style.display = "none";
  pages.main.style.display = "none";
  pages.canvasDemo.style.display = "none";
  pages.canvasMain.style.display = "block";
  
  Game.thisGame = new Breakout({ canvas: pages.canvasMain });
  Game.thisGame.start();
};

Game.resume = function () {
  Game.thisGame.resume();
}

Game.quit = function () {
  pages.canvasMain.style.display = "none";
  pages.pauseMenu.style.display = "none";
  pages.menus.style.display = "block";
  pages.main.style.display = "flex";
  pages.canvasDemo.style.display = "block";
  Game.thisGame = null;
  Game.demo = new BreakoutDemo(pages.canvasDemo);
}

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
  pages.highScores.style.display = "none";
  pages.credits.style.display = "none";
  pages.main.style.display = "flex";
};

Game.scores = [];

Game.DIRECTION = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right"
};
