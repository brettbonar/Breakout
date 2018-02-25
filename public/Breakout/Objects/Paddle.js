import GameObject from "../../Engine/GameObject/GameObject.js"
import RectangleRenderer from "../../Engine/Rendering/Renderers/RectangleRenderer.js";
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.js"

export default class Paddle extends GameObject {
  constructor(params) {
    super(params);
    this.renderer = new RectangleRenderer({
      fillStyle: params.color,
      shadowColor: params.color,
      shadowBlur: params.shadowBlur
    });
    this.physics.movementType = MOVEMENT_TYPE.FIXED;
    this.physics.surfaceType = SURFACE_TYPE.REFLECTIVE;
  }

  setColor(color) {
    this.color = color;
    this.renderer.fillStyle = color;
    this.renderer.shadowColor = color;
  }
}
