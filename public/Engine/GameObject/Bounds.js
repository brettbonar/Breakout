const TYPE = {
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  POINT: "point",
  LINE: "line"
}

export default class Bounds {
  constructor(params) {
    if (params.boundsType === TYPE.CIRCLE) {
      this.constructFromCircle(params);
    } else if (params.boundsType === TYPE.RECTANGLE) {
      this.constructFromRectangle(params);
    } else if (params.boundsType === TYPE.LINE) {
      this.constructFromLine(params);
    }
  }

  static get TYPE() { return TYPE; }

  extend(box) {
    // TODO: if box instanceof BoundingBox

    this.box = {
      ul: { x: Math.min(this.box.ul.x, box.box.ul.x), y: Math.min(this.box.ul.y, box.box.ul.y) },
      ur: { x: Math.max(this.box.ur.x, box.box.ur.x), y: Math.min(this.box.ur.y, box.box.ur.y) },
      lr: { x: Math.max(this.box.lr.x, box.box.lr.x), y: Math.max(this.box.lr.y, box.box.lr.y) },
      ll: { x: Math.min(this.box.ll.x, box.box.ll.x), y: Math.max(this.box.ll.y, box.box.ll.y) }
    };

    this.lines = {
      top: [this.box.ul, this.box.ur],
      bottom: [this.box.lr, this.box.ll],
      right: [this.box.ur, this.box.lr],
      left: [this.box.ll, this.box.ul]
    };

  }

  constructFromLine(params) {
    this.lines = [params.dimensions.line];
  }

  constructFromCircle(params) {
    this.box = {
      ul: { x: params.position.x - params.dimensions.radius, y: params.position.y - params.dimensions.radius },
      ur: { x: params.position.x + params.dimensions.radius, y: params.position.y - params.dimensions.radius },
      lr: { x: params.position.x + params.dimensions.radius, y: params.position.y + params.dimensions.radius },
      ll: { x: params.position.x - params.dimensions.radius, y: params.position.y + params.dimensions.radius }
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
      ur: { x: params.position.x + params.dimensions.width, y: params.position.y },
      lr: { x: params.position.x + params.dimensions.width, y: params.position.y + params.dimensions.height },
      ll: { x: params.position.x, y: params.position.y + params.dimensions.height }
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

  getIntersections(target) {
    if (target instanceof Bounds) {
      if (this.intersects(target)) {
        return target.lines.filter((line) => this.intersects(line));
      }
    } else if (_.isArray(target)) {
      return this.intersects(target) ? [target] : [];
    }
    return [];
  }

  intersects(target) {
    // TODO: add circle intersection tests
    if (target instanceof Bounds) {
      let box = target.box;
      return this.box.ul.x < box.lr.x &&
        this.box.lr.x > box.ul.x &&
        this.box.ul.y < box.lr.y &&
        this.box.lr.y > box.ul.y;
    } else if (_.isArray(target)) { // Line [{ x, y }, { x, y }]
      return _.some(this.lines, (line) => this.intersectsLine(line, target));
    }

    return false;
  }

  get boundingBox() {
    return this.box;
  }
}
