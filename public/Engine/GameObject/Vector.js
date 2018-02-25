import Bounds from "./Bounds.js"

export default class Vector {
  constructor(params) {
    this.vector = params;
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
    if (target instanceof Bounds) {
      return _.some(target.lines, (line) => this.intersectsLine(this.vector, line));
    } else if (_.isArray(target)) { // Line [{ x, y }, { x, y }]
      return this.intersectsLine(this.vector, target);
    } else if (target instanceof Vector) {
      return this.intersectsLine(this.vector, target.vector);
    }

    return false;
  }

  getIntersections(target) {
    if (target instanceof Bounds) {
      return target.lines.filter((line) => this.intersectsLine(line));
    } else if (_.isArray(target)) {
      return this.intersectsLine(this.vector, target) ? [target] : [];
    } else if (target instanceof Vector) {
      return this.intersectsLine(this.vector, target.vector) ? [target] : [];
    }
    return [];
  }

  get first() {
    return this.vector[0];
  }

  get second() {
    return this.vector[1];
  }

  get length() {
    return Math.sqrt(Math.pow(this.first.x - this.second.x, 2.0) + Math.pow(this.first.y - this.second.y, 2.0));
  }

  get slope() {
    return (this.second.y - this.first.y) / (this.second.x - this.first.x);
  }

  get yIntercept() {
    return this.first.y - (this.first.x * this.slope);
  }

  render(context) {
    Graphics.Line.draw(context, {
      line: this.vector,
      fillStyle: "red",
      strokeStyle: "red"
    });
  }

  getParallelLine(distance) {
    // https://stackoverflow.com/questions/2825412/draw-a-parallel-line
    // if (this.first.x === this.second.x) {
    //   // Vertical line
    //   return {
    //     x: this.second.x + distance,
    //     y: this.second.y
    //   };
    // }

    let length = this.length;
    let vector = new Vector([
      {
        x: this.first.x + distance * (this.second.y - this.first.y) / length,
        y: this.first.y + distance * (this.first.x - this.second.x) / length
      }, {
        x: this.second.x + distance * (this.second.y - this.first.y) / length,
        y: this.second.y + distance * (this.first.x - this.second.x) / length
      }
    ]);
    return vector;
  }

  extend(distance) {
    // https://stackoverflow.com/questions/7740507/extend-a-line-segment-a-specific-distance
    // Extend end of vector by distance
    let length = this.length;
    this.vector[1] = {
      x: this.second.x + (this.second.x - this.first.x) / length * distance,
      y: this.second.y + (this.second.y - this.first.y) / length * distance
    };
  }
}
