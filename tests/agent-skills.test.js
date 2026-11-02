import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { skillIndex } from "../lib/agent-skills.js";

const site = { url: "https://x.test" };
const sha = (s) => `sha256:${createHash("sha256").update(s).digest("hex")}`;

test("skillIndex lists every skill with a digest of the exact bytes served", () => {
  const laws = '---\nname: profound-software-laws\ndescription: "Laws: when they hold."\n---\nBody\n';
  const plays = '---\nname: okrs\ndescription: "Plays."\n---\nBody\n';
  const index = JSON.parse(
    skillIndex(
      [
        { name: "profound-software-laws", path: "/.well-known/agent-skills/profound-software-laws/SKILL.md", content: laws },
        { name: "profound-okrs", path: "/.well-known/agent-skills/profound-okrs/SKILL.md", content: plays },
      ],
      site,
    ),
  );
  assert.equal(index.$schema, "https://schemas.agentskills.io/discovery/0.2.0/schema.json");
  assert.deepEqual(
    index.skills.map((s) => [s.name, s.type, s.url, s.digest, s.description]),
    [
      ["profound-software-laws", "skill-md", "https://x.test/.well-known/agent-skills/profound-software-laws/SKILL.md", sha(laws), "Laws: when they hold."],
      ["profound-okrs", "skill-md", "https://x.test/.well-known/agent-skills/profound-okrs/SKILL.md", sha(plays), "Plays."],
    ],
  );
});
