import GameObject from "../../Engine/GameObject/GameObject.js"
import CircleRenderer from "../../Engine/Rendering/Renderers/CircleRenderer.js";
import Bounds from "../../Engine/GameObject/Bounds.js"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.js"

export default class Ball extends GameObject {
  constructor(params) {
    super(Object.assign({
      boundsType: Bounds.TYPE.CIRCLE,
      score: 0
    }, params));
    this.renderer = new CircleRenderer({
      fillStyle: params.color,
      shadowColor: params.color,
      shadowBlur: 0
    });
    _.defaults(this, {
      saturation: 0
    });

    this.normalizeDirection();
  }

  render(context) {
    super.render(context);
    context.globalCompositeOperation = "saturation";
    context.fillStyle = "hsl(0," + this.saturation + "%, 50%)";
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.dimensions.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.globalCompositeOperation = "source-over";
  }

  setColor(color) {
    this.color = color;
    this.renderer.fillStyle = color;
    this.renderer.shadowColor = color;
    this.saturation += 1;
  }

  addSpark(color) {
    this.setColor(color);
    this.score += 1;
    this.renderer.shadowBlur = this.score;
  }
}
