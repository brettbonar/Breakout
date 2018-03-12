import GameObject from "../GameObject/GameObject.js"
import { MOVEMENT_TYPE, SURFACE_TYPE } from "./PhysicsConstants.js";

export default class PhysicsEngine {
  constructor(params) {
    Object.assign(this, params);
  }

  sweepTest(boxA1, boxA2, boxB1, boxB2) {
    let vAx = boxA2.box.ul.x - boxA1.box.ul.x;
    let vAy = boxA2.box.ul.y - boxA1.box.ul.y;
    let vBx = boxB2.box.ul.x - boxB1.box.ul.x;
    let vBy = boxB2.box.ul.y - boxB1.box.ul.y;
    let vx = vBx - vAx;
    let vy = vBy - vAy;

    let ux = (boxA1.lr.x - boxB1.ul.x) / vx;
    let uy = (boxA1.lr.y - boxB1.ul.y) / vy;

    let u0 = Math.max(ux, uy);
    let u1 = Math.min(ux, uy);

    if (u0 <= u1) {
      return {
        
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
    for (const target of objects) {
      if (target === obj) continue;
      
      let intersections = this.getIntersections(vector, target);
      if (intersections.length > 0) {
        // TODO: if target movement is also normal then move target
        if (target.physics.surfaceType === SURFACE_TYPE.REFLECTIVE) {
          // TODO: handle reflection in directions other than Y
          obj.direction.y = -obj.direction.y;
          obj.position.y = target.position.y - target.height - obj.gameSettings.brickLineWidth;
          target.color = obj.color;
    
          obj.direction.x = (obj.position.x - (target.position.x + target.width / 2)) / (target.width / 2);
        } else if (target.physics.surfaceType === SURFACE_TYPE.DEFAULT) {
          // TODO: figure out which of intersections is best match
          let targetSurface = intersections[0];
          if (targetSurface[0].y === targetSurface[1].y) { // horizontal surface
            obj.position.y = targetSurface[0].y + (obj.direction.y > 0 ? -obj.height / 2 : obj.height / 2);
            obj.direction.y = -obj.direction.y;
          } else if (targetSurface[0].x === targetSurface[1].x) { // vertical surface
            obj.position.x = targetSurface[0].x + (obj.direction.x > 0 ? -obj.width / 2 : obj.width / 2);
            obj.direction.x = -obj.direction.x;
          } 
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
    }

    return collisions;
  }

  update(elapsedTime, objects) {
    for (const obj of objects) {
      if (obj.direction) {
        Object.assign(obj.lastPosition, obj.position);
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
