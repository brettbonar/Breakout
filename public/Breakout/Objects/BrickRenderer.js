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

    // Draw shadow
    //context.drawImage(this.imageShadow, object.position.x - 15, object.position.y - 15, object.width + 30, object.height + 30);
    // Draw brick
    context.drawImage(this.image, object.position.x, object.position.y, object.width, object.height);
    
    context.restore();    
  }
}
