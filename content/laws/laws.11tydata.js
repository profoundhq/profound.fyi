// Software Laws, synced from Obsidian by scripts/sync-laws.sh.
// Entries and pages live at /laws/<slug>/, the home page at /laws/.
export default {
  eleventyComputed: {
    permalink: (data) => (data.page.fileSlug === "laws" || data.page.fileSlug === "index" ? "/laws/" : `/laws/${data.slug}/`),
  },
};
