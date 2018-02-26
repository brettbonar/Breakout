import GameObject from "../../Engine/GameObject/GameObject.js"
import ImageRenderer from "../../Engine/Rendering/Renderers/ImageRenderer.js"
import BrickRenderer from "./BrickRenderer.js"
import { SURFACE_TYPE, MOVEMENT_TYPE } from "../../Engine/Physics/PhysicsConstants.js"
import RectangleRenderer from "../../Engine/Rendering/Renderers/RectangleRenderer.js";

let images = {
  lawnGreen: new Image(),
  aqua: new Image(),
  orange: new Image(),
  yellow: new Image()
};
images.lawnGreen.src = "../../Assets/green-brick.png";
images.aqua.src = "../../Assets/blue-brick.png";
images.orange.src = "../../Assets/orange-brick.png";
images.yellow.src = "../../Assets/yellow-brick.png";

let imageShadows = {
  lawnGreen: new Image(),
  aqua: new Image(),
  orange: new Image(),
  yellow: new Image()
};
imageShadows.lawnGreen.src = "../../Assets/green-shadow.png";
imageShadows.aqua.src = "../../Assets/green-shadow.png";
imageShadows.orange.src = "../../Assets/green-shadow.png";
imageShadows.yellow.src = "../../Assets/green-shadow.png";

export default class Brick extends GameObject {
  constructor(params) {
    super(Object.assign({}, params, {
      dimensions: { 
        width: params.gameSettings.brickWidth,
        height: params.gameSettings.brickHeight
      },
      // renderer: new BrickRenderer({
      //   image: images[params.color],
      //   imageShadow: imageShadows[params.color]
      // }),
      renderer: new RectangleRenderer({
        strokeStyle: params.color,
        fillStyle: params.color,
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
