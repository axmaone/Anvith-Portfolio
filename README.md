# Anvith M Acharya: portfolio

A personal site built as one ICAD session: **Interest → Concept → Application → Debrief**.
Built with [Astro](https://astro.build), GSAP and Lenis, and hosted free on Vercel.

## Change the words

| What | Where |
|---|---|
| Name, email, links, hero text, about, journey, skills, poems, companion lines | `src/data/site.ts` |
| Case studies | `src/content/work/*.md` (one file each) |
| Photos | `public/img/` |
| Videos and their poster images | `public/video/` |
| CV | `public/Anvith-M-Acharya-CV.pdf` |

Anything marked `TODO` is waiting for your input.

### Add a LinkedIn or Instagram link
Open `src/data/site.ts` and paste the URL between the quotes in `links`.

### Add a case study
1. Copy `src/content/work/_template.md` and rename it, e.g. `storyline-module.md`. The name must not start with `_`.
2. Put images in `public/img/` and videos in `public/video/`. Keep videos under about 10 MB: 1280 px wide, H.264.
3. Fill in the fields at the top, set `draft: false`, and write the story underneath.

### Publish
Every push to the `main` branch on GitHub redeploys the site on Vercel automatically, in about a minute.

You can edit straight on github.com: open a file, click the pencil icon, then **Commit changes**. That counts as a push.

## Run it on this PC

```bash
npm install
npm run dev
```

Then open http://localhost:4321. Run `npm run build` to check that the production build works.

## Free-plan notes (Vercel Hobby)
- Free for personal, non-commercial sites. Your URL is `something.vercel.app`.
- About 100 GB of bandwidth a month, far more than a portfolio uses.
- Keep the repository small: compress videos before adding them, and remember that GitHub rejects files over 100 MB.
