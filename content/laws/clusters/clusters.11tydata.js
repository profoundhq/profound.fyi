export default {
  eleventyComputed: {
    permalink: (data) => `/laws/clusters/${data.slug}/`,
  },
};
