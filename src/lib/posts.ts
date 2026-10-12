import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';

/** Published posts, newest first. Drafts are included only while running `npm run dev`. */
export async function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** "Oct 11, 2026" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Reading time at about 230 words a minute, ignoring code and math markup. */
export function readingTime(markdown: string): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 230))} min read`;
}


/** True when public/resume.pdf exists, so résumé links never point at a missing file. */
export const hasResume = existsSync(join(process.cwd(), 'public', 'resume.pdf'));

/** The link a project's name points to: the live project, else the code, else the write-up. */
export function primaryLink(p: { live?: string; github?: string; writeup?: string }): string | undefined {
  return p.live ?? p.github ?? p.writeup;
}
