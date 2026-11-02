// The Software Laws as data: one record per synced entry, and the
// machine-readable forms built from it (/laws.json, /laws/<slug>.md, and
// the software-laws agent skill). Everything comes from the entries
// themselves, so a vault sync updates all of it.
import { createHash } from "node:crypto";
import matter from "gray-matter";

// In the order and words of the Laws home page (content/laws/index.md)
export const TIERS = [
  { name: "Law", plural: "Laws", definition: "proved by maths or strong, repeated evidence" },
  { name: "Principle", plural: "Principles", definition: "design rules that work in most situations" },
  { name: "Pattern", plural: "Patterns", definition: "regularities we keep seeing, useful for spotting problems" },
  { name: "Practice", plural: "Practices", definition: "ways of working, repeated until habit" },
  { name: "Saying", plural: "Sayings", definition: "sharp phrases that make you think" },
  { name: "Framework", plural: "Frameworks", definition: "ways of seeing the whole picture" },
];

export const SKILL = {
  name: "software-laws",
  path: "/.well-known/agent-skills/software-laws/SKILL.md",
  archive: "/downloads/software-laws-skill.zip",
};

const SECTION = (label) => new RegExp(`^\\*\\*${label}\\.\\*\\*\\s*(.+)$`, "m");

// Every entry has exactly these two notes. A sync that drops one should
// stop the build, not publish half an entry.
export function splitSections(body) {
  const howToUse = String(body).match(SECTION("How to use it"));
  const misuse = String(body).match(SECTION("How it gets misused"));
  if (!howToUse) throw new Error('Law entry has no "How to use it." note');
  if (!misuse) throw new Error('Law entry has no "How it gets misused." note');
  return { howToUse: howToUse[1].trim(), misuse: misuse[1].trim() };
}

export function buildLaws({ entries, clusters, siteUrl }) {
  const tierOf = Object.fromEntries(TIERS.map((t) => [t.name, t]));
  return entries
    .map(({ data, body }) => {
      const tier = tierOf[data.tier];
      if (!tier) throw new Error(`${data.slug}: unknown tier "${data.tier}"`);
      return {
        slug: data.slug,
        title: data.title,
        tier: data.tier,
        tierDefinition: tier.definition,
        front: data.front,
        ...splitSections(body),
        related: data.related ?? [],
        clusters: clusters
          .filter((c) => (c.data.entries ?? []).includes(data.slug))
          .map((c) => ({ slug: c.data.slug, title: c.data.title })),
        url: `${siteUrl}/laws/${data.slug}/`,
        markdownUrl: `${siteUrl}/laws/${data.slug}.md`,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "en-GB"));
}

// House style: "A and B", "A, B, and C"
export function listing(items) {
  if (items.length < 3) return items.join(" and ");
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

const credit = (site) =>
  `From the Laws of Software Engineering by ${site.author} at ${site.url}/laws/, licensed under CC BY-SA 4.0 (${site.license}).`;

function relatedLinks(law, laws) {
  const bySlug = Object.fromEntries(laws.map((l) => [l.slug, l]));
  return law.related.filter((slug) => bySlug[slug]).map((slug) => `- [${bySlug[slug].title}](${bySlug[slug].markdownUrl})`);
}

// One law as Markdown, matching its HTML page, with frontmatter for agents
export function lawMarkdown(law, laws, site) {
  const related = relatedLinks(law, laws);
  const clusters = listing(law.clusters.map((c) => c.title));
  return [
    "---",
    `title: ${JSON.stringify(law.title)}`,
    `slug: ${law.slug}`,
    `tier: ${law.tier}`,
    `url: ${law.url}`,
    `license: ${site.license}`,
    "---",
    "",
    `# ${law.title}`,
    "",
    `> ${law.front}`,
    "",
    `${law.tier}: ${law.tierDefinition}.${clusters ? ` Part of ${clusters}.` : ""}`,
    "",
    `**How to use it.** ${law.howToUse}`,
    "",
    `**How it gets misused.** ${law.misuse}`,
    ...(related.length ? ["", "## Related", "", ...related] : []),
    "",
    credit(site),
    "",
  ].join("\n");
}

// Every law in full, grouped by tier, for the skill's offline copy
export function lawsReference(laws, site) {
  const out = ["# Laws of Software Engineering", "", credit(site), ""];
  for (const tier of TIERS) {
    const inTier = laws.filter((l) => l.tier === tier.name);
    if (!inTier.length) continue;
    out.push(`## ${tier.plural}`, "", `${tier.plural}: ${tier.definition}.`, "");
    for (const law of inTier) {
      out.push(`### ${law.title}`, "", `> ${law.front}`, "", `**How to use it.** ${law.howToUse}`, "", `**How it gets misused.** ${law.misuse}`, "");
      if (law.related.length) out.push(`Related: ${law.related.join(", ")}`, "");
      out.push(`Source: ${law.url}`, "");
    }
  }
  return out.join("\n");
}

export function skillMarkdown(laws, site) {
  const description =
    `Apply the Laws of Software Engineering from profound.fyi to a real situation: ${laws.length} entries, each with when it holds and how it gets misused. ` +
    "Use when someone describes a problem with delivery, teams, architecture, measurement, or incidents and wants to know why it is happening or what to watch for, " +
    "when they name a law such as Brooks's Law or Conway's Law, or when a law is being used to win an argument and may be misapplied.";
  const out = [
    "---",
    `name: ${SKILL.name}`,
    // Quoted, because the text contains ": ", which breaks plain YAML
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    "# Laws of Software Engineering",
    "",
    `A working set of ideas for software practitioners at every level, sorted into six tiers by how solid the evidence is. ${credit(site)} Credit the source when you quote an entry.`,
    "",
    "## How to use this skill",
    "",
    "1. Understand the situation first. Name the forces at work before reaching for a law.",
    "2. Pick at most three entries from the index below whose summary fits. If none fits, say so. A forced law is worse than none.",
    "3. Read each entry in full before you use it. Use `references/laws.md` if this skill came with it, otherwise fetch the entry's Markdown link.",
    '4. Check the situation against the entry\'s "How to use it" note. Say which of its conditions hold here, and which do not.',
    '5. Always pass on the "How it gets misused" note, above all when someone is using the law to make a case.',
    "6. Weigh the tier, which says how strong the evidence is. Never present a Saying as if it were proof.",
    "7. Link each entry you use.",
    "",
    "## Tiers",
    "",
    ...TIERS.map((t) => `- ${t.plural}: ${t.definition}`),
    "",
    "## Index",
    "",
    `Every entry is also in ${site.url}/laws.json.`,
    "",
  ];
  for (const tier of TIERS) {
    const inTier = laws.filter((l) => l.tier === tier.name);
    if (!inTier.length) continue;
    out.push(`### ${tier.plural}`, "", ...inTier.map((l) => `- [${l.title}](${l.markdownUrl}): ${l.front}`), "");
  }
  return out.join("\n");
}

// The discovery index, with a digest of the exact SKILL.md bytes served
export function skillIndex(skillContent, site) {
  const { description = "" } = matter(skillContent).data;
  return JSON.stringify(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name: SKILL.name,
          type: "skill-md",
          description,
          url: `${site.url}${SKILL.path}`,
          digest: `sha256:${createHash("sha256").update(skillContent).digest("hex")}`,
        },
      ],
    },
    null,
    2,
  );
}

export function lawsJson(laws, site) {
  return JSON.stringify(
    {
      title: "Laws of Software Engineering",
      source: `${site.url}/laws/`,
      author: site.author,
      license: site.license,
      count: laws.length,
      tiers: TIERS.map(({ name, plural, definition }) => ({ name, plural, definition })),
      laws,
    },
    null,
    2,
  );
}
