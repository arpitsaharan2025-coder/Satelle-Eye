# AI Satellite Imaging Website

A React + TypeScript + Vite front-end for an AI-assisted satellite imaging / disaster-tracking dashboard.

## Running locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## Building for production

```bash
npm run build
```

Output goes to `dist/`. Preview it locally with `npm run preview`.

## Deploying

### Vercel
Import the repo at vercel.com/new — Vercel auto-detects Vite. A `vercel.json` is included with the correct build command, output directory, and SPA rewrite rule, so no manual config is needed.

### Netlify
Import the repo at app.netlify.com — a `netlify.toml` is included with the build command, publish directory, and SPA redirect rule already set up.

## Notes

- The background video lives at `src/imports/space-background.mp4`. If you swap it out, keep the file muted-friendly (no audio needed since it always plays muted) and re-encode with `-movflags +faststart` so browsers can start playing it before the whole file downloads.
- API keys for OpenWeather, N2YO, and Gemini are hardcoded directly inside the files in `src/app/services/`. That's fine for a class project, but since this is a client-side app, anyone can see those keys in the deployed JS bundle (view-source or devtools). Swap in your own keys before sharing publicly, and don't reuse ones tied to a paid account.
