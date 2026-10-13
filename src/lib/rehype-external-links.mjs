// Opens links to other sites in a new tab, the same rule as newTab() in posts.ts uses on the pages.
// Applies to all Markdown: blog posts and src/data/about.md. Links to /paths, #anchors (footnotes,
// headings) and mailto: stay in the same tab.
export default function rehypeExternalLinks() {
  const visit = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && /^https?:\/\//.test(String(node.properties?.href ?? ''))) {
      node.properties.target = '_blank';
      node.properties.rel = ['noopener', 'noreferrer'];
    }
    node.children?.forEach(visit);
  };
  return (tree) => visit(tree);
}
