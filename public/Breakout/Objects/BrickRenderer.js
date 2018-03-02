import Renderer from "../../Engine/Rendering/Renderers/Renderer.js"

export default class BrickRenderer extends Renderer {
  constructor(params) {
    super(params);
  }

  render(context, object, elapsedTime) {
    context.save();
    
    if (object.rotation) {
      context.translate(object.position.x + object.width / 2, object.position.y + object.height / 2);
      context.rotate((object.rotation * Math.PI) / 180);
      context.translate(-(object.position.x + object.width / 2), -(object.position.y + object.height / 2));        
    }

    context.lineWidth = this.lineWidth;

    if (this.fillStyle) {
      context.fillStyle = this.fillStyle;
      context.fillRect(object.position.x, object.position.y, object.width, object.height);
    }

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
      context.strokeRect(object.position.x, object.position.y, object.width, object.height);
    }

    // Draw shadow
    context.drawImage(this.imageShadow, object.position.x - 10, object.position.y - 10, object.width + 20, object.height + 20);
    
    context.restore();    
  }
}
