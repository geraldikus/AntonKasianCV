# Anton Kasian — portfolio

Pixel / typewriter personal site. Vite + TypeScript + PixiJS.

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Deploy (GitHub Pages)

1. Create a public repo named `geraldikus.github.io`.
2. Push this project to `main`.
3. In the repo: **Settings → Pages → Source → GitHub Actions**.

The workflow in `.github/workflows/deploy.yml` builds with Vite and publishes `dist/`.
The live URL will be https://geraldikus.github.io/

The CV download is `public/Anton Kasian CV.pdf`.
