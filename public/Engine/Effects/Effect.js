export default class Effect {
  constructor(params) {
    this.currentTime = 0;

    Object.assign(this, params);
  }

  update(elapsedTime) {}
  render(elapsedTime) {}
}
