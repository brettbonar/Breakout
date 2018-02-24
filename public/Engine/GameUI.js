export default class GameUI {
  constructor(element) {
    this.menus = {};
    this.showMenuCbs = {};
  }

  parseElement(element) {
    element.find("gui-menu").each((index, menuElement) => {
      let state = menuElement.getAttribute("id");
      this.menus[state] = $(menuElement);
      this.showMenuCbs[state] = [];
    });
  }

  hideAll() {
    _.each(this.menus, (menu) => {
      menu.hide();
    });
  }

  onStateChange(state, cb) {
    this.showMenuCbs[state].push(cb);
  }

  transition(state) {
    _.each(this.menus, (menu) => {
      menu.hide();
    });
    this.menus[state].show();

    for (const cb of this.showMenuCbs[state]) {
      cb(state);
    }
  }

  update(elapsedTime) {}
  render(elapsedTime) {}
  processInput(elapsedTime) {}
}
