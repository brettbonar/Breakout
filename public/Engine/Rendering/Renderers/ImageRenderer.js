import Renderer from "./Renderer.js"

export default class ImageRenderer extends Renderer {
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

    context.drawImage(this.image, object.position.x, object.position.y, object.width, object.height);
    
    context.restore();    
  }
}
