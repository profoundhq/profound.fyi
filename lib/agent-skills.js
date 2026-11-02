// The agent skills discovery index (specification.website, Agent Skills
// discovery). Each entry carries a digest of the exact SKILL.md bytes the
// site serves, so the templates must output the content unchanged.
import { createHash } from "node:crypto";
import matter from "gray-matter";

export function skillIndex(skills, site) {
  return JSON.stringify(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: skills.map(({ name, path, content }) => ({
        name,
        type: "skill-md",
        description: matter(content).data.description ?? "",
        url: `${site.url}${path}`,
        digest: `sha256:${createHash("sha256").update(content).digest("hex")}`,
      })),
    },
    null,
    2,
  );
}
