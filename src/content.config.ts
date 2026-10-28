import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every case study is one Markdown file in src/content/work/.
// Copy src/content/work/_template.md to add a new one.
const work = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    kicker: z.string(),            // one-line hook shown on the card
    category: z.string(),          // e.g. "Motion explainer", "Learning architecture"
    year: z.string(),
    role: z.string(),
    tools: z.array(z.string()).default([]),
    order: z.number().default(99), // lower numbers show first
    cover: z.string().optional(),  // path inside /public, e.g. /video/gold-loan-ltv.jpg
    art: z.enum(['engine', 'icad', 'research']).optional(), // built-in animated diagram used when there is no cover
    video: z.string().optional(),  // optional path inside /public, plays on hover and on the case page
    captions: z.string().optional(), // optional .vtt inside /public, shown as subtitles on the case page
    accent: z.enum(['red', 'gold', 'ink', 'sage']).default('red'),
    confidential: z.boolean().default(false), // shows an "anonymised" badge
    draft: z.boolean().default(false),        // true = hidden from the site
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  }),
});

export const collections = { work };
