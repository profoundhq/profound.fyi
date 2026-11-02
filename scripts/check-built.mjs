// Checks the machine-readable files in _site after a build: every law's
// Markdown parses, laws.json is complete, and the agent skill's digest
// matches the bytes served. Run after `npm run build`. CI runs it.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import matter from "gray-matter";

const site = "_site";
const problems = [];
const check = (ok, message) => ok || problems.push(message);
const read = (file) => fs.readFileSync(path.join(site, file));

const json = JSON.parse(read("laws.json"));
const markdown = fs.readdirSync(path.join(site, "laws")).filter((f) => f.endsWith(".md"));
check(json.count === json.laws.length, `laws.json count ${json.count} does not match its ${json.laws.length} entries`);
check(markdown.length === json.laws.length, `${markdown.length} Markdown laws for ${json.laws.length} entries`);

for (const file of markdown) {
  try {
    const { data, content } = matter(read(path.join("laws", file)).toString());
    check(`${data.slug}.md` === file, `${file}: slug is ${data.slug}`);
    check(content.includes("**How it gets misused.**"), `${file}: no misuse note`);
  } catch (error) {
    problems.push(`${file}: frontmatter does not parse (${error.reason ?? error.message})`);
  }
}

const index = JSON.parse(read(".well-known/agent-skills/index.json"));
for (const skill of index.skills) {
  const file = new URL(skill.url).pathname;
  const bytes = read(file);
  const digest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
  check(digest === skill.digest, `${skill.name}: index digest ${skill.digest} does not match ${file} (${digest})`);
  const { data } = matter(bytes.toString());
  check(data.name === skill.name, `${skill.name}: SKILL.md name is ${data.name}`);
  check(data.description?.length > 0 && data.description.length <= 1024, `${skill.name}: description must be 1 to 1024 characters`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`Built files check out: ${markdown.length} law Markdown files, laws.json, and ${index.skills.length} agent skill with a matching digest.`);
