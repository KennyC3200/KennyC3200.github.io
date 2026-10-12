// What every project, post and role must contain. A missing or misspelled field
// stops `npm run build` with an error that names the file, instead of quietly
// breaking a page.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    /** Technologies, shown as pills in the All Projects "Made with" column and as tags on the landing page. */
    madeWith: z.array(z.string()).default([]),
    /** Used to sort, newest first, and for the year shown on the landing page. */
    date: z.coerce.date(),
    /** Links. Leave any of them out and its icon is skipped. */
    github: z.string().url().optional(),
    live: z.string().url().optional(),
    /** In-depth write-up: a blog post path like /blog/my-post, or a full URL to a report. */
    writeup: z.string().optional(),
    /** Show this project on the landing page as well as on All Projects. */
    featured: z.boolean().default(false),
    /** Thumbnail for the landing page (16:10). Put the file in public/images/. */
    thumbnail: z.string().default('/images/project-thumbnail.svg'),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    /** One or two sentences: the excerpt on the blog index and the link preview text. */
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    /** Image for link previews and the landing page's Blog section (1200x630). */
    cover: z.string().default('/images/blog-cover.svg'),
    /** Drafts show while you run `npm run dev` but are left out of the live site. */
    draft: z.boolean().default(false),
  }),
});

const experience = defineCollection({
  loader: file('./src/data/experience.json'),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    url: z.string().url().optional(),
    start: z.string(),
    /** Leave out for a current role; it shows as "Present". */
    end: z.string().optional(),
    /** Earlier titles at the same company, shown under the current one. */
    earlierRoles: z.array(z.string()).default([]),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, blog, experience };
