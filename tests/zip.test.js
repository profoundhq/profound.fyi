import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { crc32, zip } from "../lib/zip.js";

// Python's zipfile is an independent reader. CI always has it. If a build
// image ever lacks it, skip rather than block the deploy.
const hasPython = (() => {
  try {
    execFileSync("python3", ["-I", "-c", "import zipfile"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

test("crc32 matches the standard check values", () => {
  assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926);
  assert.equal(crc32(Buffer.from("")), 0);
});

test("zip writes an archive that a standard reader extracts byte for byte", { skip: !hasPython && "python3 not available" }, () => {
  const files = [
    { name: "profound-software-laws/SKILL.md", data: "---\nname: profound-software-laws\n---\n# Héllo\n" },
    { name: "profound-software-laws/references/laws.md", data: "# Laws\n" },
  ];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zip-test-"));
  const file = path.join(dir, "out.zip");
  fs.writeFileSync(file, zip(files));
  const script = "import sys,zipfile\nz=zipfile.ZipFile(sys.argv[1])\nassert z.testzip() is None\nfor n in z.namelist(): sys.stdout.write(n+'\\0'+z.read(n).decode()+'\\0')";
  const out = execFileSync("python3", ["-I", "-c", script, file], { encoding: "utf8" }).split("\0").filter(Boolean);
  assert.deepEqual(out, files.flatMap((f) => [f.name, f.data]));
});

test("zip output does not change between builds", () => {
  const files = [{ name: "a.md", data: "same" }];
  assert.deepEqual(zip(files), zip(files));
});
