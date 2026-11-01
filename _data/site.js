export default {
  title: "Profound",
  description: "A collection of playbooks and instruments for understanding a system of work. Practices that travel; signals that tell you what your system is doing.",
  tagline: "playbooks and instruments for a system of work",
  ogImage: "/images/og-default.png",
  author: "Benedict Steele",
  license: "https://creativecommons.org/licenses/by-sa/4.0/",
  url: process.env.URL || "https://profound.fyi",
  locale: "en_GB",
  gaId: process.env.GA_ID || "",
  currentYear: new Date().getFullYear(),
  // The commit this build came from, published at /version.json so a check
  // can tell when a deploy has gone live. Netlify sets COMMIT_REF.
  commit: process.env.COMMIT_REF || process.env.GITHUB_SHA || "local",
  // security.txt must expire, so each build renews it for a year
  buildYearAhead: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d+Z$/, "Z"),
};
