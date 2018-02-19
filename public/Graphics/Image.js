Graphics.Image = (function () {
  class Image {
    constructor(spec) {
      Object.assign(this, spec);
    }

    static draw(context, params) {
      context.save();
  
      if (params.rotation) {
        context.translate(params.x + params.width / 2, params.y + params.height / 2);
        context.rotate((params.rotation * Math.PI) / 180);
        context.translate(-(params.x + params.width / 2), -(params.y + params.height / 2));
      }

      context.drawImage(params.image, params.x, params.y, params.width, params.height);

      context.restore();
    }

    render(context) {
      Line.drawLine(context, this);
    }
  }

  return Image;
})();
