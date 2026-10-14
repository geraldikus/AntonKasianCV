import { Container, Sprite, Texture } from "pixi.js";

type Particle = {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  active: boolean;
};

export class ParticlePool {
  private idle: Particle[] = [];
  private live: Particle[] = [];

  constructor(
    parent: Container,
    texture: Texture,
    size = 56,
  ) {
    for (let i = 0; i < size; i += 1) {
      const sprite = new Sprite(texture);
      sprite.visible = false;
      sprite.anchor.set(0.5);
      sprite.scale.set(3);
      parent.addChild(sprite);
      this.idle.push({
        sprite,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        active: false,
      });
    }
  }

  setTexture(texture: Texture): void {
    for (const particle of [...this.idle, ...this.live]) {
      particle.sprite.texture = texture;
    }
  }

  burst(x: number, y: number, count = 10): void {
    for (let i = 0; i < count; i += 1) {
      const particle = this.idle.pop();
      if (!particle) return;
      particle.active = true;
      particle.life = 0.35 + Math.random() * 0.35;
      particle.maxLife = particle.life;
      particle.vx = (Math.random() - 0.5) * 220;
      particle.vy = -80 - Math.random() * 180;
      particle.sprite.x = x;
      particle.sprite.y = y;
      particle.sprite.alpha = 1;
      particle.sprite.visible = true;
      this.live.push(particle);
    }
  }

  update(dt: number): void {
    for (let i = this.live.length - 1; i >= 0; i -= 1) {
      const particle = this.live[i];
      particle.life -= dt;
      particle.vy += 420 * dt;
      particle.sprite.x += particle.vx * dt;
      particle.sprite.y += particle.vy * dt;
      particle.sprite.alpha = Math.max(0, particle.life / particle.maxLife);
      if (particle.life <= 0) {
        particle.active = false;
        particle.sprite.visible = false;
        this.live.splice(i, 1);
        this.idle.push(particle);
      }
    }
  }
}
