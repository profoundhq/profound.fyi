// Replay edits made to a synced playbook in this repo back into its
// Obsidian source notes. The forward sync (sync-playbook.sh) is one-way
// and lossy (em dashes become hyphens, wikilinks become links, files are
// renamed), so this does not copy files back. It replays edits instead:
//
//   1. Diff each changed page against a git ref from before the edits
//      (--since), word by word, so only repo-side edits are replayed.
//   2. Find each edit's old text in the matching vault note, allowing for
//      the forward sync's em dash and "agentic AI" rewrites.
//   3. Replace it only where it matches exactly once. Skip edits the vault
//      already has. Report conflicts, ambiguous matches, frontmatter
//      changes, and new or deleted pages, and change nothing for them.
//
// Dry run by default. --apply writes the notes, after backing each one up.
// It never creates, deletes, or renames a note. Afterwards, running the
// forward sync should produce no diff for the replayed pages.
//
// Usage:
//   node scripts/sync-back.mjs <slug> <source-path> --since <git-ref> [--apply] [--backup-dir <dir>]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";
import { slugFromBasename } from "./obsidian-links.mjs";

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;
const bodyOf = (text) => text.replace(FRONTMATTER, "");
const tokenize = (text) => text.split(/(\s+)/).filter((t) => t !== "");
const isWord = (token) => !/^\s+$/.test(token);
const words = (text) => tokenize(text).filter(isWord).length;

// The forward sync's rewrites that keep every character in place, so a
// match found in the normalised vault text maps straight back onto it
const normalise = (text) => text.replace(/—/g, "-").replace(/agentic AI/g, "Agentic AI");

function count(haystack, needle) {
  if (!needle) return 0;
  let n = 0;
  for (let i = haystack.indexOf(needle); i !== -1; i = haystack.indexOf(needle, i + 1)) n++;
  return n;
}

// Myers' diff over tokens: a list of ["eq" | "del" | "ins", aIndex, bIndex]
function diff(a, b) {
  const n = a.length;
  const m = b.length;
  const v = new Map([[1, 0]]);
  const trace = [];
  for (let d = 0; d <= n + m; d++) {
    trace.push(new Map(v));
    for (let k = -d; k <= d; k += 2) {
      const down = k === -d || (k !== d && (v.get(k - 1) ?? -1) < (v.get(k + 1) ?? -1));
      let x = down ? v.get(k + 1) ?? 0 : (v.get(k - 1) ?? 0) + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v.set(k, x);
      if (x >= n && y >= m) return backtrack(trace, n, m);
    }
  }
  return [];
}

function backtrack(trace, n, m) {
  const ops = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    const k = x - y;
    const down = k === -d || (k !== d && (v.get(k - 1) ?? -1) < (v.get(k + 1) ?? -1));
    const prevK = down ? k + 1 : k - 1;
    const prevX = v.get(prevK) ?? 0;
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) ops.push(["eq", --x, --y]);
    if (d > 0) {
      if (x === prevX) ops.push(["ins", null, --y]);
      else ops.push(["del", --x, null]);
    }
    x = prevX;
    y = prevY;
  }
  return ops.reverse();
}

// The edits between two versions of a page body, as hunks with up to 40
// tokens of the base text on each side for context
export function editHunks(baseText, oursText) {
  const a = tokenize(bodyOf(baseText));
  const b = tokenize(bodyOf(oursText));
  const ops = diff(a, b);
  const hunks = [];
  let current = null;
  let gap = 0;
  let aPos = 0;
  for (const [type, ai, bi] of ops) {
    if (type === "eq") {
      aPos = ai + 1;
      if (current) {
        gap++;
        current.pendingEq.push(a[ai]);
        // Edits two words or fewer apart become one hunk
        if (gap > 4) {
          current.pendingEq.length = 0;
          hunks.push(current);
          current = null;
        }
      }
      continue;
    }
    if (!current) current = { aStart: type === "del" ? ai : aPos, aEnd: type === "del" ? ai : aPos, newTokens: [], pendingEq: [] };
    if (current.pendingEq.length) {
      current.aEnd += current.pendingEq.length;
      current.newTokens.push(...current.pendingEq);
      current.pendingEq.length = 0;
    }
    gap = 0;
    if (type === "del") {
      current.aEnd = ai + 1;
      aPos = ai + 1;
    } else {
      current.newTokens.push(b[bi]);
    }
  }
  if (current) hunks.push(current);
  return hunks.map(({ aStart, aEnd, newTokens }) => ({
    old: a.slice(aStart, aEnd).join(""),
    new: newTokens.join(""),
    left: a.slice(Math.max(0, aStart - 40), aStart),
    right: a.slice(aEnd, aEnd + 40),
  }));
}

// Apply hunks to a vault note's text. Each result says what happened.
export function replayHunks(vaultText, hunks) {
  let text = vaultText;
  const results = [];
  for (const h of hunks) {
    const start = words(h.old) >= 3 ? 0 : 2;
    let result = null;
    let lastCount = 0;
    for (let k = start; k <= 24; k += 2) {
      const left = h.left.slice(Math.max(0, h.left.length - k)).join("");
      const right = h.right.slice(0, k).join("");
      const oldSnippet = left + h.old + right;
      const view = normalise(text);
      lastCount = count(view, oldSnippet);
      if (lastCount === 1) {
        const i = view.indexOf(oldSnippet);
        const keepLeft = text.slice(i, i + left.length);
        const keepRight = text.slice(i + left.length + h.old.length, i + oldSnippet.length);
        text = text.slice(0, i) + keepLeft + h.new + keepRight + text.slice(i + oldSnippet.length);
        result = "applied";
        break;
      }
      if (lastCount === 0) break;
    }
    if (!result) {
      if (lastCount > 1) {
        result = "ambiguous";
      } else {
        const k = Math.max(start, 4);
        const left = h.left.slice(Math.max(0, h.left.length - k)).join("");
        const right = h.right.slice(0, k).join("");
        result = count(normalise(text), left + h.new + right) > 0 ? "already" : "conflict";
      }
    }
    results.push({ status: result, old: h.old, new: h.new });
  }
  return { text, results };
}

// The vault note (path relative to the source folder) a repo page came
// from. Top-level pages come from top-level notes, artefact pages from
// artefacts/ first, then from top-level notes with an artefacts permalink.
export function noteFor(repoRel, notes) {
  const slugOf = (p) => slugFromBasename(path.basename(p, ".md"));
  const wanted = slugOf(repoRel);
  const top = notes.filter((n) => !n.includes("/") && path.basename(n, ".md") !== "_index");
  const artefacts = notes.filter((n) => n.startsWith("artefacts/"));
  const pools = repoRel.startsWith("artefacts/") ? [artefacts, top] : [top];
  for (const pool of pools) {
    const hits = pool.filter((n) => slugOf(n) === wanted);
    if (hits.length > 1) throw new Error(`more than one note could be ${repoRel}: ${hits.join(", ")}`);
    if (hits.length === 1) return hits[0];
  }
  return undefined;
}

// Frontmatter keys that differ. The forward sync rewrites frontmatter, so
// these are reported for a person to carry back, not replayed.
export function frontmatterChanges(baseText, oursText) {
  const a = matter(baseText).data;
  const b = matter(oursText).data;
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((key) => !same(a[key], b[key])).sort();
}

function listNotes(src) {
  const notes = fs.readdirSync(src).filter((f) => f.endsWith(".md") && !f.endsWith(".marp.md"));
  const artefacts = path.join(src, "artefacts");
  if (fs.existsSync(artefacts)) {
    notes.push(...fs.readdirSync(artefacts).filter((f) => f.endsWith(".md")).map((f) => `artefacts/${f}`));
  }
  return notes;
}

function main(argv) {
  const args = [...argv];
  const flag = (name) => {
    const i = args.indexOf(name);
    if (i === -1) return undefined;
    const value = args[i + 1];
    args.splice(i, 2);
    return value;
  };
  const apply = args.includes("--apply");
  if (apply) args.splice(args.indexOf("--apply"), 1);
  const since = flag("--since");
  const backupFlag = flag("--backup-dir");
  const [slug, src] = args;
  if (!slug || !src || !since) {
    console.error("Usage: node scripts/sync-back.mjs <slug> <source-path> --since <git-ref> [--apply] [--backup-dir <dir>]");
    process.exit(2);
  }
  if (!fs.existsSync(src)) {
    console.error(`Source folder not found: ${src}`);
    process.exit(2);
  }
  const dst = `content/playbooks/${slug}`;
  const git = (...a) => execFileSync("git", a, { encoding: "utf8" });
  const changed = git("diff", "--name-only", since, "--", dst)
    .split("\n")
    .filter((f) => f.endsWith(".md") && !f.endsWith(".marp.md"));
  const added = git("ls-files", "--others", "--exclude-standard", "--", dst)
    .split("\n")
    .filter((f) => f.endsWith(".md") && !f.endsWith(".marp.md"));

  const notes = listNotes(src);
  const backupRoot = backupFlag || path.join(src, "..", ".sync-back-backups", new Date().toISOString().replace(/[:.]/g, "-"), slug);
  const tally = { applied: 0, already: 0, conflict: 0, ambiguous: 0, attention: 0 };

  console.log(`${apply ? "APPLYING" : "DRY RUN"}: repo edits to ${dst} since ${since}, into ${src}\n`);
  for (const file of added) {
    console.log(`NEW PAGE ${file}: create its note in the vault by hand`);
    tally.attention++;
  }
  for (const file of changed) {
    const rel = path.relative(dst, file);
    if (!fs.existsSync(file)) {
      console.log(`DELETED ${rel}: delete or rename its note in the vault by hand`);
      tally.attention++;
      continue;
    }
    let base;
    try {
      base = git("show", `${since}:${file}`);
    } catch {
      console.log(`NEW PAGE ${rel}: create its note in the vault by hand`);
      tally.attention++;
      continue;
    }
    const ours = fs.readFileSync(file, "utf8");
    let note;
    try {
      note = noteFor(rel, notes);
    } catch (error) {
      console.log(`UNMATCHED ${rel}: ${error.message}`);
      tally.attention++;
      continue;
    }
    if (!note) {
      console.log(`UNMATCHED ${rel}: no vault note found for it`);
      tally.attention++;
      continue;
    }
    const fields = frontmatterChanges(base, ours);
    const notePath = path.join(src, note);
    const { text, results } = replayHunks(fs.readFileSync(notePath, "utf8"), editHunks(base, ours));
    console.log(`${rel}  ->  ${note}`);
    for (const r of results) {
      tally[r.status]++;
      const show = (s) => JSON.stringify(s.length > 140 ? `${s.slice(0, 137)}...` : s);
      console.log(`  ${r.status.toUpperCase().padEnd(9)} ${show(r.old)} -> ${show(r.new)}`);
    }
    if (fields.length) {
      console.log(`  FRONTMATTER changed (${fields.join(", ")}): carry it back by hand`);
      tally.attention++;
    }
    if (apply && results.some((r) => r.status === "applied")) {
      const backup = path.join(backupRoot, note);
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      if (!fs.existsSync(backup)) fs.copyFileSync(notePath, backup);
      fs.writeFileSync(notePath, text);
    }
  }
  console.log(
    `\n${apply ? "Applied" : "Would apply"}: ${tally.applied}   already in the vault: ${tally.already}   conflicts: ${tally.conflict}   ambiguous: ${tally.ambiguous}   need you: ${tally.attention}`,
  );
  if (apply && tally.applied) console.log(`Backups: ${backupRoot}`);
  if (!apply) console.log("Nothing was changed. Add --apply to write the notes.");
  else console.log(`Check: run scripts/sync-playbook.sh ${slug} "${src}" and expect no diff for the replayed pages.`);
  process.exit(tally.conflict || tally.ambiguous || tally.attention ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
