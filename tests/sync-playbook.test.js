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
  for (const f of ["sync-playbook.sh", "obsidian-links.mjs"]) {
    fs.copyFileSync(path.join(ROOT, "scripts", f), path.join(project, "scripts", f));
  }
  const dst = path.join(project, "content/playbooks/demo");
  fs.mkdirSync(dst, { recursive: true });
  fs.mkdirSync(path.join(project, "images/playbooks/demo"), { recursive: true });
  fs.mkdirSync(vault);
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
