import { education, experience, languages } from "./data/experience";
import { games, type Game } from "./data/games";
import { profile } from "./data/profile";
import { skillGroups } from "./data/skills";

const symbols = ["7", "★", "K", "A", "♦", "Q", "BAR", "9"];

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slotPreview(): string {
  const reel = (offset: number) =>
    `<div class="reel"><div class="reel-strip">${[...symbols, ...symbols]
      .map((sym, i) => `<div class="sym" style="animation-delay:${offset + i * 40}ms">${sym}</div>`)
      .join("")}</div></div>`;
  return `<div class="preview preview-slot pixel-box" aria-hidden="true">
    <div class="slot-lamp">HOLD SPIN</div>
    <div class="reels">${reel(0)}${reel(80)}${reel(140)}</div>
  </div>`;
}

function contraPreview(): string {
  return `<div class="preview preview-contra pixel-box" aria-hidden="true">
    <div class="runner"></div>
    <div class="bullet"></div>
    <div class="enemy"></div>
  </div>`;
}

function gameCard(game: Game): string {
  const preview = game.previewClass === "preview-slot" ? slotPreview() : contraPreview();
  return `<article class="game-card pixel-box" data-reveal>
    ${preview}
    <div class="game-body">
      <h3>${game.title}</h3>
      <p class="game-sub">${game.subtitle}</p>
      <div class="tags">${game.stack.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      <ul class="points">${game.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      <div class="game-actions">
        <button class="btn" data-play="${game.id}">▶ PLAY</button>
        <button class="btn btn-ghost" data-build="${game.id}">HOW IT'S BUILT →</button>
        <a class="btn btn-ghost" href="${game.repo}" target="_blank" rel="noreferrer">SOURCE</a>
      </div>
    </div>
  </article>`;
}

function renderBuild(game: Game): string {
  const { build } = game;
  const sections = build.sections
    .map(
      (section) => `<article class="build-section">
        <h3>${escapeHtml(section.title)}</h3>
        <p>${escapeHtml(section.body)}</p>
      </article>`,
    )
    .join("");
  const next = build.next.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<p class="build-summary">${escapeHtml(build.summary)}</p>
    <pre class="build-diagram pixel-box">${escapeHtml(build.diagram)}</pre>
    ${sections}
    <article class="build-section">
      <h3>Code</h3>
      <p class="build-file">${escapeHtml(build.snippet.file)}</p>
      <pre class="build-snippet pixel-box"><code>${escapeHtml(build.snippet.code)}</code></pre>
    </article>
    <article class="build-section">
      <h3>What I'd do next</h3>
      <ul class="points">${next}</ul>
    </article>`;
}

function setModalOpen(open: boolean): void {
  document.documentElement.classList.toggle("modal-open", open);
}

export function renderContent(): void {
  const gamesRoot = document.getElementById("games-list");
  if (gamesRoot) gamesRoot.innerHTML = games.map(gameCard).join("");

  const xpRoot = document.getElementById("experience-list");
  if (xpRoot) {
    xpRoot.innerHTML = experience
      .map(
        (job) => `<li class="job" data-reveal>
          <h3 class="job-role">${job.role}</h3>
          <p class="job-meta">${job.company} · ${job.location} · ${job.period}</p>
          <ul class="points">${job.bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul>
        </li>`,
      )
      .join("");
  }

  const edu = document.getElementById("education");
  if (edu) {
    edu.innerHTML = `<p><strong>${education.degree}</strong><br>${education.school}<br>${education.period}</p>
      <p>${languages.map((lang) => `${lang.name}: ${lang.level}`).join(" · ")}</p>`;
  }

  const skillsRoot = document.getElementById("skills-list");
  if (skillsRoot) {
    skillsRoot.innerHTML = skillGroups
      .map(
        (group) => `<div class="skill-block" data-reveal>
          <h3>${group.title}</h3>
          <div class="tags">${group.items.map((item) => `<span class="tag">${item}</span>`).join("")}</div>
        </div>`,
      )
      .join("");
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const mail = document.getElementById("mail-link");
  if (mail instanceof HTMLAnchorElement) mail.href = `mailto:${profile.email}`;
}

export function initPlayModal(): void {
  const playModal = document.getElementById("play-modal");
  const frame = document.getElementById("play-frame");
  const playTitle = document.getElementById("play-title");
  const playSource = document.getElementById("play-source");
  const fullscreen = document.getElementById("play-fullscreen");
  const buildModal = document.getElementById("build-modal");
  const buildTitle = document.getElementById("build-title");
  const buildBody = document.getElementById("build-body");
  const buildSource = document.getElementById("build-source");
  const buildPlay = document.getElementById("build-play");

  if (
    !(playModal instanceof HTMLDialogElement) ||
    !(frame instanceof HTMLIFrameElement) ||
    !playTitle ||
    !(playSource instanceof HTMLAnchorElement) ||
    !fullscreen ||
    !(buildModal instanceof HTMLDialogElement) ||
    !buildTitle ||
    !buildBody ||
    !(buildSource instanceof HTMLAnchorElement) ||
    !buildPlay
  ) {
    return;
  }

  let activeBuildId: string | null = null;

  const openGame = (id: string) => {
    const game = games.find((item) => item.id === id);
    if (!game) return;
    if (buildModal.open) buildModal.close();
    playTitle.textContent = game.title;
    playSource.href = game.repo;
    frame.src = game.demo;
    playModal.showModal();
    setModalOpen(true);
  };

  const closeGame = () => {
    frame.src = "about:blank";
    if (playModal.open) playModal.close();
    if (!buildModal.open) setModalOpen(false);
  };

  const openBuild = (id: string) => {
    const game = games.find((item) => item.id === id);
    if (!game) return;
    activeBuildId = id;
    buildTitle.textContent = `${game.title} — how it's built`;
    buildBody.innerHTML = renderBuild(game);
    buildSource.href = game.repo;
    buildModal.showModal();
    setModalOpen(true);
    buildBody.scrollTop = 0;
  };

  const closeBuild = () => {
    if (buildModal.open) buildModal.close();
    if (!playModal.open) setModalOpen(false);
  };

  document.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-play], [data-build]");
    if (!target) return;
    if (target.dataset.play) {
      openGame(target.dataset.play);
      return;
    }
    if (target.dataset.build) openBuild(target.dataset.build);
  });

  playModal.querySelector("[data-close]")?.addEventListener("click", closeGame);
  playModal.addEventListener("close", () => {
    frame.src = "about:blank";
    if (!buildModal.open) setModalOpen(false);
  });
  playModal.addEventListener("click", (event) => {
    if (event.target === playModal) closeGame();
  });
  fullscreen.addEventListener("click", () => {
    frame.requestFullscreen?.().catch(() => undefined);
  });

  buildModal.querySelector("[data-close]")?.addEventListener("click", closeBuild);
  buildModal.addEventListener("close", () => {
    if (!playModal.open) setModalOpen(false);
  });
  buildModal.addEventListener("click", (event) => {
    if (event.target === buildModal) closeBuild();
  });
  buildPlay.addEventListener("click", () => {
    if (activeBuildId) openGame(activeBuildId);
  });
}
