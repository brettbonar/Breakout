import Effect from "../../Engine/Effects/Effect.js"

export default class BrickDestroyedEffect extends Effect {
  constructor(params) {
    super(params);
    this.init(params);
    // let sound = new Audio("Assets/Explosion58.wav");
    // sound.play();
  }
  
  normalizeDirection(direction) {
    let norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (norm !== 0) {
      direction.x = direction.x / norm;
      direction.y = direction.y / norm;
    }
    return direction;
  }

  getContactBox(params, contactPoint) {
    let contactBoxDimen = params.brick.height * 2;
    let contactBox = {
      ul: {
        x: _.clamp(contactPoint.x - contactBoxDimen, params.brick.position.x, params.brick.position.x + params.brick.width),
        y: _.clamp(contactPoint.y - contactBoxDimen, params.brick.position.y, params.brick.position.y + params.brick.height)
      },
      lr: {
        x: _.clamp(contactPoint.x + contactBoxDimen, params.brick.position.x, params.brick.position.x + params.brick.width),
        y: _.clamp(contactPoint.y + contactBoxDimen, params.brick.position.y, params.brick.position.y + params.brick.height)
      }
    };

    return contactBox;
  }

  finishResults(results) {
    // TODO: clean this up
    let merged = [];
    for (const cell of results) {
      if (!merged.includes(cell.site)) {
        let edge = cell.halfedges[cell.halfedges.length - 1];
        if (edge.edge.lSite) {
          let target = _.find(results, (cell) => cell.site === edge.edge.lSite);
          cell.halfedges = cell.halfedges.concat(target.halfedges);
          merged.push(edge.site);
          merged.push(target.site);
        }
      }
    }
  }

  getCenter(cell) {
    let xsum = 0;
    let ysum = 0;
    for (const edge of cell.halfedges) {
      xsum += edge.getEndpoint().x;
      ysum += edge.getEndpoint().y;
    }
    return {
      x: xsum / cell.halfedges.length,
      y: ysum / cell.halfedges.length
    };
  }

  init(params) {
    this.currentTime = 0;
    this.color = params.brick.color;

    let voronoi = new Voronoi();
    let box = params.brick.boundingBox.boundingBox;
    box = {
      xl: box.ul.x,
      xr: box.lr.x,
      yt: box.ul.y,
      yb: box.lr.y
    };
    let sites = [];
    let numPoints = 10;
    let contactPoint = {
      x: _.clamp(params.ball.position.x, params.brick.position.x, params.brick.position.x + params.brick.width),
      y: _.clamp(params.ball.position.y, params.brick.position.y, params.brick.position.y + params.brick.height)
    };
    let contactBox = this.getContactBox(params, contactPoint);
    // for (let i = 0; i < numPoints / 2; i++) {
    //   sites.push({
    //     x: Math.random() * (contactBox.lr.x - contactBox.ul.x) + contactBox.ul.x,
    //     y: Math.random() * (contactBox.lr.y - contactBox.ul.y) + contactBox.ul.y
    //   });
    // }
    // for (let i = 0; i < numPoints / 2; i++) {
    //   sites.push({
    //     x: Math.random() * params.brick.width + params.brick.position.x,
    //     y: Math.random() * params.brick.height + params.brick.position.y
    //   });
    // }
    for (let i = 0; i < numPoints; i++) {
      sites.push({
        x: Math.random() * (contactBox.lr.x - contactBox.ul.x) + contactBox.ul.x,
        y: Math.random() * (contactBox.lr.y - contactBox.ul.y) + contactBox.ul.y
      });
    }
    // for (let i = 0; i < numPoints; i++) {
    //   sites.push({
    //     x: Math.random() * params.brick.width + params.brick.position.x,
    //     y: Math.random() * params.brick.height + params.brick.position.y
    //   });
    // }

    // TODO: merge random neighbors to get more of a shattering effect
    let results = voronoi.compute(sites, box).cells;
    let brickCenter = {
      x: params.brick.position.x + params.brick.width / 2,
      y: params.brick.position.y + params.brick.height / 2
    };
    //this.finishResults(results);
    this.pieces = results.map((cell) => {
      let spin = 1;
      if (cell.site.x < contactPoint.x && cell.site.y < contactPoint.y) {
        spin = -1;
      } else if (cell.site.x < contactPoint.x && cell.site.y > contactPoint.y) {
        spin = 1;
      }
      let center = this.getCenter(cell);
      let direction = this.normalizeDirection({
        x: (cell.site.x - params.ball.position.x) / 4,
        y: cell.site.y - params.ball.position.y
      });
      direction.x *= params.ball.speed / 4;
      direction.y *= params.ball.speed / 4;
      return Object.assign(cell, {
        // direction: this.normalizeDirection({
        //   x: center.x - brickCenter.x,
        //   y: center.y - brickCenter.y
        // }),
        direction: direction,
        center: center,
        rotation: 0,
        spin: spin * _.random(1, 5, true),
        speed: 1,//0.05 * params.ball.speed,
        acceleration: { x: 0, y: 0.03 },
        xdiff: 0,
        ydiff: 0
      });
    });
  }

  drawPieces(context) {
    for (const piece of this.pieces) {
      context.save();
      //context.globalAlpha = Math.max((this.duration - this.currentTime) / this.duration, 0);

      if (piece.rotation) {
        context.translate(piece.center.x, piece.center.y);
        context.rotate((piece.rotation * Math.PI) / 180);
        context.translate(-piece.center.x, -piece.center.y);
      }
      // context.strokeStyle = this.color;
      // context.lineWidth = this.gameSettings.brickLineWidth;
      context.fillStyle = this.color;
      //context.shadowColor = this.color;
      // TODO: remove game settings
      //context.shadowBlur = this.gameSettings.brickShadowBlur * (1 - this.currentTime / this.duration);
      //context.lineWidth = 1;
      
      context.beginPath();
      context.moveTo(piece.halfedges[0].getStartpoint().x + piece.xdiff,
        piece.halfedges[0].getStartpoint().y + piece.ydiff);
      for (const edge of piece.halfedges) {
        context.lineTo(edge.getEndpoint().x + piece.xdiff, edge.getEndpoint().y + piece.ydiff);
      }
  
      context.fill();
      //context.stroke();
      context.closePath();
      context.restore();
    }
  }

  render(context) {
    this.drawPieces(context);
    //this.drawParticles(context);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;

    for (const piece of this.pieces) {
      piece.rotation += (elapsedTime / 50) * piece.spin;
      piece.direction.y += (elapsedTime / 50) * piece.acceleration.y;
      let xdiff = elapsedTime * piece.speed * piece.direction.x;
      let ydiff = elapsedTime * piece.speed * piece.direction.y;
      piece.xdiff += xdiff;
      piece.ydiff += ydiff;
      piece.center.x += xdiff;
      piece.center.y += ydiff;
    }

    // for (const particle of this.particles) {
    //   particle.rotation += (elapsedTime / 50) * particle.spin;
    //   particle.position.x += elapsedTime * particle.speed * particle.direction.x;
    //   particle.position.y += elapsedTime * particle.speed * particle.direction.y;
    // }

    if (this.currentTime >= this.duration) {
      this.done = true;
    }
  }
}
