import "@fontsource/vt323";
import "@fontsource/courier-prime";
import "@fontsource/courier-prime/700.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import { profile } from "./data/profile";
import { initMotion } from "./motion";
import { typewrite } from "./typewriter";
import { initPlayModal, renderContent } from "./ui";

renderContent();
initPlayModal();

const nameEl = document.getElementById("typewriter");
if (nameEl) {
  void typewrite(nameEl, profile.name);
}

void initMotion();

const stage = document.getElementById("hero-canvas");
const hud = document.getElementById("skill-count");
if (stage) {
  window.setTimeout(() => {
    void import("./hero/HeroScene").then(({ HeroScene }) => {
      void HeroScene.mount(stage, hud ?? undefined);
    });
  }, 200);
}
