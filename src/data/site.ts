// Everything about you that appears on more than one page.
export const site = {
  name: 'Kenny Chen',
  role: 'Computer Engineering Student',
  tagline: 'One sentence on what you build and what you care about.',
  /** Shown in search results and link previews. */
  description: 'Kenny Chen — Computer Engineering student. Projects, experience and a technical blog.',
  blogIntro:
    'One sentence on what this blog covers, for example systems programming, machine learning and the math behind them.',
  contact:
    "One sentence inviting recruiters to reach out, and what kind of roles you're looking for.",
  email: 'you@example.com',
  github: 'https://github.com/KennyC3200',
  linkedin: 'https://www.linkedin.com/',
  /** Put your résumé at public/resume.pdf. Until that file exists, the résumé links are hidden. */
  resume: '/resume.pdf',
  /** Set to false to hide the headshot. Replace public/images/headshot.svg with your photo. */
  headshot: '/images/headshot.svg' as string | false,
  footer: 'Built with Astro. Set in Inter, Source Serif 4 and JetBrains Mono.',
  postsPerPage: 10,
};
