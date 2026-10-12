export default {
  eleventyComputed: {
    permalink: (data) => `/laws/tiers/${data.slug}/`,
  },
};
