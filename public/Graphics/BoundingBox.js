export default class BoundingBox {
  constructor(params) {
    if (params.position && !_.isUndefined(params.radius)) {
      this.constructFromCircle(params);
    } else if (params.position && !_.isUndefined(params.width) && !_.isUndefined(params.height)) {
      this.constructFromRectangle(params);
    } else if (params.line) {
      this.constructFromLine(params);
    }
  }

  constructFromLine(params) {
    this.lines = [params.line];
  }

  constructFromCircle(params) {
    this.box = {
      ul: { x: params.position.x - params.radius, y: params.position.y - params.radius },
      ur: { x: params.position.x + params.radius, y: params.position.y - params.radius },
      lr: { x: params.position.x + params.radius, y: params.position.y + params.radius },
      ll: { x: params.position.x - params.radius, y: params.position.y + params.radius }
    };

    this.lines = {
      top: [this.box.ul, this.box.ur],
      right: [this.box.ur, this.box.lr],
      bottom: [this.box.lr, this.box.ll],
      left: [this.box.ll, this.box.ul]
    };
  }

  constructFromRectangle(params) {
    // TODO: handle line width?
    this.box = {
      ul: { x: params.position.x, y: params.position.y },
      ur: { x: params.position.x + params.width, y: params.position.y },
      lr: { x: params.position.x + params.width, y: params.position.y + params.height },
      ll: { x: params.position.x, y: params.position.y + params.height }
    };

    this.lines = {
      top: [this.box.ul, this.box.ur],
      bottom: [this.box.lr, this.box.ll],
      right: [this.box.ur, this.box.lr],
      left: [this.box.ll, this.box.ul]
    };
  }

  intersectsLine(first, second) {
    // https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
    var det, gamma, lambda;
    det = (first[1].x - first[0].x) * (second[1].y - second[0].y) - (second[1].x - second[0].x) * (first[1].y - first[0].y);
    if (det === 0) {
      return false;
    } else {
      lambda = ((second[1].y - second[0].y) * (second[1].x - first[0].x) + (second[0].x - second[1].x) * (second[1].y - first[0].y)) / det;
      gamma = ((first[0].y - first[1].y) * (second[1].x - first[0].x) + (first[1].x - first[0].x) * (second[1].y - first[0].y)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  }

  intersects(target) {
    if (target instanceof BoundingBox) {
      let box = target.box;
      return this.box.ul.x < box.lr.x &&
        this.box.lr.x > box.ul.x &&
        this.box.ul.y < box.lr.y &&
        this.box.lr.y > box.ul.y;
    } else if (_.isArray(target)) { // Line [{ x, y }, { x, y }]
      return _.some(this.lines, (line) => this.intersectsLine(line, target));
    }

    // else test collision against line

    return false;
  }

  get boundingBox() {
    return this.box;
  }
}
