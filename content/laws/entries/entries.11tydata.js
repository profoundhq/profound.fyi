export default {
  tags: ["laws"],
  eleventyComputed: {
    // The breadcrumb trail runs Home / Laws / <tier> / <entry>
    crumbParent: (data) =>
      data.tier ? { name: `${data.tier}s`, url: `/laws/tiers/${data.tier.toLowerCase()}s/` } : undefined,
  },
};
