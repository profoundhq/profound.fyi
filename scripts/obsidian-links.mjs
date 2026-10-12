// Rewrite Obsidian wikilinks and embeds into plain Markdown for a synced playbook.
// Called by scripts/sync-playbook.sh once per output file.
//
// Usage:
//   node scripts/obsidian-links.mjs <slug> <source-path> <attachments-path> <source-file> <file>
//
// Handles:
//   [[Note]], [[Note|Alias]], [[Note#Heading]]  -> [text](/playbooks/<slug>/note/)
//   ![[image.png]], ![[image.png|alt]]          -> ![alt](/images/playbooks/<slug>/image.png)
//   ![alt](relative/image.png)                  -> same, with the file copied across
//   [text](relative/note.md)                    -> [text](/playbooks/<slug>/note/)
//   [text](relative/deck.pptx)                  -> same, with the file copied across
//   ![[Note]] (note transclusion)               -> plain link, with a warning
// Unresolved links become plain text, with a warning. Code blocks and inline
// code are left untouched. Headings have no ids on this site, so #Heading
// fragments are dropped.

import fs from "node:fs";
import path from "node:path";

const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|avif)$/i;
const ATTACHMENT_EXT = /\.(pdf|pptx?|key|docx?|xlsx?|csv|zip)$/i;

// Same slug rules as sync-playbook.sh: strip an "NN-" or "NN " prefix,
// lowercase, and turn spaces and punctuation into hyphens.
export function slugFromBasename(base) {
  return base
    .replace(/^[0-9]+[- ](?=.)/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugifyFilename(name) {
  const ext = path.extname(name).toLowerCase();
  const stem = path.basename(name, path.extname(name));
  const clean = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean + ext;
}

// Map lowercased note names (with and without NN- prefix) to site URLs.
export function buildNoteIndex(src, slug) {
  const index = new Map();
  const add = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const base = path.basename(file, ".md");
      const noteSlug = slugFromBasename(base);
      if (base === "_index" || noteSlug === "index") continue;
      const url = `/playbooks/${slug}/${prefix}${noteSlug}/`;
      index.set(base.toLowerCase(), url);
      index.set(base.replace(/^[0-9]+[- ]/, "").toLowerCase(), url);
      index.set(noteSlug, url);
    }
  };
  add(src, "");
  add(path.join(src, "artefacts"), "artefacts/");
  return index;
}

function splitTarget(raw) {
  const [targetAndHeading, alias] = raw.split("|");
  const [target, heading] = targetAndHeading.split("#");
  return { target: target.trim(), heading: heading?.trim(), alias: alias?.trim() };
}

// Apply fn to prose only, skipping fenced code blocks and inline code spans.
function mapProse(text, fn) {
  const fence = /^(```|~~~)[\s\S]*?^\1[^\n]*$/gm;
  const inline = /(`+)[\s\S]*?\1/g;
  const mapInline = (chunk) => {
    let out = "";
    let last = 0;
    for (const m of chunk.matchAll(inline)) {
      out += fn(chunk.slice(last, m.index)) + m[0];
      last = m.index + m[0].length;
    }
    return out + fn(chunk.slice(last));
  };
  let out = "";
  let last = 0;
  for (const m of text.matchAll(fence)) {
    out += mapInline(text.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  return out + mapInline(text.slice(last));
}

// resolveNote(name) -> url | undefined
// resolveImage(ref) -> public url | undefined (copies the file as a side effect)
export function transform(body, { resolveNote, resolveImage, warn = () => {} }) {
  return mapProse(body, (prose) =>
    prose
      // Embeds and links in one pass, so an unresolved embed left in place
      // is not then re-read as a link: ![[file|alt]], [[Note|Alias]], [[Note#Heading]]
      .replace(/(!?)\[\[([^\]\n]+)\]\]/g, (match, bang, raw) => {
        const { target, heading, alias } = splitTarget(raw);
        if (bang && IMAGE_EXT.test(target)) {
          const url = resolveImage(target);
          if (!url) {
            warn(`attachment not found: ${target}`);
            return match;
          }
          // Obsidian uses |300 or |300x200 for sizing; that is not alt text.
          const alt = alias && !/^\d+(x\d+)?$/.test(alias) ? alias : "";
          return `![${alt}](${url})`;
        }
        const text = alias || (target ? target.replace(/^[0-9]+-/, "") : heading) || raw;
        if (!target) return text; // [[#Heading]] on the same page
        const url = resolveNote(target);
        if (!url) {
          warn(`unresolved ${bang ? "embed" : "link"}: ${target}`);
          return text;
        }
        if (bang) warn(`note embed converted to a link: ${target}`);
        return `[${text}](${url})`;
      })
      // Standard Markdown images with relative paths
      .replace(/!\[([^\]\n]*)\]\(([^)\s]+)\)/g, (match, alt, ref) => {
        if (/^([a-z]+:|\/|#)/i.test(ref) || !IMAGE_EXT.test(ref)) return match;
        const url = resolveImage(decodeURI(ref));
        if (!url) {
          warn(`attachment not found: ${ref}`);
          return match;
        }
        return `![${alt}](${url})`;
      })
      // Standard Markdown links to other notes or to attachments, with relative paths
      .replace(/(?<!!)\[([^\]\n]*)\]\(([^)\s]+)\)/g, (match, text, ref) => {
        if (/^([a-z]+:|\/|#)/i.test(ref)) return match;
        const [file] = decodeURI(ref).split("#");
        if (/\.md$/i.test(file)) {
          const url = resolveNote(path.basename(file, path.extname(file)));
          if (!url) {
            warn(`unresolved link: ${ref}`);
            return text;
          }
          return `[${text}](${url})`;
        }
        if (ATTACHMENT_EXT.test(file)) {
          const url = resolveImage(file);
          if (!url) {
            warn(`attachment not found: ${ref}`);
            return match;
          }
          return `[${text}](${url})`;
        }
        return match;
      }),
  );
}

function findFile(dir, name) {
  const wanted = path.basename(name).toLowerCase();
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.toLowerCase() === wanted) return full;
    }
  }
}

function main([slug, src, attachments, sourceFile, file]) {
  const index = buildNoteIndex(src, slug);
  const imageDir = path.join("images", "playbooks", slug);
  const sourceDir = path.dirname(sourceFile);
  const warn = (msg) => console.error(`  [warn] ${path.basename(file)}: ${msg}`);

  const resolveNote = (name) => index.get(name.replace(/\.md$/i, "").toLowerCase());
  const resolveImage = (ref) => {
    const direct = [path.resolve(sourceDir, ref), path.resolve(src, ref)];
    const found =
      direct.find((p) => fs.existsSync(p)) || findFile(attachments, ref) || findFile(src, ref);
    if (!found) return undefined;
    const outName = slugifyFilename(path.basename(found));
    fs.mkdirSync(imageDir, { recursive: true });
    fs.copyFileSync(found, path.join(imageDir, outName));
    return `/${imageDir}/${outName}`;
  };

  const text = fs.readFileSync(file, "utf8");
  // Leave frontmatter alone
  const fm = text.match(/^---\n[\s\S]*?\n---\n/);
  const head = fm ? fm[0] : "";
  const body = text.slice(head.length);
  fs.writeFileSync(file, head + transform(body, { resolveNote, resolveImage, warn }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2));
}
