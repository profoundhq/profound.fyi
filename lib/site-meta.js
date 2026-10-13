// Metadata derived from page data: fallback descriptions and JSON-LD.

const SECTIONS = {
  playbooks: "Playbooks",
  laws: "Laws",
  writing: "Writing",
  talks: "Speaking",
  tools: "Tools",
};

// A plain-text summary from a page's source (Markdown or Nunjucks): the first
// paragraph of real prose, cut at a word boundary.
export function excerpt(source, max = 155) {
  const blocks = String(source || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}|\{#[\s\S]*?#\}/g, "")
    .split(/\n\s*\n/);
  for (const block of blocks) {
    if (/^\s*(#|\||<!--|---|>)/.test(block)) continue;
    const text = block
      .replace(/<[^>]+>/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_`]/g, "")
      .replace(/^\s*(?:[-+]|\d+\.)\s+/gm, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length < 40) continue;
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 3);
    return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:-]+$/, "")}...`;
  }
  return "";
}

export function breadcrumbs({ url, title, playbook, playbookTitle, siteUrl }) {
  const section = url.split("/")[1];
  const crumbs = [{ name: "Home", url: `${siteUrl}/` }];
  if (SECTIONS[section]) crumbs.push({ name: SECTIONS[section], url: `${siteUrl}/${section}/` });
  const landing = `/playbooks/${playbook}/`;
  if (playbook && url !== landing) crumbs.push({ name: playbookTitle, url: `${siteUrl}${landing}` });
  if (crumbs.at(-1).url !== `${siteUrl}${url}`) crumbs.push({ name: title, url: `${siteUrl}${url}` });
  return crumbs;
}

// JSON-LD for a page, safe to place inside a <script> element.
export function structuredData({ url, title, description, updated, date, playbook, playbookTitle, site }) {
  const siteUrl = site.url;
  const author = { "@type": "Person", name: site.author, url: `${siteUrl}/about/` };
  const graph = [];
  if (url === "/") {
    graph.push({ "@type": "WebSite", name: site.title, url: `${siteUrl}/`, description, inLanguage: "en-GB", author });
  } else {
    const modified = updated || date;
    graph.push({
      "@type": "Article",
      headline: title,
      description,
      url: `${siteUrl}${url}`,
      inLanguage: "en-GB",
      author,
      license: site.license,
      ...(date ? { datePublished: new Date(date).toISOString().split("T")[0] } : {}),
      ...(modified ? { dateModified: new Date(modified).toISOString().split("T")[0] } : {}),
    });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs({ url, title, playbook, playbookTitle, siteUrl }).map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
