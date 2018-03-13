import GameObject from "../GameObject/GameObject.js"
import { MOVEMENT_TYPE, SURFACE_TYPE } from "./PhysicsConstants.js";

export default class PhysicsEngine {
  constructor(params) {
    Object.assign(this, params);
  }

  getOverlapTime(A, B, v, axis) {
    let result = {
      first: 0,
      last: 1
    };
    if( A.max[axis]<B.min[axis] && v<0 )
    {
      result.first = (A.max[axis] - B.min[axis]) / v;
    }
    else if( B.max[axis]<A.min[axis] && v>0 )
    {
      result.first = (A.min[axis] - B.max[axis]) / v;
    }
    if( B.max[axis]>A.min[axis] && v<0 )
    {
      result.last = (A.min[axis] - B.max[axis]) / v;
    }
    else if( A.max[axis]>B.min[axis] && v>0 )
    {
      result.last = (A.max[axis] - B.min[axis]) / v;
    }

    return result;
  }

  sweepTest2(A1, A2, B1, B2) {
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

  sweepTest(boxA1, boxA2, boxB1, boxB2) {
    // if (boxA1.intersects(boxB1)) {
    //   return {
    //     time: 0,
    //     axis: "x"
    //   };
    // }

    let vAx = boxA2.ul.x - boxA1.ul.x;
    let vAy = boxA2.ul.y - boxA1.ul.y;
    let vBx = boxB2.ul.x - boxB1.ul.x;
    let vBy = boxB2.ul.y - boxB1.ul.y;
    let vx = vBx - vAx;
    let vy = vBy - vAy;

    // let ux = (boxA1.lr.x - boxB1.ul.x) / vx;
    // let uy = (boxA1.lr.y - boxB1.ul.y) / vy;
    let ux = this.getOverlapTime(boxA1, boxB1, vx, "x");
    let uy = this.getOverlapTime(boxA1, boxB1, vy, "y");

    if (ux.first === 0 || uy.first === 0 || ux.first > 1 || uy.first > 1) {
      return false;
    }

    let u0 = Math.max(ux.first, uy.first);
    let u1 = Math.min(ux.last, uy.last);

    if (u0 > u1) {
      return false;
    }

    // let side;
    // if (ux < uy) {
    //   if (boxB2.x < boxB1.x) {
    //     side = "right";
    //   } else {
    //     side = "left";
    //   }
    // } else {
    //   if (boxB2.y < boxB2.y) {
    //     side = "bottom";
    //   } else {
    //     side = "top";
    //   }
    // }

    return {
      time: u1,
      // TODO: could return list of axes that match minimum u in case of corner hits
      axis: ux < uy ? "x" : "y"
    };
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
        collision: this.sweepTest2(obj.prevBounds, obj.boundingBox, target.prevBounds, target.boundingBox)
      }
    }).filter((target) => target.collision);

    if (intersections.length > 0) {
      let intersection = _.minBy(intersections, (intersection) => intersection.collision.time);
      let target = intersection.target;
      let collision = intersection.collision;
      if (target.physics.surfaceType === SURFACE_TYPE.REFLECTIVE) {
        // TODO: handle reflection in directions other than Y
        obj.direction.y = -obj.direction.y;
        obj.position.y = target.position.y - target.height - obj.gameSettings.brickLineWidth;
        target.color = obj.color;
  
        obj.direction.x = (obj.position.x - (target.position.x + target.width / 2)) / (target.width / 2);
      } else if (target.physics.surfaceType === SURFACE_TYPE.DEFAULT) {
        if (collision.time !== 0) {
          obj.position[collision.axis] = (obj.lastPosition[collision.axis] +
            (obj.position[collision.axis] - obj.lastPosition[collision.axis]) * collision.time) -
            Math.sign(obj.position[collision.axis] - obj.lastPosition[collision.axis]);
        } else {
          obj.position = target.position + target.width + 1;
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
      }
    }   

    return collisions;
  }
}
