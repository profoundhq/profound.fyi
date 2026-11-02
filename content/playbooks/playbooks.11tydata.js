export default {
  layout: "layouts/playbook-page.njk",
  eleventyComputed: {
    // The same page as Markdown, linked from the page head for agents.
    // Decks and landing pages have no Markdown version.
    markdownUrl: (data) =>
      data.page.inputPath.endsWith(".md") && !data.page.inputPath.endsWith(".marp.md") && data.page.url
        ? data.page.url.replace(/\/$/, ".md")
        : undefined,
  },
};
