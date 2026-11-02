// The Software Laws as records, read once per build from the synced entries
// and cluster pages. Feeds /laws.json, /laws/<slug>.md, and the agent skill.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import site from "./site.js";
import { buildLaws } from "../lib/laws-data.js";

const read = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return { data, body: content };
    });

export default function () {
  return buildLaws({
    entries: read("content/laws/entries"),
    clusters: read("content/laws/clusters"),
    siteUrl: site.url,
  });
}
