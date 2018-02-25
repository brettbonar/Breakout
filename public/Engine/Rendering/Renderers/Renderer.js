export default class Renderer {
  /**
   * @param {Object} params
   * @param {string} params.strokeStyle
   * @param {string} params.fillStyle
   * @param {string} params.shadowColor
   * @param {string} params.shadowBlur
   * @param {string} params.lineWidth
   */
  constructor(params) {
    Object.assign(this, params);
  }

  render(context, object, elapsedTime) {}
}
