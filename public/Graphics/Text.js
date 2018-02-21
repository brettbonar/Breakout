export default class Text {
  constructor(spec) {
    Object.assign(this, spec);
  }

  static draw(context, params) {
    context.font = params.font || "30px Trebuchet MS";
    context.fillStyle = params.fillStyle || "red";
    context.strokeStyle = params.strokeStyle;
    context.textAlign = params.textAlign || "start";
    context.strokeText(params.text, params.position.x, params.position.y);
    context.fillText(params.text, params.position.x, params.position.y);
  }

  render(context) {
    Text.draw(context, this);
  }
}
