import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { skillIndex } from "../lib/agent-skills.js";

const site = { url: "https://x.test" };
const sha = (s) => `sha256:${createHash("sha256").update(s).digest("hex")}`;

test("skillIndex lists every skill with a digest of the exact bytes served", () => {
  const laws = '---\nname: software-laws\ndescription: "Laws: when they hold."\n---\nBody\n';
  const plays = '---\nname: profound-playbooks\ndescription: "Plays."\n---\nBody\n';
  const index = JSON.parse(
    skillIndex(
      [
        { name: "software-laws", path: "/.well-known/agent-skills/software-laws/SKILL.md", content: laws },
        { name: "profound-playbooks", path: "/.well-known/agent-skills/profound-playbooks/SKILL.md", content: plays },
      ],
      site,
    ),
  );
  assert.equal(index.$schema, "https://schemas.agentskills.io/discovery/0.2.0/schema.json");
  assert.deepEqual(
    index.skills.map((s) => [s.name, s.type, s.url, s.digest, s.description]),
    [
      ["software-laws", "skill-md", "https://x.test/.well-known/agent-skills/software-laws/SKILL.md", sha(laws), "Laws: when they hold."],
      ["profound-playbooks", "skill-md", "https://x.test/.well-known/agent-skills/profound-playbooks/SKILL.md", sha(plays), "Plays."],
    ],
  );
});
