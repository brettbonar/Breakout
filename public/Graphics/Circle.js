Graphics.Circle = (function () {
  class Circle {
    constructor(spec) {
      Object.assign(this, spec);
    }

    static draw(context, params) {
      context.save();

      context.beginPath();
      
      context.arc(params.x, params.y, params.r, 0, 2 * Math.PI);

      context.closePath();

      context.fillStyle = params.fillStyle;
      context.fill();
      context.strokeStyle = params.strokeStyle;
      context.stroke();

      context.restore();
    }

    render(context) {
      Circle.draw(context, this);
    }
  }

  return Circle;
})();
