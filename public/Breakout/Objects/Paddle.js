import GameObject from "../../Engine/GameObject/GameObject.js"
import RectangleRenderer from "../../Engine/Rendering/Renderers/RectangleRenderer.js";
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.js"

export default class Paddle extends GameObject {
  constructor(params) {
    super(params);
    this.renderer = new RectangleRenderer({
      fillStyle: params.color,
      shadowColor: params.color,
      shadowBlur: 0
    });
    this.physics.movementType = MOVEMENT_TYPE.FIXED;
    this.physics.surfaceType = SURFACE_TYPE.REFLECTIVE;
  }

  impact(ball) {
    this.color = ball.color;
    this.renderer.fillStyle = ball.color;
    this.renderer.shadowColor = ball.color;
    this.renderer.shadowBlur += ball.renderer.shadowBlur;
    ball.renderer.shadowBlur = 0;
  }
}
