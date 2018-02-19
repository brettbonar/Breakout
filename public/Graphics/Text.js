Graphics.Text = (function () {
  class Text {
    constructor(spec) {
      Object.assign(this, spec);
    }

    static draw(context, params) {
      context.font = params.font || "30px Trebuchet MS";
      context.fillStyle = params.fillStyle || "red";
      context.textAlign = params.textAlign || "start";
      context.fillText(params.text, params.position.x, params.position.y);
    }

    render(context) {
      Text.draw(context, this);
    }
  }

  return Text;
})();
