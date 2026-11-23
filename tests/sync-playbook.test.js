// Runs scripts/sync-playbook.sh against a throwaway project and vault, to
// check what a forward sync keeps that the vault does not hold.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sync-playbook-"));
  const project = path.join(dir, "project");
  const vault = path.join(dir, "vault");
  fs.mkdirSync(path.join(project, "scripts"), { recursive: true });
  for (const f of ["sync-playbook.sh", "obsidian-links.mjs", "sync-back.mjs"]) {
    fs.copyFileSync(path.join(ROOT, "scripts", f), path.join(project, "scripts", f));
  }
  const dst = path.join(project, "content/playbooks/demo");
  fs.mkdirSync(dst, { recursive: true });
  fs.mkdirSync(path.join(project, "images/playbooks/demo"), { recursive: true });
  fs.mkdirSync(vault);
  fs.symlinkSync(path.join(ROOT, "node_modules"), path.join(project, "node_modules"));
  return { project, vault, dst, images: path.join(project, "images/playbooks/demo") };
}

const sync = ({ project, vault }) =>
  execFileSync("bash", ["scripts/sync-playbook.sh", "demo", vault], { cwd: project, stdio: "pipe" });

const page = (title, updated, body) =>
  `---\ntitle: "${title}"\norder: 10\nupdated: ${updated}\ntags:\n  - demo\n---\n\n${body}\n`;

test("a page whose text has not changed keeps its updated date", () => {
  const t = setup();
  fs.writeFileSync(path.join(t.vault, "10-sense.md"), "---\norder: 10\n---\n# Sense\n\nNotice the third time.\n");
  fs.writeFileSync(path.join(t.dst, "sense.md"), page("Sense", "2026-10-12", "Notice the third time."));
  sync(t);
  assert.match(fs.readFileSync(path.join(t.dst, "sense.md"), "utf8"), /^updated: 2026-10-12$/m);
});

test("a page whose text changed gets today's date", () => {
  const t = setup();
  fs.writeFileSync(path.join(t.vault, "10-sense.md"), "---\norder: 10\n---\n# Sense\n\nNotice the fourth time.\n");
  fs.writeFileSync(path.join(t.dst, "sense.md"), page("Sense", "2026-10-12", "Notice the third time."));
  sync(t);
  const today = new Date().toISOString().slice(0, 10);
  assert.match(fs.readFileSync(path.join(t.dst, "sense.md"), "utf8"), new RegExp(`^updated: ${today}$`, "m"));
});

test("a date in the vault note still wins", () => {
  const t = setup();
  fs.writeFileSync(path.join(t.vault, "10-sense.md"), "---\norder: 10\ndate: 2026-09-01\n---\n# Sense\n\nNotice the third time.\n");
  fs.writeFileSync(path.join(t.dst, "sense.md"), page("Sense", "2026-10-12", "Notice the third time."));
  sync(t);
  assert.match(fs.readFileSync(path.join(t.dst, "sense.md"), "utf8"), /^updated: 2026-09-01$/m);
});

test("an image that only a deck uses survives the sync", () => {
  const t = setup();
  fs.writeFileSync(path.join(t.vault, "10-sense.md"), "# Sense\n\nText.\n");
  fs.writeFileSync(path.join(t.dst, "overview.marp.md"), "---\nmarp: true\n---\n\n![w:960 Loop](/images/playbooks/demo/loop.svg)\n");
  fs.writeFileSync(path.join(t.images, "loop.svg"), "<svg/>");
  fs.writeFileSync(path.join(t.images, "stale.png"), "old");
  sync(t);
  assert.ok(fs.existsSync(path.join(t.images, "loop.svg")), "deck image was deleted");
  assert.ok(!fs.existsSync(path.join(t.images, "stale.png")), "unused image was kept");
  assert.ok(fs.existsSync(path.join(t.dst, "overview.marp.md")), "deck was deleted");
});

test("sync-back --whole rewrites drifted notes so the forward sync gives the pages back exactly", () => {
  const t = setup();
  fs.mkdirSync(path.join(t.vault, "artefacts"));
  fs.mkdirSync(path.join(t.dst, "artefacts"));
  fs.writeFileSync(path.join(t.vault, "10-sense.md"), "---\ntitle: Sense\norder: 10\n---\n\n# Sense\n\nA different rewrite \u2014 with dashes.\n");
  fs.writeFileSync(path.join(t.vault, "artefacts", "20-play-template.md"), "---\ntitle: Play Template\norder: 20\n---\n\n# Play Template\n\nOld.\n");
  // Synced pages have two blank lines after the frontmatter, as the forward sync writes them
  const synced = (text) => text.replace("---\n\n", "---\n\n\n");
  fs.writeFileSync(path.join(t.dst, "sense.md"), synced(page("Sense", "2026-10-12", "Use the [Play Template](/playbooks/demo/artefacts/play-template/) first.")));
  const template = synced(page("Play Template", "2026-10-12", "Back to [Sense](/playbooks/demo/sense/).").replace("order: 10", "order: 120").replace("updated:", "section: artefacts\nupdated:"));
  fs.writeFileSync(path.join(t.dst, "artefacts", "play-template.md"), template);
  const before = [fs.readFileSync(path.join(t.dst, "sense.md"), "utf8"), template];

  execFileSync("node", ["scripts/sync-back.mjs", "demo", t.vault, "--whole", "--apply", "--backup-dir", path.join(t.vault, "..", "backups")], { cwd: t.project, stdio: "pipe" });
  assert.match(fs.readFileSync(path.join(t.vault, "10-sense.md"), "utf8"), /\[Play Template\]\(artefacts\/20-play-template\.md\)/);
  sync(t);
  assert.equal(fs.readFileSync(path.join(t.dst, "sense.md"), "utf8"), before[0]);
  assert.equal(fs.readFileSync(path.join(t.dst, "artefacts", "play-template.md"), "utf8"), before[1]);
  assert.ok(fs.existsSync(path.join(t.vault, "..", "backups", "10-sense.md")), "no backup written");
});
