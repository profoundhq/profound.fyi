import { QUESTIONS, scoreInventory, determineStyle, encodeAnswers, decodeAnswers } from "./scoring.js";

const STORAGE_KEY = "profound-comm-styles-v1";
const SVG_NS = "http://www.w3.org/2000/svg";

const STYLE_COPY = {
  Socialiser: {
    portrait: "Outgoing, enthusiastic, energised by people and possibilities.",
    bestAt: "Generating excitement, building rapport quickly, painting a vision.",
    flexToward: "When working with a Socialiser, allow time for stories and social warmth before driving to the task. Recognise their contribution out loud."
  },
  Relater: {
    portrait: "Warm, steady, attentive to feelings and group harmony.",
    bestAt: "Listening, supporting others, holding the team together under pressure.",
    flexToward: "When working with a Relater, slow down and signal that you care about the people involved, not just the outcome. Avoid pushing for fast decisions."
  },
  Director: {
    portrait: "Decisive, results-focused, comfortable taking charge.",
    bestAt: "Cutting through ambiguity, holding the line on outcomes, moving fast.",
    flexToward: "When working with a Director, be brief, be clear, and lead with results. Skip the small talk; bring options, not open questions."
  },
  Thinker: {
    portrait: "Analytical, precise, motivated by accuracy and quality.",
    bestAt: "Spotting flaws, structuring complex problems, building things that hold up.",
    flexToward: "When working with a Thinker, bring evidence, give them time to digest, and respect their need for detail. Don't rush them into a decision."
  }
};

// --- Storage helpers ------------------------------------------------------

function storageAvailable() {
  try {
    const k = "__cs_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function saveAnswers(answers) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ answers, computedAt: new Date().toISOString() })
  );
}

function loadAnswers() {
  if (!storageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.answers) || parsed.answers.length !== 18) return null;
    if (!parsed.answers.every((n) => Number.isInteger(n) && n >= 0 && n <= 3)) return null;
    return parsed.answers;
  } catch {
    return null;
  }
}

function clearStorage() {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// --- Form state -----------------------------------------------------------

function readAnswersFromForm(form) {
  const answers = [];
  for (const q of QUESTIONS) {
    const checked = form.querySelector(`input[name="q${q.id}"]:checked`);
    answers.push(checked ? Number(checked.value) : null);
  }
  return answers;
}

function setAnswersOnForm(form, answers) {
  for (let i = 0; i < QUESTIONS.length; i++) {
    const pos = answers[i];
    if (pos == null) continue;
    const input = form.querySelector(`input[name="q${QUESTIONS[i].id}"][value="${pos}"]`);
    if (input) input.checked = true;
  }
}

function countAnswered(answers) {
  return answers.filter((a) => a !== null).length;
}

function updateCounter(form) {
  const n = countAnswered(readAnswersFromForm(form));
  form.querySelector("[data-cs-counter]").textContent = String(n);
  form.querySelector("[data-cs-submit]").disabled = n < 18;
}

// --- DOM helpers ----------------------------------------------------------

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) if (child) node.appendChild(child);
  return node;
}

function svg(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) if (child) node.appendChild(child);
  return node;
}

function clearChildren(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// --- Render: quadrant -----------------------------------------------------

function buildQuadrant(totals) {
  const x = (totals.direct - totals.indirect) / 27;
  const y = (totals.open - totals.guarded) / 27;
  const cx = (50 + x * 45).toFixed(2);
  const cy = (50 - y * 45).toFixed(2);

  const root = svg("svg", {
    class: "cs-quadrant",
    viewBox: "0 0 100 100",
    role: "img",
    "aria-labelledby": "cs-quad-title cs-quad-desc"
  });
  root.appendChild(svg("title", { id: "cs-quad-title", text: "Your communication style position" }));
  root.appendChild(svg("desc",  { id: "cs-quad-desc",  text: `Plotted at ${cx} percent across, ${cy} percent down on the Open/Direct quadrant.` }));
  root.appendChild(svg("rect", { x: "0", y: "0", width: "100", height: "100", fill: "none", stroke: "currentColor", "stroke-width": "0.4" }));
  root.appendChild(svg("line", { x1: "50", y1: "0", x2: "50", y2: "100", stroke: "currentColor", "stroke-width": "0.2", opacity: "0.4" }));
  root.appendChild(svg("line", { x1: "0",  y1: "50", x2: "100", y2: "50", stroke: "currentColor", "stroke-width": "0.2", opacity: "0.4" }));
  root.appendChild(svg("text", { x: "4",  y: "8",  class: "cs-quad-label", text: "Relater" }));
  root.appendChild(svg("text", { x: "96", y: "8",  class: "cs-quad-label", "text-anchor": "end", text: "Socialiser" }));
  root.appendChild(svg("text", { x: "4",  y: "96", class: "cs-quad-label", text: "Thinker" }));
  root.appendChild(svg("text", { x: "96", y: "96", class: "cs-quad-label", "text-anchor": "end", text: "Director" }));
  root.appendChild(svg("text", { x: "50", y: "99", class: "cs-quad-axis", "text-anchor": "middle", text: "Direct →" }));
  root.appendChild(svg("text", { x: "50", y: "3",  class: "cs-quad-axis", "text-anchor": "middle", text: "↑ Open" }));
  root.appendChild(svg("circle", { cx, cy, r: "2.2", class: "cs-quad-dot" }));
  return root;
}

// --- Render: sub-scores ---------------------------------------------------

function buildSubscores(totals) {
  const list = el("dl", { class: "cs-subscores" });
  const pairs = [
    ["Open", totals.open, "Guarded", totals.guarded],
    ["Direct", totals.direct, "Indirect", totals.indirect]
  ];
  for (const [a, av, b, bv] of pairs) {
    const row = el("div", { class: "cs-subscore" });
    row.appendChild(el("dt", { text: a }));
    row.appendChild(el("dd", { text: String(av) }));
    row.appendChild(el("dt", { text: b }));
    row.appendChild(el("dd", { text: String(bv) }));
    const bar = el("div", { class: "cs-subscore-bar" });
    const fill = el("span");
    fill.style.width = `${(av / 27 * 100).toFixed(1)}%`;
    bar.appendChild(fill);
    row.appendChild(bar);
    list.appendChild(row);
  }
  return list;
}

// --- Render: style cards --------------------------------------------------

function buildStyleCards(style) {
  const order = ["Socialiser", "Relater", "Director", "Thinker"];
  const userStyles = new Set(style.style.split(" / "));
  const wrap = el("div", { class: "cs-style-cards" });

  for (const name of order) {
    const copy = STYLE_COPY[name];
    if (!copy) continue;
    const isUser = userStyles.has(name);
    const card = el("article", { class: isUser ? "cs-style-card cs-style-card-mine" : "cs-style-card" });

    const heading = el("h3", { text: name });
    if (isUser) {
      heading.appendChild(document.createTextNode(" "));
      heading.appendChild(el("span", { class: "cs-mine-badge", text: "your style" }));
    }
    card.appendChild(heading);
    card.appendChild(el("p", { class: "cs-portrait", text: copy.portrait }));

    const best = el("p");
    best.appendChild(el("strong", { text: "At their best: " }));
    best.appendChild(document.createTextNode(copy.bestAt));
    card.appendChild(best);

    const flex = el("p");
    flex.appendChild(el("strong", { text: "How to flex toward this style: " }));
    flex.appendChild(document.createTextNode(copy.flexToward));
    card.appendChild(flex);

    wrap.appendChild(card);
  }
  return wrap;
}

// --- Render: full results -------------------------------------------------

function renderResults(target, totals, style) {
  clearChildren(target);

  target.appendChild(el("h2", { text: `Your style: ${style.style}` }));
  target.appendChild(buildQuadrant(totals));
  target.appendChild(buildSubscores(totals));
  target.appendChild(buildStyleCards(style));

  const actions = el("p", { class: "cs-actions" });
  const reset = el("a", { href: "#", "data-cs-reset": "", text: "Start over" });
  reset.addEventListener("click", (e) => {
    e.preventDefault();
    const form = document.getElementById("cs-form");
    form.reset();
    clearUrl();
    clearStorage();
    target.hidden = true;
    clearChildren(target);
    const restorePrompt = document.querySelector(".cs-restore-prompt");
    if (restorePrompt) restorePrompt.hidden = true;
    updateCounter(form);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  actions.appendChild(reset);
  target.appendChild(actions);

  target.hidden = false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- URL helpers ----------------------------------------------------------

function writeUrl(answers) {
  const url = new URL(window.location.href);
  url.searchParams.set("a", encodeAnswers(answers));
  window.history.replaceState({}, "", url);
}

function clearUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("a");
  window.history.replaceState({}, "", url);
}

// --- Submit flow ----------------------------------------------------------

function submitFlow(form, resultsEl) {
  const answers = readAnswersFromForm(form);
  if (countAnswered(answers) < 18) return;
  const totals = scoreInventory(answers);
  const style = determineStyle(totals);
  writeUrl(answers);
  saveAnswers(answers);
  renderResults(resultsEl, totals, style);
}

// --- Init -----------------------------------------------------------------

function init() {
  const form = document.getElementById("cs-form");
  const resultsEl = document.getElementById("cs-results");
  const restorePrompt = document.querySelector(".cs-restore-prompt");
  if (!form || !resultsEl) return;

  form.addEventListener("change", () => updateCounter(form));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitFlow(form, resultsEl);
  });

  const urlAnswers = decodeAnswers(new URL(window.location.href).searchParams.get("a"));
  if (urlAnswers) {
    setAnswersOnForm(form, urlAnswers);
    const totals = scoreInventory(urlAnswers);
    const style = determineStyle(totals);
    renderResults(resultsEl, totals, style);
  } else if (restorePrompt && loadAnswers()) {
    restorePrompt.hidden = false;
    restorePrompt.querySelector("[data-cs-restore]").addEventListener("click", (e) => {
      e.preventDefault();
      const saved = loadAnswers();
      if (!saved) return;
      setAnswersOnForm(form, saved);
      updateCounter(form);
      restorePrompt.hidden = true;
    });
  }

  updateCounter(form);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
