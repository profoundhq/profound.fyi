export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "css": "css" });
  eleventyConfig.addPassthroughCopy({ "js": "js" });
  eleventyConfig.addPassthroughCopy({ "images": "images" });

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return new Date(dateObj).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("toRoman", (num) => {
    const numerals = [
      ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400],
      ["C", 100], ["XC", 90], ["L", 50], ["XL", 40],
      ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1],
    ];
    let n = Math.floor(Number(num));
    if (!Number.isFinite(n) || n <= 0) return String(num);
    let out = "";
    for (const [symbol, value] of numerals) {
      while (n >= value) { out += symbol; n -= value; }
    }
    return out;
  });

  eleventyConfig.addCollection("sitemapPages", (collectionApi) => {
    return collectionApi.getAll().filter((item) => {
      if (!item.url) return false;
      if (item.url === "/sitemap.xml" || item.url === "/robots.txt") return false;
      return true;
    });
  });

  eleventyConfig.addFilter("sortByOrder", (collection) => {
    return [...collection].sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  eleventyConfig.addFilter("filterBySection", (collection, section) => {
    return collection.filter((item) => (item.data.section || "framework") === section);
  });

  eleventyConfig.addCollection("playbooks", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("content/playbooks/*/index.*")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
