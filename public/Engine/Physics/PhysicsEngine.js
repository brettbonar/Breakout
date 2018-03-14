import GameObject from "../GameObject/GameObject.js"
import { MOVEMENT_TYPE, SURFACE_TYPE } from "./PhysicsConstants.js";

export default class PhysicsEngine {
  constructor(params) {
    Object.assign(this, params);
  }

  sweepTest(A1, A2, B1, B2) {
    if (A1.intersects(B1)) {
      return {
        time: 0,
        axis: "x"
      };
    }

    if (!A1.extend(A2).intersects(B1.extend(B2))) {
      return false;
    }

    let vAx = A2.ul.x - A1.ul.x;
    let vAy = A2.ul.y - A1.ul.y;
    let vBx = B2.ul.x - B1.ul.x;
    let vBy = B2.ul.y - B1.ul.y;

    let v = {
      x: vBx - vAx,
      y: vBy - vAy
    }
    let first = {
      x: 0,
      y: 0
    };
    let last = {
      x: Infinity,
      y: Infinity
    };

    _.each(v, (velocity, axis) => {
      if (A1.max[axis] < B1.min[axis] && velocity < 0)
      {
        first[axis] = (A1.max[axis] - B1.min[axis]) / velocity;
      }
      else if (B1.max[axis] < A1.min[axis] && velocity > 0)
      {
        first[axis] = (A1.min[axis] - B1.max[axis]) / velocity;
      }
      if (B1.max[axis] > A1.min[axis] && velocity < 0)
      {
        last[axis] = (A1.min[axis] - B1.max[axis]) / velocity;
      }
      else if (A1.max[axis] > B1.min[axis] && velocity > 0)
      {
        last[axis] = (A1.max[axis] - B1.min[axis]) / velocity;
      }
    });

    let firstTouch = _.max(_.toArray(first));
    let lastTouch = _.min(_.toArray(last));

    if (firstTouch <= lastTouch && firstTouch > 0 && firstTouch <= 1) {
      return {
        time: firstTouch,
        axis: first.x > first.y ? "x" : "y"
      };
    }

    return false;
  }

  getIntersections(vector, target) {
    return _.filter(target.boundingBox.lines, (line) => vector.some((vec) => vec.intersects(line)));
  }

  detectCollisions(obj, objects) {    
    // Handle paddle collision
    let vector = obj.vector;
    let collisions = [];
    let intersections = _.map(objects, (target) => {
      if (target === obj) return false;
      return {
        target: target,
        collision: this.sweepTest(obj.prevBounds, obj.boundingBox, target.prevBounds, target.boundingBox)
      }
    }).filter((target) => target.collision);

    if (intersections.length > 0) {
      let intersection = _.minBy(intersections, (intersection) => intersection.collision.time);
      let target = intersection.target;
      let collision = intersection.collision;
      if (target.physics.surfaceType === SURFACE_TYPE.REFLECTIVE) {
        // TODO: handle reflection in directions other than Y
        obj.direction.y = -obj.direction.y;
        obj.position[collision.axis] = (obj.lastPosition[collision.axis] +
          (obj.position[collision.axis] - obj.lastPosition[collision.axis]) * collision.time) -
          Math.sign(obj.position[collision.axis] - obj.lastPosition[collision.axis]);
        target.color = obj.color;
  
        obj.direction.x = (obj.position.x - (target.position.x + target.width / 2)) / (target.width / 2);
      } else if (target.physics.surfaceType === SURFACE_TYPE.DEFAULT) {
        if (collision.time !== 0) {
          obj.position[collision.axis] = (obj.lastPosition[collision.axis] +
            (obj.position[collision.axis] - obj.lastPosition[collision.axis]) * collision.time) -
            Math.sign(obj.position[collision.axis] - obj.lastPosition[collision.axis]);
        } else {
          obj.position = {
            x: target.position.x + target.width + 1,
            y: target.position.y
          };
        }
        obj.direction[collision.axis] = -obj.direction[collision.axis];

        // if (collision.side === "top" || collision.side === "bottom") { // horizontal surface
        //   obj.position.y = intersection.target.boundingBox.lines[collision.side].y + (obj.direction.y > 0 ? -obj.height / 2 : obj.height / 2);
        //   obj.direction.y = -obj.direction.y;
        // } else if (collision.side === "left" || collision.side === "right") { // vertical surface
        //   obj.position.x = intersection.target.boundingBox.lines[collision.side].x + (obj.direction.x > 0 ? -obj.width / 2 : obj.width / 2);
        //   obj.direction.x = -obj.direction.x;
        // } 
        // TODO: diagonal surface
      }

      collisions.push({
        source: obj,
        target: target
      });

      obj.normalizeDirection();

      // TODO: don't return here to allow multiple collisions
      return collisions;
    }

    return [];
  }

  update(elapsedTime, objects) {
    if (elapsedTime === 0) return [];
    for (const obj of objects) {
      if (obj.direction) {
        //Object.assign(obj.lastPosition, obj.position);
        obj.lastPosition.x = obj.position.x;
        obj.lastPosition.y = obj.position.y;
        obj.position.x += elapsedTime * obj.speed * obj.direction.x;
        obj.position.y += elapsedTime * obj.speed * obj.direction.y;
        obj.rotation += (elapsedTime / 50) * obj.spin;
      }
    }

    let collisions = [];
    for (const obj of objects) {
      if (obj.physics.movementType === MOVEMENT_TYPE.NORMAL) {
        collisions = collisions.concat(this.detectCollisions(obj, objects));
        // Do twice to capture additional collisions after movement
        collisions = collisions.concat(this.detectCollisions(obj, objects));
      }
    }   

    return collisions;
  }
}
