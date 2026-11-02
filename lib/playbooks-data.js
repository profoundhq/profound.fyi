// The playbooks as data: every page, and every play split into its fields.
// Feeds /playbooks.json, /playbooks/.../<page>.md, and the
// profound-playbooks agent skill. Built from Eleventy's own collection, so
// URLs are the real ones.
import { listing } from "./laws-data.js";

export const PLAYBOOKS_SKILL = {
  name: "profound-playbooks",
  path: "/.well-known/agent-skills/profound-playbooks/SKILL.md",
  archive: "/downloads/profound-playbooks-skill.zip",
};

// Field labels as plays write them. "The move" is the older name for the
// action, read the same way so the data survives the rename.
const LABELS = {
  "When": "when",
  "The action": "action",
  "The move": "action",
  "Forces": "forces",
  "Signals": "signals",
  "When not to": "whenNot",
  "Instance": "instance",
  "Status": "status",
  "Owner": "owner",
  "Last tested": "lastTested",
};

const LABEL_LINE = /^\*\*([^*]+?):\*\*\s*(.*)$/;
const STATUS = /\(\s*(candidate|provisional|tested|retired)\s*\)/i;

// Labelled paragraphs. A field runs until the next label or heading.
export function parseFields(text) {
  const fields = {};
  let key = null;
  let lines = [];
  const close = () => {
    if (key) fields[key] = lines.join("\n").trim();
    key = null;
    lines = [];
  };
  for (const line of String(text).split("\n")) {
    const label = line.match(LABEL_LINE);
    if (label && LABELS[label[1]]) {
      close();
      key = LABELS[label[1]];
      lines = [label[2]];
    } else if (/^#{1,6}\s/.test(line)) {
      close();
    } else if (key) {
      lines.push(line);
    }
  }
  close();
  return fields;
}

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function play(name, fields, { url, marker }) {
  const status = fields.status?.toLowerCase() ?? marker;
  return {
    name,
    url,
    when: fields.when,
    action: fields.action,
    forces: fields.forces,
    signals: fields.signals,
    whenNot: fields.whenNot,
    instance: fields.instance,
    evidence: fields.instance ? "instance" : "none",
    ...(status ? { status } : {}),
  };
}

// A page is either one play (its fields sit in the body) or holds several
// under "## Play:" headings. Template placeholders such as "[name]" are not
// plays.
export function extractPlays({ title, body, url }) {
  const sections = [...String(body).matchAll(/^## Play:\s*(.+)$/gm)];
  if (!sections.length) {
    const fields = parseFields(body);
    return fields.when && fields.action ? [play(title, fields, { url })] : [];
  }
  return sections
    .map((match, i) => {
      const start = match.index + match[0].length;
      const end = sections[i + 1]?.index ?? body.length;
      const heading = match[1];
      const marker = heading.match(STATUS)?.[1]?.toLowerCase();
      const name = capitalise(heading.replace(/\*?\(\s*\w+\s*\)\*?/, "").trim());
      return { name, marker, fields: parseFields(body.slice(start, end).split(/^## /m)[0]) };
    })
    .filter(({ name, fields }) => !name.startsWith("[") && fields.when && fields.action)
    .map(({ name, marker, fields }) => play(name, fields, { url, marker }));
}

export function buildPlaybooks(items, siteUrl) {
  const books = new Map();
  for (const item of items) {
    const { playbook, playbookTitle, license, title, order, section, updated } = item.data;
    if (!books.has(playbook)) {
      books.set(playbook, { slug: playbook, title: playbookTitle, url: `${siteUrl}/playbooks/${playbook}/`, license, pages: [], plays: [] });
    }
    const book = books.get(playbook);
    const url = `${siteUrl}${item.url}`;
    const page = {
      title,
      order: order ?? 0,
      ...(section ? { section } : {}),
      ...(updated ? { updated: new Date(updated).toISOString().slice(0, 10) } : {}),
      url,
      markdownUrl: `${siteUrl}${item.url.replace(/\/$/, ".md")}`,
      body: item.body,
    };
    book.pages.push(page);
    book.plays.push(...extractPlays({ title, body: item.body, url }).map((p) => ({ ...p, playbook, markdownUrl: page.markdownUrl })));
  }
  return [...books.values()]
    .map((book) => ({
      ...book,
      kind: book.plays.length ? "plays" : "framework",
      pages: book.pages.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "en-GB"));
}

const credit = (site) => `From the playbooks by ${site.author} at ${site.url}/playbooks/, licensed under CC BY-SA 4.0 (${site.license}).`;

// Root-relative links and images point back at the site, so the Markdown
// works wherever it is read
const absolute = (text, siteUrl) =>
  text.replace(/(\]\()\/(?!\/)/g, `$1${siteUrl}/`).replace(/((?:href|src)=")\/(?!\/)/g, `$1${siteUrl}/`);

export function pageMarkdown(page, book, site) {
  return [
    "---",
    `title: ${JSON.stringify(page.title)}`,
    `playbook: ${JSON.stringify(book.title)}`,
    `url: ${page.url}`,
    ...(page.updated ? [`updated: ${page.updated}`] : []),
    `license: ${book.license?.url ?? site.license}`,
    "---",
    "",
    `# ${page.title}`,
    "",
    absolute(page.body.trim(), site.url),
    "",
    credit(site),
    "",
  ].join("\n");
}

const evidenceLabel = (p) => [p.evidence === "instance" ? "instance recorded" : "no instance yet", p.status].filter(Boolean).join(", ");

export function playbooksJson(books, site) {
  const plays = books.flatMap((b) => b.plays);
  return JSON.stringify(
    {
      title: "Profound playbooks",
      source: `${site.url}/playbooks/`,
      author: site.author,
      license: site.license,
      plays: { total: plays.length, withInstance: plays.filter((p) => p.evidence === "instance").length },
      playbooks: books.map(({ pages, ...book }) => ({ ...book, pages: pages.map(({ body, ...page }) => page) })),
    },
    null,
    2,
  );
}

// Every play in full, then every framework page, for the skill's offline copy
export function playbooksReference(books, site) {
  const out = ["# Profound playbooks", "", credit(site), ""];
  for (const book of books.filter((b) => b.kind === "plays")) {
    out.push(`## ${book.title}`, "");
    for (const p of book.plays) {
      out.push(`### ${p.name}`, "", `Evidence: ${evidenceLabel(p)}. Source: ${p.url}`, "");
      for (const [label, key] of [["When", "when"], ["The action", "action"], ["Forces", "forces"], ["Signals", "signals"], ["When not to", "whenNot"], ["Instance", "instance"]]) {
        if (p[key]) out.push(`**${label}:** ${p[key]}`, "");
      }
    }
  }
  for (const book of books.filter((b) => b.kind === "framework")) {
    out.push(`## ${book.title} (framework)`, "");
    for (const page of book.pages) out.push(`### ${page.title}`, "", `Source: ${page.url}`, "", absolute(page.body.trim(), site.url).replace(/^(#{1,4}) /gm, "$1## "), "");
  }
  return out.join("\n");
}

export function playbooksSkill(books, site) {
  const plays = books.flatMap((b) => b.plays);
  const playBooks = books.filter((b) => b.kind === "plays");
  const frameworks = books.filter((b) => b.kind === "framework");
  const description =
    `Apply the playbooks from profound.fyi to a real situation in team, product, or organisational work: ${plays.length} plays from ${listing(playBooks.map((b) => b.title))}, each with when it applies, when not to, the action, and the signals to watch. ` +
    (frameworks.length ? `Also frameworks for ${listing(frameworks.map((b) => b.title))}. ` : "") +
    "Use when someone describes a situation and asks what to do or how to read it. Every play says whether a real instance of it is recorded.";
  const out = [
    "---",
    `name: ${PLAYBOOKS_SKILL.name}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    "# Profound playbooks",
    "",
    `Plays for a system of work: situated actions that tend to work when you see certain conditions. ${credit(site)} Credit the source when you quote a play.`,
    "",
    "## How to use this skill",
    "",
    "1. Understand the situation first. A play applies when the reader is standing in its When, not when the topic matches.",
    "2. Pick one or two plays at most from the index below. If none fits, say so.",
    "3. Read each play in full before you use it. Use `references/playbooks.md` if this skill came with it, otherwise fetch the play's Markdown link.",
    '4. Check "When not to" before you recommend anything. If it applies, say so and stop there.',
    "5. Give the action, what it trades away (Forces, where the play records them), and the signals that would show it working within weeks.",
    '6. State the evidence. A play marked "no instance yet" has not been tested in recorded real use. Offer it as something to try, never as proven practice.',
    "7. Link each play you use.",
    "",
    "## Plays",
    "",
  ];
  for (const book of playBooks) {
    out.push(`### ${book.title}`, "", ...book.plays.map((p) => `- [${p.name}](${p.markdownUrl}) (${evidenceLabel(p)}): ${p.when.replace(/\s+/g, " ")}`), "");
  }
  if (frameworks.length) {
    out.push("## Frameworks", "", "These are not plays. Read them to understand a situation, not to pick an action.", "");
    for (const book of frameworks) {
      out.push(`- [${book.title}](${book.url}): ${book.pages.map((p) => `[${p.title}](${p.markdownUrl})`).join(", ")}`);
    }
    out.push("");
  }
  out.push(`Every playbook and play is also in ${site.url}/playbooks.json.`, "");
  return out.join("\n");
}
