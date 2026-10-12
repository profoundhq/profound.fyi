import fs from "node:fs";
import { Marp } from "@marp-team/marp-core";

// Marp settings that Eleventy strips out as frontmatter and that need
// handing back to Marp as global directives.
const MARP_DIRECTIVES = ["theme", "paginate", "size", "header", "footer", "math"];
const MARP_THEME = fs.readFileSync("_includes/marp/profound.css", "utf8");

function renderMarp(markdown, directives = {}) {
  const marp = new Marp({ inlineSVG: true });
  marp.themeSet.add(MARP_THEME);
  const set = Object.entries(directives).filter(
    ([key, value]) => MARP_DIRECTIVES.includes(key) && value !== undefined,
  );
  const globals = Object.entries({ theme: "profound", ...Object.fromEntries(set) })
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
  const { html, css } = marp.render(`---\n${globals}\n---\n${markdown}`);
  return `<style>${css}</style>\n${html}`;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "images": "images" });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return new Date(dateObj).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("toRoman", (num) => {
    const numerals = [
      ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400],
      ["C", 100], ["XC", 90], ["L", 50], ["XL", 40],
      ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1],
    ];
    let n = Math.floor(Number(num));
    if (!Number.isFinite(n) || n <= 0) return String(num);
    let out = "";
    for (const [symbol, value] of numerals) {
      while (n >= value) { out += symbol; n -= value; }
    }
    return out;
  });

  eleventyConfig.addCollection("sitemapPages", (collectionApi) => {
    return collectionApi.getAll().filter((item) => {
      if (!item.url) return false;
      if (item.url === "/sitemap.xml" || item.url === "/robots.txt") return false;
      return true;
    });
  });

  eleventyConfig.addFilter("sortByOrder", (collection) => {
    return [...collection].sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  eleventyConfig.addFilter("filterBySection", (collection, section) => {
    return collection.filter((item) => (item.data.section || "framework") === section);
  });

  eleventyConfig.addFilter("groupByYear", (collection) => {
    const groups = new Map();
    for (const item of collection) {
      const y = String(item.date.getFullYear());
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y).push(item);
    }
    return [...groups.entries()].sort((a, b) => Number(b[0]) - Number(a[0]));
  });

  eleventyConfig.addCollection("playbooks", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("content/playbooks/*/index.*")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  eleventyConfig.addCollection("tools", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("content/tools/*.njk")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  // Software Laws (content/laws/, synced by scripts/sync-laws.sh)
  eleventyConfig.addCollection("lawClusters", (collectionApi) =>
    collectionApi.getFilteredByGlob("content/laws/clusters/*.md"),
  );

  // Entries matching a list of slugs, in the list's order
  eleventyConfig.addFilter("lawsBySlug", (collection, slugs) =>
    (slugs || []).map((slug) => collection.find((item) => item.data.slug === slug)).filter(Boolean),
  );

  // A tier's entries: the tier page's own order first, then any others in the tier
  eleventyConfig.addFilter("lawsForTier", (collection, tier, slugs = []) => {
    const listed = (slugs || []).map((slug) => collection.find((item) => item.data.slug === slug)).filter(Boolean);
    const rest = collection
      .filter((item) => item.data.tier === tier && !listed.includes(item))
      .sort((a, b) => a.data.title.localeCompare(b.data.title));
    return [...listed, ...rest];
  });

  // JSON list of law URLs, for the "Draw a card" button
  eleventyConfig.addFilter("lawUrls", (collection) => JSON.stringify(collection.map((item) => item.url)));

  // Icon for a law, extracted from the printed deck, if it has one
  eleventyConfig.addFilter("lawIcon", (slug) =>
    fs.existsSync(`images/laws/${slug}.svg`) ? `/images/laws/${slug}.svg` : "",
  );

  // Clusters whose `entries` include this slug
  eleventyConfig.addFilter("clustersFor", (clusters, slug) =>
    clusters.filter((cluster) => (cluster.data.entries || []).includes(slug)),
  );

  // Slide decks: layouts/deck.njk passes the raw Markdown here, with the
  // Marp directives Eleventy has already taken out of the frontmatter.
  eleventyConfig.addFilter("marp", renderMarp);

  // Embeds a deck inline on another page as a slide viewer, e.g.
  // {% marpDeck "content/playbooks/<slug>/overview.marp.md", "/playbooks/<slug>/overview/" %}
  // The second argument links to the deck's own page.
  eleventyConfig.addShortcode("marpDeck", (file, href) => {
    const source = fs.readFileSync(file, "utf8");
    const fm = source.match(/^---\n([\s\S]*?)\n---\n/);
    const directives = {};
    let title = "Slides";
    for (const line of fm ? fm[1].split("\n") : []) {
      const m = line.match(/^(\w+):\s*(.*)$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, "");
      if (m[1] === "title") title = value;
      if (MARP_DIRECTIVES.includes(m[1])) directives[m[1]] = value === "true" ? true : value === "false" ? false : value;
    }
    const markdown = fm ? source.slice(fm[0].length) : source;
    return `<figure class="deck-viewer" data-deck aria-label="${title}">
  <div class="deck deck-inline" tabindex="0">
${renderMarp(markdown, directives)}
  </div>
  <figcaption class="deck-controls">
    <button type="button" class="deck-prev" aria-label="Previous slide" hidden>&larr;</button>
    <span class="deck-count" aria-live="polite"></span>
    <button type="button" class="deck-next" aria-label="Next slide" hidden>&rarr;</button>
    <button type="button" class="deck-present" hidden>Present</button>
    ${href ? `<a class="deck-open" href="${href}">All slides</a>` : ""}
  </figcaption>
</figure>
<script src="/js/deck.js" defer></script>`;
  });

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
