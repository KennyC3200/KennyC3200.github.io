# kennyc3200.github.io

My portfolio and technical blog, built with [Astro](https://astro.build) and hosted on GitHub Pages. Every push to `main` rebuilds and publishes the site.

## Run it locally

Needs Node 22.12 or newer.

```sh
npm install      # once
npm run dev      # live preview at http://localhost:4321, reloads as you save
npm run build    # the production build, into dist/ (the same thing GitHub runs)
npm run preview  # serve that build locally
```

If `npm run build` fails, its message names the file and field to fix: every project, post and role is checked against the fields listed in `src/content.config.ts`.

## Where everything lives

| To change… | Edit |
| --- | --- |
| Name, role, tagline, email, social links, footer, blog intro | `src/data/site.ts` |
| The About paragraphs | `src/data/about.md` |
| Experience | `src/data/experience.json` |
| Projects | `src/content/projects/*.md` (one file each) |
| Blog posts | `src/content/blog/*.md` (one file each) |
| Headshot, thumbnails, covers | `public/images/` |
| Résumé | `public/resume.pdf` (the résumé links appear once this file exists) |
| Colors, spacing, widths | `src/styles/tokens.css` (from the Portfolio Design System) |
| Code block colors | `src/lib/gruvbox-light-theme.json` |
| Page layouts | `src/pages/` and `src/components/` |

## Add a project

Create `src/content/projects/my-project.md`:

```markdown
---
name: MiniGrad
description: One or two sentences on what it does and the hardest problem it solves.
madeWith: [C++, CMake]
date: 2026-03-01                          # sorts the list, newest first
github: https://github.com/KennyC3200/MiniGrad
live: https://example.com                 # optional
writeup: /blog/building-minigrad          # optional: a post, or a full URL to a report
featured: true                            # also show it on the landing page
thumbnail: /images/minigrad.png           # optional, 16:10, for the landing page
---
```

Leave out `github`, `live` or `writeup` and that icon is skipped. Every project appears on All Projects; `featured: true` ones also appear on the landing page.

## Add experience

Add an entry to `src/data/experience.json`. Each needs a unique `id`. Leave out `end` for a current role (it shows as "Present"); `url` and `earlierRoles` are optional. Roles are listed current first, then by end year.

## Write a blog post

Create `src/content/blog/my-post-name.md`. The file name becomes the address: `/blog/my-post-name`.

````markdown
---
title: Implementing Backprop in C++
description: One or two sentences for the blog index and link previews.
date: 2026-10-12
tags: [C++, Machine Learning]
draft: true          # hidden on the live site until you remove this or set it to false
---

Write in Markdown. `##` and `###` for headings, *italics*, **bold**, [links](https://example.com).

Inline math $f(x) = \sigma(Wx + b)$ and display math:

$$
\frac{\partial L}{\partial w} = \sum_i (\hat{y}_i - y_i)\, x_i
$$

```cpp
T dot(const std::vector<T>& a, const std::vector<T>& b);
```

> A quotation.

A footnote reference.[^1]

<figure>
  <img src="/images/my-figure.png" alt="What the figure shows" />
  <figcaption>Figure 1. The caption.</figcaption>
</figure>

[^1]: The footnote text.
````

The blog index, the landing page's four most recent posts, reading time, previous/next links, pagination and the RSS feed (`/rss.xml`) all update on their own. Math is rendered by MathJax when the site builds, so readers download no math script.

## Publish

```sh
git add -A
git commit -m "Add backprop post"
git push
```

GitHub Actions (`.github/workflows/deploy.yml`) builds the site and publishes it, usually within two minutes. Progress shows in the repo's **Actions** tab.

One-time setup: in the repo, **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Motion

Every page fades its content up on load and as it scrolls into view (`src/scripts/reveal.ts`, turned on by `<Base reveal>`). Add `data-reveal` to an element to animate it when it scrolls into view; `data-reveal="intro"` animates it on load instead, in page order. Visitors who ask their system for reduced motion see everything in place.
