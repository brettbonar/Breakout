import Renderer from "./Renderer.js"

export default class RectangleRenderer extends Renderer {
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
    
    context.shadowColor = this.shadowColor;
    context.shadowBlur = this.shadowBlur;
    context.lineWidth = this.lineWidth;

    if (this.fillStyle) {
      context.fillStyle = this.fillStyle;
      context.fillRect(object.position.x, object.position.y, object.width, object.height);
    }

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
      context.strokeRect(object.position.x, object.position.y, object.width, object.height);
    }
    
    context.restore();    
  }
}
