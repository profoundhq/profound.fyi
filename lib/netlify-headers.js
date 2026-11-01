// Reads the [[headers]] rules in netlify.toml so tests and the local CSP
// check use the same headers Netlify sends. It handles only the shape that
// file uses: `for = "..."` followed by `Name = "value"` lines.

export function parseHeaders(toml) {
  const rules = [];
  let current = null;
  for (const line of toml.split("\n").map((l) => l.trim())) {
    if (line.startsWith("[[")) {
      current = line === "[[headers]]" ? { for: "", values: {} } : null;
      if (current) rules.push(current);
      continue;
    }
    if (!current || line.startsWith("[") || line.startsWith("#")) continue;
    const match = line.match(/^([\w-]+)\s*=\s*"((?:[^"\\]|\\.)*)"$/);
    if (!match) continue;
    const value = match[2].replace(/\\(.)/g, "$1");
    if (match[1] === "for") current.for = value;
    else current.values[match[1]] = value;
  }
  return rules;
}

// Netlify paths use * as a wildcard for the rest of the path
function pathMatches(pattern, path) {
  const re = new RegExp(`^${pattern.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
  return re.test(path);
}

export function headersFor(rules, path) {
  return Object.assign({}, ...rules.filter((r) => pathMatches(r.for, path)).map((r) => r.values));
}

export function parseCsp(policy) {
  return Object.fromEntries(
    policy
      .split(";")
      .map((d) => d.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...sources]) => [name, sources]),
  );
}

// Whether a URL loaded from another origin is allowed by a directive. Covers
// host sources (with *. wildcards) and scheme sources, which is all the site's
// policy uses. 'self' never matches here because the URLs are third-party.
export function cspAllows(csp, directive, url) {
  const sources = csp[directive] ?? csp["default-src"] ?? [];
  const { protocol, hostname } = new URL(url);
  return sources.some((source) => {
    if (/^[a-z][\w+.-]*:$/.test(source)) return protocol === source;
    const host = source.match(/^(https?:)\/\/([^/:]+)/);
    if (!host || host[1] !== protocol) return false;
    if (host[2].startsWith("*.")) return hostname.endsWith(host[2].slice(1));
    return hostname === host[2];
  });
}
