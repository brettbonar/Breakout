import GameObject from "../../Engine/GameObject/GameObject.js"
import CircleRenderer from "../../Engine/Rendering/Renderers/CircleRenderer.js";
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.js"

export default class Ball extends GameObject {
  constructor(params) {
    super(params);
    this.renderer = new CircleRenderer({
      fillStyle: params.color
    });

    this.normalizeDirection();
  }

  setColor(color) {
    this.color = color;
    this.renderer.fillStyle = color;
  }
}
