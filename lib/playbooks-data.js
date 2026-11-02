// The playbooks as data: every page, and every play split into its fields.
// Feeds /playbooks.json, /playbooks/.../<page>.md, and the
// agent skill for each playbook. Built from Eleventy's own collection, so URLs
// are the real ones.
import { listing } from "./laws-data.js";
import { excerpt } from "./site-meta.js";

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
    const { playbook, playbookTitle, playbookDescription, license, title, order, section, updated } = item.data;
    if (!books.has(playbook)) {
      books.set(playbook, { slug: playbook, title: playbookTitle, description: playbookDescription ?? "", url: `${siteUrl}/playbooks/${playbook}/`, license, pages: [], plays: [] });
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
      // The page's file in the skill's references folder, such as
      // "artefacts-play-template.md"
      reference: `${item.url.replace(`/playbooks/${playbook}/`, "").replace(/\/$/, "").replace(/\//g, "-")}.md`,
      body: item.body,
    };
    book.pages.push(page);
    book.plays.push(...extractPlays({ title, body: item.body, url }).map((p) => ({ ...p, playbook, markdownUrl: page.markdownUrl, reference: page.reference })));
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
      playbooks: books.map(({ pages, ...book }) => ({ ...book, skill: `${site.url}${skillPath(book)}`, pages: pages.map(({ body, reference, ...page }) => page) })),
    },
    null,
    2,
  );
}

// Skills carry the site prefix, so they do not clash with other skills an
// assistant has installed
export const skillName = (book) => `profound-${book.slug}`;
export const skillPath = (book) => `/.well-known/agent-skills/${skillName(book)}/SKILL.md`;
export const skillArchive = (book) => `/downloads/${skillName(book)}-skill.zip`;

const ref = (page) => `\`references/${page.reference}\``;
const summaryLine = (page) => {
  const summary = excerpt(page.body);
  return `- [${page.title}](${page.markdownUrl}), ${ref(page)}${summary ? `: ${summary}` : ""}`;
};

function description(book) {
  const intro = `${book.description} From the ${book.title} playbook on profound.fyi.`;
  if (book.kind === "framework") {
    return `${intro} A framework, not a set of plays. Use when someone wants to understand or diagnose a situation it covers, or asks about ${book.title}.`;
  }
  const use = ` Use when someone faces a situation one of its ${book.plays.length} plays covers and asks what to do. Each play says when it applies, when not to, and whether a real instance is recorded.`;
  const named = ` Plays: ${listing(book.plays.map((p) => p.name))}.`;
  // Naming the plays helps an assistant match a request, if it fits
  return (intro + use + named).length <= 1024 ? intro + use + named : intro + use;
}

// One skill per playbook. A playbook of plays gets the play steps, and a
// framework gets steps for reading a situation through it.
export function playbookSkill(book, site) {
  const out = [
    "---",
    `name: ${skillName(book)}`,
    `description: ${JSON.stringify(description(book))}`,
    "---",
    "",
    `# ${book.title}`,
    "",
    `${book.description} ${credit(site)} Credit the source when you quote it.`,
    "",
    "Each page below has a Markdown link. If this skill came with a `references` folder, the same page is in the file named after the link.",
    "",
    "## How to use this skill",
    "",
  ];
  if (book.kind === "framework") {
    out.push(
      "This playbook is a framework, not a set of plays. Use it to read a situation, not to pick an action.",
      "",
      `1. Start with [${book.pages[0].title}](${book.pages[0].markdownUrl}) to get the argument.`,
      "2. Read the pages that bear on the situation in front of you.",
      "3. Read the situation through the framework. Say what it would look for, what you can see, and what that suggests.",
      "4. Do not turn the framework into a recipe. Where it lists open questions, say which ones the situation touches.",
      "5. Link the pages you use.",
      "",
      "## Pages",
      "",
      ...book.pages.map(summaryLine),
      "",
    );
  } else {
    const background = book.pages.filter((page) => !book.plays.some((p) => p.url === page.url));
    out.push(
      "1. Understand the situation first. A play applies when the reader is standing in its When, not when the topic matches.",
      "2. Pick one or two plays at most. If none fits, say so.",
      "3. Read each play in full before you use it.",
      '4. Check "When not to" before you recommend anything. If it applies, say so and stop there.',
      "5. Give the action, what it trades away (Forces, where the play records them), and the signals that would show it working within weeks.",
      '6. State the evidence. A play marked "no instance yet" has not been tested in recorded real use. Offer it as something to try, never as proven practice.',
      "7. Link each play you use.",
      "",
      "## Plays",
      "",
      ...book.plays.map((p) => `- [${p.name}](${p.markdownUrl}) (${evidenceLabel(p)}), ${ref(p)}: ${p.when.replace(/\s+/g, " ")}`),
      "",
      ...(background.length ? ["## Background", "", "Read these for the argument behind the plays.", "", ...background.map(summaryLine), ""] : []),
    );
  }
  out.push(`Every page and play is also in ${site.url}/playbooks.json.`, "");
  return out.join("\n");
}

// The installable archive: SKILL.md and one reference file per page
export function playbookSkillFiles(book, site) {
  return [
    { name: `${skillName(book)}/SKILL.md`, data: playbookSkill(book, site) },
    ...book.pages.map((page) => ({ name: `${skillName(book)}/references/${page.reference}`, data: pageMarkdown(page, book, site) })),
  ];
}
