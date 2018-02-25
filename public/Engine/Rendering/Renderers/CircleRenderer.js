import Renderer from "./Renderer.js"

export default class CircleRenderer extends Renderer {
  constructor(params) {
    super(params);
  }

  render(context, object, elapsedTime) {
    context.save();

    context.beginPath();
    context.arc(object.position.x, object.position.y, object.radius, 0, 2 * Math.PI);
    context.closePath();

    if (this.fillStyle) {
      context.fillStyle = this.fillStyle;
      context.fill();
    }

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
      context.stroke();
    }

    context.restore();

    // DEBUG
    // for (const vector of this.vector) {
    //   vector.render(context);
    // } 
  }
}
