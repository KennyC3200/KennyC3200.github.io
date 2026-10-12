// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import gruvboxLight from './src/lib/gruvbox-light-theme.json' with { type: 'json' };

// https://astro.build/config
export default defineConfig({
  // The address the site is served from on GitHub Pages.
  site: 'https://kennyc3200.github.io',
  integrations: [sitemap()],
  markdown: {
    // Markdown runs through remark/rehype so math plugins can join in:
    // $inline$ and $$display$$ math, rendered to SVG by MathJax at build time (no script in the browser).
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeMathjax],
    }),
    shikiConfig: {
      // Code colors from the design system's code-* tokens.
      theme: gruvboxLight,
      wrap: false,
    },
  },
});
