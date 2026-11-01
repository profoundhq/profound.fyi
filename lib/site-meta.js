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

// parent is an optional extra step ({ name, url } with a site-relative url)
// for pages grouped below their section, such as a law under its tier.
export function breadcrumbs({ url, title, playbook, playbookTitle, parent, siteUrl }) {
  const section = url.split("/")[1];
  const crumbs = [{ name: "Home", url: `${siteUrl}/` }];
  if (SECTIONS[section]) crumbs.push({ name: SECTIONS[section], url: `${siteUrl}/${section}/` });
  const landing = `/playbooks/${playbook}/`;
  if (playbook && url !== landing) crumbs.push({ name: playbookTitle, url: `${siteUrl}${landing}` });
  if (parent && parent.url !== url) crumbs.push({ name: parent.name, url: `${siteUrl}${parent.url}` });
  if (crumbs.at(-1).url !== `${siteUrl}${url}`) crumbs.push({ name: title, url: `${siteUrl}${url}` });
  return crumbs;
}

// A trail of two steps only repeats the main navigation, so pages show one
// (and mark it up) only when they sit at least two levels below home.
const MIN_TRAIL = 3;

// The trail as shown on the page, with site-relative links.
export function visibleBreadcrumbs({ url, title, playbook, playbookTitle, parent, siteUrl }) {
  const crumbs = breadcrumbs({ url, title, playbook, playbookTitle, parent, siteUrl });
  if (crumbs.length < MIN_TRAIL) return [];
  return crumbs.map((crumb) => ({ name: crumb.name, url: crumb.url.slice(siteUrl.length) }));
}

// JSON-LD for a page, safe to place inside a <script> element. Empty for
// pages that ask not to be indexed, such as the 404 page.
export function structuredData({ url, title, description, updated, date, playbook, playbookTitle, parent, robots, site }) {
  if (/noindex/.test(robots || "")) return "";
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
    const crumbs = breadcrumbs({ url, title, playbook, playbookTitle, parent, siteUrl });
    if (crumbs.length >= MIN_TRAIL) {
      graph.push({
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      });
    }
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

// Search results show about 160 characters of a description. A law's card
// front is the natural summary, but some fronts are a single short line and
// a few are full lists.
const SUMMARY_MAX = 160;
const SUMMARY_SHORT = 70;

const firstSentence = (text) => (text.match(/^(.+?[.!?])(?:\s|$)/) || [])[1];

// A search summary for a law entry, built only from its own words: a long
// front keeps the whole sentences that fit, or is cut at its first colon,
// and a short one gains the first sentence of its "How to use it" note.
export function lawSummary({ front = "", body = "" }) {
  const text = String(front).trim();
  if (text.length > SUMMARY_MAX) {
    const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)/g) || [];
    let kept = "";
    for (const sentence of sentences) {
      const next = `${kept} ${sentence.trim()}`.trim();
      if (next.length > SUMMARY_MAX) break;
      kept = next;
    }
    if (kept) return kept;
    const colon = text.indexOf(":");
    const head = colon > 0 ? `${text.slice(0, colon).trim()}.` : "";
    return head.length >= 30 && head.length <= SUMMARY_MAX ? head : excerpt(text, SUMMARY_MAX);
  }
  if (text.length < SUMMARY_SHORT) {
    const note = String(body).match(/\*\*How to use it\.\*\*\s*([^\n]+)/);
    const extra = note && firstSentence(note[1].replace(/[*_`]/g, ""));
    if (extra && text.length + 1 + extra.length <= SUMMARY_MAX) return `${text} ${extra}`;
  }
  return text;
}
