import fs from "node:fs";
import { lawSummary } from "../../../lib/site-meta.js";

export default {
  tags: ["laws"],
  eleventyComputed: {
    // The breadcrumb trail runs Home / Laws / <tier> / <entry>
    crumbParent: (data) =>
      data.tier ? { name: `${data.tier}s`, url: `/laws/tiers/${data.tier.toLowerCase()}s/` } : undefined,
    // The page description, unless the vault note sets its own. It reads the
    // source file because the rendered body is not ready at this point.
    summary: (data) =>
      data.front ? lawSummary({ front: data.front, body: fs.readFileSync(data.page.inputPath, "utf8") }) : undefined,
  },
};
