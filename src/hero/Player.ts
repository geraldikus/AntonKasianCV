import { Sprite } from "pixi.js";
import type { SpriteSheet } from "./sprites";

export type PlayerState = "idle" | "run" | "jump" | "fall";

const SCALE = 4;
const GRAVITY = 1800;
const JUMP = -560;
const RUN_SPEED = 92;

export class Player {
  readonly sprite: Sprite;
  vx = RUN_SPEED;
  vy = 0;
  onGround = true;
  state: PlayerState = "run";
  private frame = 0;
  private anim = 0;

  constructor(private sheet: SpriteSheet) {
    this.sprite = new Sprite(sheet.run[0]);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.set(SCALE);
  }

  setSheet(sheet: SpriteSheet): void {
    this.sheet = sheet;
    this.applyFrame();
  }

  get x(): number {
    return this.sprite.x;
  }

  set x(value: number) {
    this.sprite.x = value;
  }

  get y(): number {
    return this.sprite.y;
  }

  set y(value: number) {
    this.sprite.y = value;
  }

  jump(): boolean {
    if (!this.onGround) return false;
    this.vy = JUMP;
    this.onGround = false;
    this.state = "jump";
    this.applyFrame();
    return true;
  }

  update(dt: number, groundY: number, width: number, scrollBoost: number): void {
    const speed = RUN_SPEED + scrollBoost;
    this.vx = Math.sign(this.vx || 1) * speed;

    this.vy += GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const pad = 18;
    if (this.x > width - pad) {
      this.x = width - pad;
      this.vx = -speed;
    } else if (this.x < pad) {
      this.x = pad;
      this.vx = speed;
    }

    if (this.y >= groundY) {
      const wasAir = !this.onGround;
      this.y = groundY;
      this.vy = 0;
      this.onGround = true;
      this.state = "run";
      if (wasAir) this.landed = true;
    } else {
      this.onGround = false;
      this.state = this.vy < 0 ? "jump" : "fall";
    }

    this.sprite.scale.x = (this.vx >= 0 ? 1 : -1) * SCALE;
    this.anim += dt;
    if (this.anim > 0.12) {
      this.anim = 0;
      this.frame = (this.frame + 1) % 2;
    }
    this.applyFrame();
  }

  landed = false;

  private applyFrame(): void {
    if (this.state === "run") {
      this.sprite.texture = this.sheet.run[this.frame];
      return;
    }
    if (this.state === "idle") {
      this.sprite.texture = this.sheet.idle;
      return;
    }
    this.sprite.texture = this.sheet.jump;
  }
}
