export type SkillGroup = {
  title: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend & Game",
    items: [
      "TypeScript",
      "JavaScript (ES6+)",
      "PixiJS",
      "GSAP",
      "HTML5 Canvas",
      "WebGL",
      "Vite",
      "CSS3",
      "TexturePacker",
      "Spine 2D",
    ],
  },
  {
    title: "Architecture",
    items: [
      "Finite State Machine",
      "Game Loop",
      "Object Pooling",
      "Event-Driven",
      "Component-Based",
    ],
  },
  {
    title: "Mobile & Web",
    items: [
      "WKWebView",
      "Cross-browser",
      "Swift",
      "REST APIs",
      "JSON",
    ],
  },
  {
    title: "Tools",
    items: [
      "Git",
      "GitHub Pages",
      "CI/CD",
      "Firebase",
      "AppsFlyer",
      "Supabase",
      "Figma",
    ],
  },
];

export const collectibleSkills = [
  "TS",
  "Pixi",
  "GSAP",
  "FSM",
  "Pool",
  "WebGL",
  "Vite",
  "Spine",
];
