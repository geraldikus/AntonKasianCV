import {
  Application,
  Container,
  Sprite,
  Text,
  TextStyle,
} from "pixi.js";
import { collectibleSkills } from "../data/skills";
import { ParticlePool } from "./ParticlePool";
import { Player } from "./Player";
import { makeSheet, type SpriteSheet } from "./sprites";

const SCALE = 4;

type Coin = {
  sprite: Sprite;
  label: string;
  taken: boolean;
  baseY: number;
  phase: number;
};

export class HeroScene {
  private app!: Application;
  private world = new Container();
  private clouds = new Container();
  private ground = new Container();
  private fx = new Container();
  private labels = new Container();
  private player!: Player;
  private pool!: ParticlePool;
  private sheet!: SpriteSheet;
  private coins: Coin[] = [];
  private collected = 0;
  private paused = false;
  private lastScroll = 0;
  private scrollBoost = 0;
  private observer?: IntersectionObserver;
  private host!: HTMLElement;
  private hud?: HTMLElement;
  private unbind: Array<() => void> = [];

  static async mount(host: HTMLElement, hud?: HTMLElement): Promise<HeroScene | null> {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      host.classList.add("hero-static");
      return null;
    }

    const scene = new HeroScene();
    await scene.init(host, hud);
    return scene;
  }

  private async init(host: HTMLElement, hud?: HTMLElement): Promise<void> {
    this.host = host;
    this.hud = hud;
    this.app = new Application();
    await this.app.init({
      background: 0x9ad0ff,
      resizeTo: host,
      antialias: false,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      roundPixels: true,
    });
    this.app.canvas.classList.add("pixel");
    host.appendChild(this.app.canvas);

    this.sheet = makeSheet();
    this.app.stage.addChild(this.clouds, this.world);
    this.world.addChild(this.ground, this.fx);
    this.player = new Player(this.sheet);
    this.world.addChild(this.player.sprite);
    this.pool = new ParticlePool(this.fx, this.sheet.particle);
    this.world.addChild(this.labels);

    this.layout();
    this.spawnDecor();
    this.spawnCoins();
    this.player.x = 72;
    this.player.y = this.groundY;

    this.app.ticker.add((ticker) => this.update(ticker.deltaMS / 1000));
    this.bind();
    this.app.ticker.start();
    this.app.render();
    this.updateHud();
  }

  private get groundY(): number {
    return this.app.renderer.height - 8 * SCALE + 4;
  }

  private layout(): void {
    this.ground.removeChildren();
    const tileW = this.sheet.ground.width * SCALE;
    const count = Math.ceil(this.app.renderer.width / tileW) + 2;
    for (let i = 0; i < count; i += 1) {
      const tile = new Sprite(this.sheet.ground);
      tile.scale.set(SCALE);
      tile.x = i * tileW;
      tile.y = this.app.renderer.height - tile.height;
      this.ground.addChild(tile);
    }
  }

  private spawnDecor(): void {
    this.clouds.removeChildren();
    const width = this.app.renderer.width;
    for (let i = 0; i < 4; i += 1) {
      const cloud = new Sprite(this.sheet.cloud);
      cloud.scale.set(3);
      cloud.x = (width / 4) * i + 20;
      cloud.y = 12 + (i % 2) * 18;
      cloud.alpha = 0.95;
      this.clouds.addChild(cloud);
    }
  }

  private spawnCoins(): void {
    for (const coin of this.coins) coin.sprite.destroy();
    this.coins = [];
    this.labels.removeChildren();
    const width = Math.max(this.app.renderer.width, 320);
    collectibleSkills.forEach((label, index) => {
      const sprite = new Sprite(this.sheet.coin[0]);
      sprite.anchor.set(0.5);
      sprite.scale.set(SCALE);
      const x = 90 + ((index + 1) * (width - 140)) / (collectibleSkills.length + 1);
      const y = this.groundY - 28;
      sprite.x = x;
      sprite.y = y;
      this.world.addChild(sprite);
      this.coins.push({
        sprite,
        label,
        taken: false,
        baseY: y,
        phase: index * 0.7,
      });
    });
  }

  private bind(): void {
    const onJump = (event: Event) => {
      if ((event.target as HTMLElement | null)?.closest("a, button, input, textarea, dialog")) {
        return;
      }
      if (event instanceof KeyboardEvent && event.code !== "Space") return;
      if (event instanceof KeyboardEvent) event.preventDefault();
      this.tryJump();
    };

    this.host.addEventListener("pointerdown", onJump);
    window.addEventListener("keydown", onJump);
    this.unbind.push(() => this.host.removeEventListener("pointerdown", onJump));
    this.unbind.push(() => window.removeEventListener("keydown", onJump));

    const onResize = () => {
      this.layout();
      this.player.y = Math.min(this.player.y, this.groundY);
    };
    window.addEventListener("resize", onResize);
    this.unbind.push(() => window.removeEventListener("resize", onResize));

    const onScroll = () => {
      const y = window.scrollY;
      this.scrollBoost = Math.max(-20, Math.min(70, y - this.lastScroll));
      this.lastScroll = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    this.unbind.push(() => window.removeEventListener("scroll", onScroll));

    const syncTicker = () => {
      if (this.paused || document.hidden) this.app.ticker.stop();
      else this.app.ticker.start();
    };
    document.addEventListener("visibilitychange", syncTicker);
    this.unbind.push(() => document.removeEventListener("visibilitychange", syncTicker));

    this.observer = new IntersectionObserver((entries) => {
      this.paused = !entries.some((entry) => entry.isIntersecting);
      syncTicker();
    }, { threshold: 0.01 });
    this.observer.observe(this.host);
  }

  private tryJump(): void {
    if (this.player.jump()) {
      this.pool.burst(this.player.x, this.player.y - 4, 6);
    }
  }

  private update(dt: number): void {
    this.scrollBoost *= 0.9;
    this.player.update(dt, this.groundY, this.app.renderer.width, this.scrollBoost);
    if (this.player.landed) {
      this.pool.burst(this.player.x, this.player.y, 8);
      this.player.landed = false;
    }
    this.pool.update(dt);

    for (const coin of this.coins) {
      if (coin.taken) continue;
      coin.phase += dt * 3;
      coin.sprite.y = coin.baseY + Math.sin(coin.phase) * 6;
      coin.sprite.texture = this.sheet.coin[Math.sin(coin.phase) > 0 ? 0 : 1];
      const dx = coin.sprite.x - this.player.x;
      const dy = coin.sprite.y - (this.player.y - 28);
      if (dx * dx + dy * dy < 28 * 28) this.collect(coin);
    }

    this.clouds.children.forEach((cloud, index) => {
      cloud.x -= (8 + index * 3) * dt;
      if (cloud.x < -80) cloud.x = this.app.renderer.width + 20;
    });
  }

  private collect(coin: Coin): void {
    coin.taken = true;
    coin.sprite.visible = false;
    this.collected += 1;
    this.pool.burst(coin.sprite.x, coin.sprite.y, 14);
    this.spawnLabel(coin.label, coin.sprite.x, coin.sprite.y);
    this.updateHud();
    if (this.collected >= collectibleSkills.length) {
      window.setTimeout(() => {
        this.collected = 0;
        this.spawnCoins();
        this.updateHud();
      }, 2000);
    }
  }

  private spawnLabel(text: string, x: number, y: number): void {
    const label = new Text({
      text,
      style: new TextStyle({
        fontFamily: "VT323, monospace",
        fontSize: 20,
        fill: "#d94f30",
      }),
    });
    label.anchor.set(0.5, 1);
    label.x = x;
    label.y = y - 10;
    this.labels.addChild(label);
    const started = performance.now();
    const tick = () => {
      const t = (performance.now() - started) / 700;
      label.y = y - 10 - t * 28;
      label.alpha = 1 - t;
      if (t >= 1) {
        label.destroy();
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  private updateHud(): void {
    if (!this.hud) return;
    this.hud.textContent = `SKILLS ${this.collected}/${collectibleSkills.length}`;
  }

  destroy(): void {
    this.observer?.disconnect();
    for (const fn of this.unbind) fn();
    this.app.destroy(true);
  }
}
