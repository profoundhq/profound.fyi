// markdown-it plugin: makes Markdown tables accessible without changing their
// source, because most are synced from the vault. Header cells get a column
// scope, each table gets a visually hidden caption from the heading above it,
// and a focusable wrapper lets keyboard users scroll wide tables.

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function accessibleTables(md) {
  md.core.ruler.push("accessible_tables", (state) => {
    const tokens = state.tokens;
    let heading = "";
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === "heading_open") heading = tokens[i + 1].content;
      if (token.type === "th_open") token.attrSet("scope", "col");
      if (token.type === "table_open") {
        const label = escape(heading || "Table");
        const open = new state.Token("html_block", "", 0);
        open.content = `<div class="table-scroll" role="region" aria-label="${label}" tabindex="0">\n`;
        const caption = new state.Token("html_block", "", 0);
        caption.content = `<caption class="visually-hidden">${label}</caption>\n`;
        tokens.splice(i, 1, open, token, caption);
        i += 2;
      }
      if (token.type === "table_close") {
        const close = new state.Token("html_block", "", 0);
        close.content = "</div>\n";
        tokens.splice(i + 1, 0, close);
        i += 1;
      }
    }
  });
}
