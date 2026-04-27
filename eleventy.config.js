export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "css": "css" });

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
  };
}
