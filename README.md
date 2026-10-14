# Anton Kasian — portfolio

Pixel / typewriter personal site. Vite + TypeScript + PixiJS.

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy (GitHub Pages)

Repo: `geraldikus/AntonKasianCV`. Vite `base` is `/AntonKasianCV/`.

1. Push `main`.
2. In the repo: **Settings → Pages → Source → GitHub Actions**.
3. Approve the `github-pages` environment on the first run if GitHub asks.

The workflow in `.github/workflows/deploy.yml` builds with Vite and publishes `dist/`.
The live URL: https://geraldikus.github.io/AntonKasianCV/

The CV download is `public/Anton Kasian CV.pdf`.
