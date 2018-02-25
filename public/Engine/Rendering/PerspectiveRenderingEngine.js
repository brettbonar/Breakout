import RenderingEngine from "./RenderingEngine.js"

function sortByPosition(obj) {
  return -obj.position.y;
}

export default class PerspectiveRenderingEngine extends RenderingEngine{
  constructor(params) {
    super(params);
  }

  // Render highest to lowest y
  render(objects, elapsedTime) {
    _.sortBy(objects, sortByPosition);
    for (const object of objects) {
      object.render(this.context, elapsedTime);
    }
  }
}
