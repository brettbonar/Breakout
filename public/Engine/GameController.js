import GameUI from "./GameUI.js"

let controllers = {};
let activeControllers = [];

class GameController {
  constructor(element, params, setup) {
    this.element = element;
    this.params = params;
    this.game = setup.game;
    this.menus = setup.menus;

    if (params.template) {
      let template = $("<div>");
      template.load(params.template, (el) => {
        this.element.append(template[0]);
        this.parseElement(template);
      });
    } else {
      this.parseElement(this.element);
    }
    // this.game = params.game;
    // this.gameUi = params.gameUi;
    // this.particleEngine
  }

  isFunction(str) {
    // TODO: find a better check for this...
    return _.lastIndexOf(str, ")") > str.indexOf("(");
  }

  getParams(str) {
    if (this.isFunction(str)) {
      return this.parseExpression(str);
    } else {
      return eval(str); /* pretend this isn't here */
    }
  }

  invokeFn(path, params) {
    let mappedParams = params.map((param) => {
      if (_.isFunction(param)) {
        return param();
      }
      return param;
    });
    return _.invoke(this, path, ...mappedParams);
  }

  parseExpression(expression) {
    // TODO: handle non-function expressions?
    let lines = expression.split(";").map((line) => {
      let start = line.indexOf("(");
      let end = _.lastIndexOf(line, ")");
      let path = line.slice(0, start);
      let params = line.slice(start + 1, end).split(",").map((p) => this.getParams(p));

      return () => {
        return this.invokeFn(path, params);
      };
    });

    return () => {
      let res;
      for (const line of lines) {
        res = line();
      }
      return res;
    };
  }

  parseElement(element) {
    this.menus.parseElement(element);    
    element.find("[gui-click]").each((index, clickElement) => {
      let fn = this.parseExpression(clickElement.getAttribute("gui-click"));
      clickElement.onclick = (event) => fn(event);
    });
    
    element.find("[gui-on-show]").each((index, showElement) => {
      let fn = this.parseExpression(showElement.getAttribute("gui-on-show"));
      let state = showElement.getAttribute("id");
      this.menus.onStateChange(state, (state) => fn(state));
    });
  }

  start() {
    this.previousTime = performance.now();
    this.game.start();
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
  }

  gameLoop(currentTime) {
    let elapsedTime = currentTime - this.previousTime;
    this.previousTime = currentTime;
  
    this.game.processInput(elapsedTime);
    this.menus.processInput(elapsedTime);

    this.game.update(elapsedTime);
    this.menus.update(elapsedTime);

    this.game.render(elapsedTime);
    this.menus.render(elapsedTime);
  
    requestAnimationFrame((currentTime) => this.gameLoop(currentTime));
  }
}

document.addEventListener("DOMContentLoaded", function (event) {
  $("[game-controller]").each((index, element) => {
    let controller = controllers[element.getAttribute("game-controller")];
    if (controller) {
      let params = _.transform(element.attributes, (params, attribute) => {
        params[attribute.name] = attribute.value;
      }, {});
      activeControllers = new controller(element, params);
    }
  });
});

function registerController(name, controller) {
  controllers[name] = controller;
}

export { registerController, GameController }
