import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://anvith-portfolio-rose.vercel.app',
  integrations: [sitemap()],
});
