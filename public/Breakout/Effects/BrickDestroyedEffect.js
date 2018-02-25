import Effect from "../../Engine/Effects/Effect.js"

export default class BrickDestroyedEffect extends Effect {
  constructor(params) {
    super(params);
    this.init(params);
  }
  
  init(params) {
    this.currentTime = 0;
    this.color = params.brick.color;
    
    //let x1 = _.random(params.brick.position.x, params.brick.position.x + params.brick.width);
    let x1 = params.brick.position.x + params.brick.width;
    let x2 = x1;
    //let x2 = params.brick.position.x + ((params.brick.position.x + params.brick.width) - x1);
    this.pieces = [
      {
        line: [{ x: params.brick.position.x, y: params.brick.position.y }, { x: x1, y: params.brick.position.y }],
        direction: { x: -0.5, y: -0.5 },
        rotation: 0,
        spin: _.random(-1, 1, true),
        speed: 0.05
      }, {
      //   line: [{ x: x1, y: params.brick.position.y + params.brick.height }, { x: params.brick.position.x + params.brick.width, y: params.brick.position.y + params.brick.height }],
      //   direction: { x: 0.5, y: -0.5 },
      //   rotation: 0,
      //   spin: _.random(-1, 1),
      //   speed: 0.05
      // }, {
        line: [{ x: params.brick.position.x, y: params.brick.position.y + params.brick.height }, { x: x2, y: params.brick.position.y + params.brick.height }],
        direction: { x: -0.5, y: 0.5 },
        rotation: 0,
        spin: _.random(-1, 1, true),
        speed: 0.05
      }, {
      //   line: [{ x: x2, y: params.brick.position.y + params.brick.height }, { x: params.brick.position.x + params.brick.width, y: params.brick.position.y + params.brick.height }],
      //   direction: { x: 0.5, y: 0.5 },
      //   rotation: 0,
      //   spin: -1,
      //   speed: 0.05
      // }, {
        line: [{ x: params.brick.position.x, y: params.brick.position.y }, { x: params.brick.position.x, y: params.brick.position.y + params.brick.height }],
        direction: { x: -0.8, y: 0 },
        rotation: 0,
        spin: _.random(-1, 1, true),
        speed: 0.05
      }, {
        line: [{ x: params.brick.position.x + params.brick.width, y: params.brick.position.y }, { x: params.brick.position.x + params.brick.width, y: params.brick.position.y + params.brick.height }],
        direction: { x: 0.8, y: 0 },
        rotation: 0,
        spin: _.random(-1, 1, true),
        speed: 0.05
      }
    ];

    this.particles = _.range(100).map(() => {
      return {
        color: params.brick.color,
        radius: 0.1,
        position: {
          x: params.brick.position.x + Math.random() * params.brick.width,
          y: params.brick.position.y + Math.random() * params.brick.height
        },
        direction: {
          x: 0,
          y: 1
        },
        speed: 0.05,
        rotation: 0,
        spin: 0
      };
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
      context.beginPath();
      // TODO: use graphics lib
      if (piece.rotation) {
        let x = piece.line[0].x + Math.abs(piece.line[1].x - piece.line[0].x);
        let y = piece.line[0].y + Math.abs(piece.line[1].y - piece.line[0].y)
        context.translate(x, y);
        context.rotate((piece.rotation * Math.PI) / 180);
        context.translate(-x, -y);
      }
      context.moveTo(piece.line[0].x, piece.line[0].y);
      context.lineTo(piece.line[1].x, piece.line[1].y);
      context.closePath();

      context.strokeStyle = this.color;
      context.shadowColor = this.color;
      // TODO: remove game settings
      context.shadowBlur = this.gameSettings.brickShadowBlur * (1 - this.currentTime / this.duration);
      context.lineWidth = this.gameSettings.brickLineWidth;
  
      context.stroke();
  
      context.restore();
    }
  }

  render(context) {
    this.drawPieces(context);
    this.drawParticles(context);
  }

  update(elapsedTime) {
    this.currentTime += elapsedTime;

    for (const piece of this.pieces) {
      piece.rotation += (elapsedTime / 50) * piece.spin;
      for (const point of piece.line) {
        point.x += elapsedTime * piece.speed * piece.direction.x;
        point.y += elapsedTime * piece.speed * piece.direction.y;
      }
    }

    for (const particle of this.particles) {
      particle.rotation += (elapsedTime / 50) * particle.spin;
      particle.position.x += elapsedTime * particle.speed * particle.direction.x;
      particle.position.y += elapsedTime * particle.speed * particle.direction.y;
    }

    if (this.currentTime >= this.duration) {
      this.done = true;
    }
  }
}
