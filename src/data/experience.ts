export type Job = {
  role: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
};

export const experience: Job[] = [
  {
    role: "Team Lead / Senior Software Engineer",
    company: "Solid Apps LLC",
    period: "Apr 2024 — Present",
    location: "Remote",
    bullets: [
      "Led a team of 3 engineers: code reviews, sprint planning, architecture, onboarding.",
      "Shipped production web services and interactive paywall / subscription flows.",
      "Optimized loading, asset caching, and layouts for embedded WKWebView viewports.",
      "Integrated REST APIs, Firebase Analytics, AppsFlyer, and Codemagic CI/CD.",
    ],
  },
  {
    role: "Software Engineer (iOS / Mobile)",
    company: "Effective Mobile",
    period: "Oct 2023 — Apr 2024",
    location: "Remote",
    bullets: [
      "Built core features for a commercial mobile app in Swift and UIKit.",
      "Migrated persistence from Core Data to Realm, improving query speed and stability.",
      "Refactored UI modules and wired Combine for reactive async streams.",
    ],
  },
];

export const education = {
  degree: "Bachelor’s Degree in Engineering",
  school: "Saint Petersburg State University of Railway Engineering",
  period: "2016 — 2021",
};

export const languages = [
  { name: "English", level: "Fluent" },
  { name: "Russian", level: "Native" },
  { name: "Finnish", level: "A1" },
];
