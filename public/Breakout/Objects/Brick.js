import GameObject from "../../Engine/GameObject/GameObject.js"
import RectangleRenderer from "../../Engine/Rendering/Renderers/RectangleRenderer.js"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.js"

export default class Brick extends GameObject {
  constructor(params) {
    super(Object.assign({}, params, {
      dimensions: {
        width: params.gameSettings.brickWidth,
        height: params.gameSettings.brickHeight
      },
      renderer: new RectangleRenderer({
        strokeStyle: params.color,
        //fillStyle: params.color,
        shadowColor: params.color,
        shadowBlur: params.gameSettings.brickShadowBlur,
        lineWidth: params.gameSettings.brickLineWidth
      }),
      position: params.position || {
        x: params.gameSettings.playArea.top.x + params.column * 
          (params.gameSettings.brickWidth + params.gameSettings.brickLineWidth * 2) + params.gameSettings.brickLineWidth,
        y: params.gameSettings.playArea.top.y + params.gameSettings.buffer + params.row * 
          (params.gameSettings.brickHeight + params.gameSettings.brickLineWidth * 2) + params.gameSettings.brickLineWidth
      }
    }));
    this.physics.movementType = MOVEMENT_TYPE.STATIC;

    if (!params.demo) {
      this.pieces = [];
      this.breakDuration = 500;
    }
  }
}
