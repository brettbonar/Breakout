import GameUI from "../Engine/GameUI.js"

export default class BreakoutUI extends GameUI {
  constructor(params) {
    super(params);
  }

  showScores(scores) {
    let element = this.menus["HIGH_SCORES"];
    let scoresTable = element.find(".high-scores-list")[0];
    let rows = scoresTable.rows;
    let i = rows.length - 1;
    while (i > 0) {
      scoresTable.deleteRow(i);
      i--;
    }
  
    scores.sort((a, b) => b.score - a.score);
    i = 1;
    for (const score of scores) {
      let row = scoresTable.insertRow(i);
      let scoreCell = row.insertCell(0);
      scoreCell.innerHTML = score.score.toFixed();
      let bricksCell = row.insertCell(1);
      bricksCell.innerHTML = score.bricksDestroyed;
      let comboCell = row.insertCell(2);
      comboCell.innerHTML = score.maxCombo;
      // let timeCell = row.insertCell(3);
      // timeCell.innerHTML = score.time;
      i++;
    }
  }
}
