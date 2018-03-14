import KEY_CODE from "../util/keyCodes.js"

const STATE = {
  PAUSED: "paused",
  PLAYING: "playing",
  DONE: "done",
  GAME_OVER: "gameOver",
  INITIALIZING: "initializing"
};

const EVENT = {
  PAUSE: "pause",
  RESUME: "resume"
};

export default class Game {
  constructor(params) {
    this.canvas = params.canvas;
    this.context = this.canvas.getContext("2d");
    this._settings = {
      requestPointerLock: params.requestPointerLock
    };
    //this.STATE = STATE;
    this.EVENT = EVENT;
    this.state = STATE.INITIALIZING;

    this.inputEvents = [];
    this.eventHandlers = {};
    this.stateKeyBindings = {};
    this.keyBindings = {};

    this.transitionStateCbs = {};
    this.stateFunctions = {};
    _.each(STATE, (s) => {
      this.stateFunctions[s] = {
        processInput: (elapsedTime) => this.processInputImpl(elapsedTime),
        update: _.noop,
        render: _.noop
      };
      this.transitionStateCbs[s] = [];
    });

    this.mouseMoveListener = (event) => {
      this.handleMouseMoveImpl(event);
    };
    this.keyDownListener = (event) => {
      this.handleKeyEvent(event);
    };
    this.keyUpListener = (event) => {
      this.handleKeyEvent(event, true);
    };
    this.mouseDownListener = (event) => {
      this.handleMouseDownImpl(event);
    };
    this.pointerLockListener = (event) => {
      this.pointerLockChangeAlert(event);
    };
    
    // this.addEventHandler(EVENT.PAUSE, () => this.transitionState(STATE.PAUSED));
    // this.addEventHandler(EVENT.RESUME, () => this.transitionState(STATE.PLAYING));
  }

  static get EVENT() { return EVENT }
  static get STATE() { return STATE }

  addEvents(events) {
    for (const event of _.castArray(events)) {
      this.EVENT[event] = event;
    }
  }

  handleMouseMove() {}
  handleMouseDown() {}
  
  handleMouseMoveImpl(event) {
    // TRICKY: this awful bug: http://www.html5gamedevs.com/topic/34516-pointer-lock-bug-on-chrome-with-windows-10/
    if (Math.sign(event.movementX) !== Math.sign(this._lastMovement)) {
      this._lastMovement = event.movementX;
      return;
    }

    this.handleMouseMove(event);
  }

  handleMouseDownImpl(event) {
    if (this._settings.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
  }

  pointerLockChangeAlert() {
    if (document.pointerLockElement === this.canvas ||
        document.mozPointerLockElement === this.canvas) {
      this.canvas.addEventListener("mousemove", this.mouseMoveListener);
    } else {
      this.callEvent({ event: EVENT.PAUSE });
      this.canvas.removeEventListener("mousemove", this.mouseMoveListener);
    }
  }

  update(elapsedTime) {
    this.stateFunctions[this.state].update(elapsedTime);
  }

  render(elapsedTime) {
    this.stateFunctions[this.state].render(elapsedTime);
  }

  // Input and events
  processInputImpl(elapsedTime) {
    while (this.inputEvents.length > 0) {
      let event = this.inputEvents.shift();
      this.callEvent(event);
    }
  }

  callEvent(event) {
    let handlers = this.eventHandlers[event.event];
    if (handlers) {
      for (const handler of handlers) {
        handler(event);
      }
    }
  }

  handleKeyEvent(inputEvent, keyUp) {
    let event = this.keyBindings[inputEvent.keyCode];
    if (event) {
      this.inputEvents.push({
        event: event,
        inputEvent: inputEvent,
        release: keyUp
      });
    }
  }

  addEventHandler(event, handler) {
    let handlers = this.eventHandlers[event];
    if (!handlers) {
      this.eventHandlers[event] = [handler];
    } else {
      handlers.push(handler);
    }
  }

  removeEventHandler(event, handler) {
    if (!handler) {
      // Remove all handlers for event if a handler is not defined
      delete this.eventHandlers[event];
      return;
    }

    let handlers = this.eventHandlers[event];
    if (handlers) {
      _.remove(handlers, event);
    }
  }

  processInput(elapsedTime) {
    this.stateFunctions[this.state].processInput(elapsedTime);
  }

  quit() {
    this.canvas.removeEventListener("mousemove", this.mouseMoveListener);
    document.removeEventListener("keydown", this.keyDownListener);
    document.removeEventListener("keyup", this.keyUpListener);
    this.canvas.removeEventListener("mousedown", this.mouseDownListener);
    if (this._settings.requestPointerLock) {
      document.removeEventListener("pointerlockchange", this.pointerLockListener, false);
      document.removeEventListener("mozpointerlockchange", this.pointerLockListener, false);
      document.exitPointerLock();
    }
  }

  start() {
    if (this._settings.requestPointerLock) {
      document.addEventListener("pointerlockchange", this.pointerLockListener, false);
      document.addEventListener("mozpointerlockchange", this.pointerLockListener, false);
      this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
      document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
      this.canvas.requestPointerLock();
    } else {
      this.canvas.addEventListener("mousemove", this.mouseMoveListener);
    }
    document.addEventListener("keydown", this.keyDownListener);
    document.addEventListener("keyup", this.keyUpListener);
    this.canvas.addEventListener("mousedown", this.mouseDownListener);


    this.previousTime = performance.now();
    this.transitionState(STATE.PLAYING);
  }

  _onStateChange(state, cb) {
    let cbs = this.transitionStateCbs[state];
    if (!cbs) {
      this.transitionStateCbs[state] = [cb];
    } else {
      cbs.push(cb);
    }
  }

  onStateChange(state, cb) {
    if (_.isArray(state)) {
      for (const s of state) {
        this._onStateChange(s, cb);
      }
    } else {
      this._onStateChange(state, cb);
    }
  }

  transitionState(state) {
    this.state = state;
    for (const cb of this.transitionStateCbs[state]) {
      cb(this);
    }
  }
}
