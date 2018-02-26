import Effect from "../../Engine/Effects/Effect.js"

export default class BrickDestroyedEffect extends Effect {
  constructor(params) {
    super(params);
    this.init(params);
  }
  
  // init(params) {
  //   this.currentTime = 0;
  //   this.color = params.brick.color;
    
  //   //let x1 = _.random(params.brick.position.x, params.brick.position.x + params.brick.width);
  //   let x1 = params.brick.position.x + params.brick.width;
  //   let x2 = x1;
  //   //let x2 = params.brick.position.x + ((params.brick.position.x + params.brick.width) - x1);
  //   this.pieces = [
  //     {
  //       line: [{ x: params.brick.position.x, y: params.brick.position.y }, { x: x1, y: params.brick.position.y }],
  //       direction: { x: -0.5, y: -0.5 },
  //       rotation: 0,
  //       spin: _.random(-1, 1, true),
  //       speed: 0.05
  //     }, {
  //     //   line: [{ x: x1, y: params.brick.position.y + params.brick.height }, { x: params.brick.position.x + params.brick.width, y: params.brick.position.y + params.brick.height }],
  //     //   direction: { x: 0.5, y: -0.5 },
  //     //   rotation: 0,
  //     //   spin: _.random(-1, 1),
  //     //   speed: 0.05
  //     // }, {
  //       line: [{ x: params.brick.position.x, y: params.brick.position.y + params.brick.height }, { x: x2, y: params.brick.position.y + params.brick.height }],
  //       direction: { x: -0.5, y: 0.5 },
  //       rotation: 0,
  //       spin: _.random(-1, 1, true),
  //       speed: 0.05
  //     }, {
  //     //   line: [{ x: x2, y: params.brick.position.y + params.brick.height }, { x: params.brick.position.x + params.brick.width, y: params.brick.position.y + params.brick.height }],
  //     //   direction: { x: 0.5, y: 0.5 },
  //     //   rotation: 0,
  //     //   spin: -1,
  //     //   speed: 0.05
  //     // }, {
  //       line: [{ x: params.brick.position.x, y: params.brick.position.y }, { x: params.brick.position.x, y: params.brick.position.y + params.brick.height }],
  //       direction: { x: -0.8, y: 0 },
  //       rotation: 0,
  //       spin: _.random(-1, 1, true),
  //       speed: 0.05
  //     }, {
  //       line: [{ x: params.brick.position.x + params.brick.width, y: params.brick.position.y }, { x: params.brick.position.x + params.brick.width, y: params.brick.position.y + params.brick.height }],
  //       direction: { x: 0.8, y: 0 },
  //       rotation: 0,
  //       spin: _.random(-1, 1, true),
  //       speed: 0.05
  //     }
  //   ];

  //   this.particles = _.range(100).map(() => {
  //     return {
  //       color: params.brick.color,
  //       radius: 0.1,
  //       position: {
  //         x: params.brick.position.x + Math.random() * params.brick.width,
  //         y: params.brick.position.y + Math.random() * params.brick.height
  //       },
  //       direction: {
  //         x: 0,
  //         y: 1
  //       },
  //       speed: 0.05,
  //       rotation: 0,
  //       spin: 0
  //     };
  //   });
  // }

  normalizeDirection(direction) {
    let norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (norm !== 0) {
      direction.x = direction.x / norm;
      direction.y = direction.y / norm;
    }
    return direction;
  }

  getContactBox(params, contactPoint) {
    let contactBoxDimen = params.brick.height / 2;
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
    let numPoints = 100;
    let contactPoint = {
      x: _.clamp(params.ball.position.x, params.brick.position.x, params.brick.position.x + params.brick.width),
      y: _.clamp(params.ball.position.y, params.brick.position.y, params.brick.position.y + params.brick.height)
    };
    let contactBox = this.getContactBox(params, contactPoint);
    for (let i = 0; i < numPoints / 2; i++) {
      sites.push({
        x: Math.random() * (contactBox.lr.x - contactBox.ul.x) + contactBox.ul.x,
        y: Math.random() * (contactBox.lr.y - contactBox.ul.y) + contactBox.ul.y
      });
    }
    for (let i = 0; i < numPoints / 2; i++) {
      sites.push({
        x: Math.random() * params.brick.width + params.brick.position.x,
        y: Math.random() * params.brick.height + params.brick.position.y
      });
    }

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
      return Object.assign(cell, {
        direction: this.normalizeDirection({
          x: cell.site.x - params.ball.position.x,
          y: cell.site.y - params.ball.position.y
        }),
        // direction: this.normalizeDirection({
        //   x: center.x - brickCenter.x,
        //   y: center.y - brickCenter.y
        // }),
        center: center,
        rotation: 0,
        spin: spin * _.random(1, 5, true),
        speed: 0.1,
        xdiff: 0,
        ydiff: 0
      });
    });
  }

  drawParticles(context) {
    // TODO: find a nice image
    for (const particle of this.particles) {
      context.save();
      context.globalAlpha = Math.max((this.duration - this.currentTime) / this.duration, 0);

      context.beginPath();
      context.arc(particle.position.x, particle.position.y, particle.radius, 0, 2 * Math.PI);
      context.closePath();

      context.fillStyle = particle.color;
      context.fill();
      context.strokeStyle = particle.color;
      context.stroke();

      context.restore();
    }
  }

  drawPieces(context) {
    for (const piece of this.pieces) {
      context.save();
      context.globalAlpha = Math.max((this.duration - this.currentTime) / this.duration, 0);

      if (piece.rotation) {
        context.translate(piece.center.x, piece.center.y);
        context.rotate((piece.rotation * Math.PI) / 180);
        context.translate(-piece.center.x, -piece.center.y);
      }
      //context.strokeStyle = this.color;
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

  // drawPieces(context) {
  //   for (const piece of this.pieces) {
  //     context.save();

  //     context.globalAlpha = Math.max((this.duration - this.currentTime) / this.duration, 0);
  //     context.beginPath();
  //     // TODO: use graphics lib
  //     if (piece.rotation) {
  //       let x = piece.line[0].x + Math.abs(piece.line[1].x - piece.line[0].x);
  //       let y = piece.line[0].y + Math.abs(piece.line[1].y - piece.line[0].y)
  //       context.translate(x, y);
  //       context.rotate((piece.rotation * Math.PI) / 180);
  //       context.translate(-x, -y);
  //     }
  //     context.moveTo(piece.line[0].x, piece.line[0].y);
  //     context.lineTo(piece.line[1].x, piece.line[1].y);
  //     context.closePath();

  //     context.strokeStyle = this.color;
  //     context.shadowColor = this.color;
  //     // TODO: remove game settings
  //     context.shadowBlur = this.gameSettings.brickShadowBlur * (1 - this.currentTime / this.duration);
  //     context.lineWidth = this.gameSettings.brickLineWidth;
  
  //     context.stroke();
  
  //     context.restore();
  //   }
  // }

  render(context) {
    this.drawPieces(context);
    //this.drawParticles(context);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;

    for (const piece of this.pieces) {
      piece.rotation += (elapsedTime / 50) * piece.spin;
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
