// Everything about you that appears on more than one page.
export const site = {
  name: 'Kenny Chen',
  role: 'Computer Engineering Student',
  tagline: 'Programming. Machine learning. Game dev. Blog.',
  /** Shown in search results and link previews. */
  description: 'Kenny Chen — Computer Engineering student. Projects, experience and a technical blog.',
  blogIntro:
    'Programming, machine learning, and global markets.',
  contact:
    "If you or anyone you know are interested in anything related to programming, machine learning, or global markets and would like to talk with me about it, please contact me.",
  email: 'kennychen3200@gmail.com',
  github: 'https://github.com/KennyC3200',
  linkedin: 'https://www.linkedin.com/in/kenny-chen-611752346/',
  resume: '/resume.pdf',
  /** Set to false to hide the headshot. Replace public/images/headshot.svg with your photo. */
  headshot: '/images/headshot.jpg' as string | false,
  footer: 'Built with Astro. Set in Inter, Source Serif 4 and JetBrains Mono.',
  postsPerPage: 10,
};