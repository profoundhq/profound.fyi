// Transform one Software Laws note from the vault into a site page.
// Called by scripts/sync-laws.sh once per file.
//
// Usage:
//   node scripts/laws-transform.mjs <source-file> <output-file>
//
// - Layouts point at the laws-* layouts: entry -> laws-entry, tier, cluster,
//   and page -> laws-page. laws-home is kept.
// - A leading heading that repeats the title is dropped.
// - Entries: the "## Front" text moves into a `front:` field, so card grids
//   can show it, and the "## Back" heading is dropped.
// - Tiers: the list of entry links becomes an ordered `entries:` field, which
//   the layout renders as cards. Clusters already carry `entries:`, so their
//   link list is dropped.
// - Em dash -> hyphen, as in sync-playbook.sh.

import fs from "node:fs";

const LINK_ITEM = /^- \[[^\]]*\]\(\/laws\/([a-z0-9-]+)\/\)\s*$/;

export function transform(text) {
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error("no frontmatter");
  let head = fm[1]
    .replace(/^layout: layouts\/entry\.njk$/m, "layout: layouts/laws-entry.njk")
    .replace(/^layout: layouts\/(tier|cluster|page)\.njk$/m, "layout: layouts/laws-page.njk");
  const title = (head.match(/^title:\s*"?(.*?)"?\s*$/m) || [])[1];
  const isEntry = /layouts\/laws-entry\.njk/.test(head);
  const isTier = /^tier:/m.test(head) && !isEntry;
  const isCluster = /^entries:/m.test(head);

  let lines = text.slice(fm[0].length).replace(/ — /g, " - ").replace(/—/g, "-").split("\n");

  // Drop a leading heading that repeats the title
  const first = lines.findIndex((line) => line.trim());
  if (first >= 0 && /^#+\s/.test(lines[first]) && lines[first].replace(/^#+\s+/, "").trim() === title) {
    lines.splice(first, 1);
  }

  if (isEntry) {
    const front = lines.indexOf("## Front");
    const back = lines.indexOf("## Back");
    if (front >= 0 && back > front) {
      const frontText = lines.slice(front + 1, back).join(" ").replace(/\s+/g, " ").trim();
      head += `\nfront: ${JSON.stringify(frontText)}`;
      lines = lines.slice(back + 1);
    }
  }

  if (isTier || isCluster) {
    const slugs = [];
    lines = lines.filter((line) => {
      const m = line.match(LINK_ITEM);
      if (m) slugs.push(m[1]);
      return !m;
    });
    if (isTier && slugs.length) head += `\nentries: [${slugs.join(", ")}]`;
  }

  const body = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return `---\n${head}\n---\n\n${body}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [src, out] = process.argv.slice(2);
  fs.writeFileSync(out, transform(fs.readFileSync(src, "utf8")));
}
