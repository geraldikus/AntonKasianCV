export type BuildSection = {
  title: string;
  body: string;
};

export type BuildDetails = {
  summary: string;
  diagram: string;
  sections: BuildSection[];
  snippet: { file: string; code: string };
};

export type Game = {
  id: string;
  title: string;
  subtitle: string;
  stack: string[];
  points: string[];
  build: BuildDetails;
  demo: string;
  repo: string;
  previewClass: "preview-slot" | "preview-contra";
};

export const games: Game[] = [
  {
    id: "slot",
    title: "Slot Machine Engine",
    subtitle: "Standalone 2D iGaming client",
    stack: ["TypeScript", "PixiJS", "GSAP", "Spine", "Supabase", "Vitest"],
    points: [
      "Seven-state round FSM: debit, spin, stop, present win, settle — plus error recovery.",
      "Two backends behind one interface: local mock data, or a Supabase Edge Function that owns the result.",
      "Deterministic reel stop: deceleration is simulated so the drum lands exactly on the server matrix.",
    ],
    build: {
      summary:
        "A PixiJS slot client where the round is a finite-state machine, the result comes from either a local mock or a real Edge Function, and the reels are forced to land on that matrix without snapping mid-spin.",
      diagram: `UI (Desktop / Mobile)
        │
        ▼
GameRoundMachine (FSM)
        │
        ├──► SlotEngine ──► Reel × 4
        │
        └──► SpinService
                ├── mock     (in-browser)
                └── supabase (Edge Function + Postgres)`,
      sections: [
        {
          title: "Round FSM",
          body: "GameRoundMachine walks a round through idle → debiting → spinning → stopping → presenting_win → settling → idle, plus an error state. Reels only stop when two flags are true: the network response arrived and the minimum spin time elapsed. Stale replies are dropped by requestId. On a network error the bet is refunded and the drums halt on the previous matrix.",
        },
        {
          title: "Mock vs Supabase",
          body: "SpinService exposes one requestSpin() and two sources. Mock generates the matrix in the browser with a 100–400 ms delay; a Demo Panel can arm the next spin as Slow (2.5–3.5 s) or Error, so latency and failures are testable without a server. Supabase signs in anonymously, then calls the Deno Edge Function spin: JWT and a bet whitelist are checked, balance is read from profiles, and apply_spin applies the result atomically. The server owns the outcome; the client only animates. Sources switch at runtime. Interrupting a live Supabase spin does not refund locally — the server already took the bet. cleanup_stale_demo_data deletes anonymous users and spins older than 24 hours.",
        },
        {
          title: "Deterministic reel stop",
          body: "Reel.stopSpin simulates the deceleration, counts how many times each cell wraps, and builds a symbol queue so the drum naturally lands on the server matrix. If a natural landing is impossible, one extra wrap is added. After that GSAP runs an elastic snap plus a squash/bounce on the reel layer.",
        },
        {
          title: "Win presentation",
          body: "A GSAP timeline dims non-winning symbols, shakes the screen, pops winning cells from the center, draws the payline, and runs a counting banner. A Spine alien tracks the pointer through eye bones and plays a reaction on a win.",
        },
        {
          title: "Platform & tests",
          body: "Desktop and mobile layout profiles rebuild the whole UI at 1024 px. Rendering and the GSAP timeline pause on visibilitychange and WebGL context loss — needed inside a WebView. Symbols ship as TexturePacker atlases; boot uses a Lottie launch screen. 44 Vitest tests cover win/lose matrix generation, FSM transitions, SpinService, and currency math.",
        },
      ],
      snippet: {
        file: "src/state/GameRoundMachine.ts",
        code: `private checkReadyToStop(): void {
  if (
    this._context.networkResponseReceived &&
    this._context.minSpinElapsed &&
    this._context.response
  ) {
    this.emit("effect", {
      type: "stop_reels",
      data: { matrix: this._context.response.matrix },
    });
    this.transition("stopping");
  }
}`,
      },
    },
    demo: "https://geraldikus.github.io/SlotMachine/",
    repo: "https://github.com/geraldikus/SlotMachine",
    previewClass: "preview-slot",
  },
  {
    id: "contra",
    title: "2D Action Platformer",
    subtitle: "Contra-inspired browser run-and-gun",
    stack: ["JavaScript (ES2022)", "PixiJS", "Vite", "Canvas"],
    points: [
      "Custom AABB with vertical vs horizontal resolution from the previous position.",
      "Weapon as Strategy: default gun or a 5-bullet spread, aiming in eight directions.",
      "Mobile: 1024×768 render buffer, CSS letterbox, and a DOM joystick that talks to the same KeyboardProcessor as the keyboard.",
    ],
    build: {
      summary:
        "A side-scrolling run-and-gun with the model split from the Pixi view, oriented AABB collisions, strategy-based weapons, and a mobile path that reuses desktop input.",
      diagram: `Pixi ticker
    │
    ▼
Game.update(delta)
    ├── entities[].update()
    ├── AABB damage checks
    └── platform collisions

Factories: Hero / Enemies / Bullets / Platforms / Powerups / Scene
Entity (model)  ◄──►  View (hitBox + collisionBox)`,
      sections: [
        {
          title: "Model vs view",
          body: "Entity owns gameplay state and delegates x/y to its _view. Each view exposes two boxes: collisionBox for platforms and hitBox for damage, so walking and taking hits never share the same rectangle.",
        },
        {
          title: "Physics",
          body: "Physics.isCheckAABB is a classic overlap test. getOrientCollisionResult then rewinds Y to prevPoint: if the overlap disappears, the hit was vertical and the actor stands on the platform; otherwise it was horizontal and X is restored. Jumping up goes through platforms; down + jump drops through.",
        },
        {
          title: "Weapons",
          body: "Weapon switches between defaultGunStrategy and spreadGunStrategy (five bullets in a 10° fan). HeroWeaponUnit maps arrow combinations to eight fire angles, including jump-down shots.",
        },
        {
          title: "Enemies & world",
          body: "Enemies stay dormant until the hero is within 512 px. A turret aims with atan2 and has 5 HP; runners sometimes jump on fall; the boss fires gravitable bullets; the bridge explodes behind the player. The camera only scrolls forward.",
        },
        {
          title: "Mobile & loop",
          body: "The renderer stays 1024×768; only the CSS size of the canvas scales, with letterboxing and a portrait-orientation warning. A DOM joystick and JUMP/SHOOT buttons call the same KeyboardProcessor as WASD, so touch adds no extra gameplay branch. Death respawns with a 1 s invincibility blink. Desktop and touch each have their own onboarding screen.",
        },
      ],
      snippet: {
        file: "src/Physics.js",
        code: `static getOrientCollisionResult(aaRect, bbRect, aaPrevPoint) {
  const collisionResult = { horizontal: false, vertical: false };
  if (!this.isCheckAABB(aaRect, bbRect)) {
    return collisionResult;
  }

  aaRect.y = aaPrevPoint.y;
  if (!this.isCheckAABB(aaRect, bbRect)) {
    collisionResult.vertical = true;
    return collisionResult;
  }

  collisionResult.horizontal = true;
  return collisionResult;
}`,
      },
    },
    demo: "https://geraldikus.github.io/Contra/",
    repo: "https://github.com/geraldikus/Contra",
    previewClass: "preview-contra",
  },
];
