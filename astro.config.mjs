import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// After your first Vercel deploy, change this to your real URL (e.g. https://anvith.vercel.app)
export default defineConfig({
  site: 'https://anvith-portfolio.vercel.app',
  integrations: [sitemap()],
});
