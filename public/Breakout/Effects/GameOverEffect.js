import Effect from "../../Engine/Effects/Effect.js"
import Text from "../../Graphics/Text.js"

export default class GameOverEffect extends Effect {
  constructor(params) {
    super(params);
    this.init(params);
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

  normalizeDirection(direction) {
    let norm = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
    if (norm !== 0) {
      direction.x = direction.x / norm;
      direction.y = direction.y / norm;
    }
    return direction;
  }

  generatePieces(params) {
    let voronoi = new Voronoi();
    let box = {
      xl: 0,
      xr: params.canvas.width,
      yt: 0,
      yb: params.canvas.height
    };
    let sites = [];
    let numPoints = 100;
    for (let i = 0; i < numPoints; i++) {
      sites.push({
        x: Math.random() * box.xr * 3/4 + box.xr / 8,
        y: Math.random() * box.yb * 3/4 + box.yb / 8
      });
    }
    // for (let i = 0; i < numPoints; i++) {
    //   sites.push({
    //     x: Math.random() * this.canvas.width,
    //     y: Math.random() * this.canvas.height
    //   });
    // }

    // TODO: merge random neighbors to get more of a shattering effect
    let results = voronoi.compute(sites, box).cells;
    //this.finishResults(results);
    this.pieces = results.map((cell) => {
      return Object.assign(cell, {
        direction: this.normalizeDirection({
          x: 0,
          y: _.random(0.5, 1, true)
        }),
        // direction: this.normalizeDirection({
        //   x: center.x - brickCenter.x,
        //   y: center.y - brickCenter.y
        // }),
        center: this.getCenter(cell),
        rotation: 0,
        spin: _.random(-3.5, 3.5, true),
        speed: _.random(0.75, 1, true),
        delay: _.random(1000, 2000),
        scale: 1,
        xdiff: 0,
        ydiff: 0
      });
    });
  }

  init(params) {
    this.image = new Image();
    this.image.src = this.canvas.toDataURL("image/png");
    this.generatePieces(params);
  }

  drawPieces(context) {
    for (const piece of this.pieces) {
      context.save();

      if (piece.rotation) {
        context.translate(piece.center.x, piece.center.y);
        context.rotate((piece.rotation * Math.PI) / 180);
        context.translate(-piece.center.x, -piece.center.y);
      }
      context.strokeStyle = "grey";
      context.fillStyle = "black";
      context.lineWidth = 2;

      context.beginPath();
      context.moveTo(piece.halfedges[0].getStartpoint().x + piece.xdiff,
        piece.halfedges[0].getStartpoint().y + piece.ydiff);
      for (const edge of piece.halfedges) {
        context.lineTo(edge.getEndpoint().x + piece.xdiff, edge.getEndpoint().y + piece.ydiff);
      }
  
      context.stroke();
      context.clip();
      //context.scale(1, piece.scale);
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      context.translate(piece.xdiff, piece.ydiff);
      context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

      context.closePath();
      context.restore();

      // Draw image
      // context.save();
      // if (piece.rotation) {
      //   context.translate(piece.center.x, piece.center.y);
      //   context.rotate((piece.rotation * Math.PI) / 180);
      //   context.translate(-piece.center.x, -piece.center.y);
      // }
      // context.beginPath();
      // context.moveTo(piece.halfedges[0].getStartpoint().x + piece.xdiff,
      //   piece.halfedges[0].getStartpoint().y + piece.ydiff);
      // for (const edge of piece.halfedges) {
      //   context.lineTo(edge.getEndpoint().x + piece.xdiff, edge.getEndpoint().y + piece.ydiff);
      // }
  
      // context.closePath();

      // context.restore();
    }
  }

  // TODO: falling bricks that break on GAME OVER text (or randomly in air or on ground)
  // TODO: partices come out of destroyed bricks

  render(context) {
    this.drawPieces(context);
    //this.drawParticles(context);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;

    for (const piece of this.pieces) {
      if (this.currentTime < piece.delay) continue;
      piece.rotation += (elapsedTime / 50) * piece.spin;
      let spin = piece.scale > 0 ? -1 : 1;
      //piece.scale -= (elapsedTime / 5000) * piece.spin * spin;
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
