export default class EffectsEngine {
  constructor(params) {
    Object.assign(this, params);
    this.effects = [];
  }

  update(elapsedTime) {
    for (const effect of this.effects) {
      effect.update(elapsedTime);
      if (effect.done && _.isFunction(effect.onDone)) {
        effect.onDone(this);
      }
    }

    _.remove(this.effects, "done");
  }

  render(elapsedTime) {
    for (const effect of this.effects) {
      effect.render(this.context, elapsedTime);
    }
  }

  addEffect(effect) {
    this.effects.push(effect);
  }
}