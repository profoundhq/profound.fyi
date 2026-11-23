import {
  QUESTIONS,
  DIMENSIONS,
  SCALE,
  scoreSurvey,
  lowestStatements,
  weakestDimensions,
  encodeAnswers,
  decodeAnswers,
} from "./scoring.js";

const STORAGE_KEY = "profound-learning-culture-v1";
const TOTAL = QUESTIONS.length;

// --- Storage (per-viewer convenience only, so every access is guarded) ----

function save(answers) {
  try {
    window.localStorage.setItem(STORAGE_KEY, encodeAnswers(answers));
  } catch {
    // Storage blocked or full: the URL still holds the answers.
  }
}

function load() {
  try {
    return decodeAnswers(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function clearSaved() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

// --- Form state -----------------------------------------------------------

function readAnswers(form) {
  return QUESTIONS.map((q) => {
    const checked = form.querySelector(`input[name="q${q.id}"]:checked`);
    return checked ? Number(checked.value) : null;
  });
}

function setAnswers(form, answers) {
  QUESTIONS.forEach((q, i) => {
    const input = form.querySelector(`input[name="q${q.id}"][value="${answers[i]}"]`);
    if (input) input.checked = true;
  });
}

function updateCounter(form) {
  const answered = readAnswers(form).filter((a) => a !== null).length;
  form.querySelector("[data-lc-counter]").textContent = String(answered);
  form.querySelector("[data-lc-submit]").disabled = answered < TOTAL;
}

// --- URL ------------------------------------------------------------------

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

// --- Rendering ------------------------------------------------------------

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function scrollTo(node) {
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  node.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

function renderScores(target, scores) {
  target.replaceChildren();
  for (const d of DIMENSIONS) {
    const row = el("div", { class: "lc-score" });
    row.appendChild(el("dt", {}, d.name));
    row.appendChild(el("dd", { class: "lc-score-value" }, `${scores[d.id].toFixed(1)} out of 5`));
    const bar = el("dd", { class: "cs-subscore-bar", "aria-hidden": "true" });
    const fill = el("span");
    fill.style.width = `${(((scores[d.id] - 1) / 4) * 100).toFixed(1)}%`;
    bar.appendChild(fill);
    row.appendChild(bar);
    row.appendChild(el("dd", { class: "lc-score-summary" }, d.summary));
    target.appendChild(row);
  }
}

function renderResults(results, answers) {
  const scores = scoreSurvey(answers);
  renderScores(results.querySelector("[data-lc-scores]"), scores);

  const weakest = weakestDimensions(scores);
  const names = DIMENSIONS.filter((d) => weakest.includes(d.id)).map((d) => d.name);
  results.querySelector("[data-lc-weakest]").textContent =
    names.length === DIMENSIONS.length
      ? "Your scores are level across all four dimensions. These practices from the Continuous Learning Catalogue can help."
      : `Your lowest score is ${names.join(" and ")}. These practices from the Continuous Learning Catalogue can help.`;

  // One list of practices for every weakest dimension, without repeats.
  const practices = results.querySelector("[data-lc-practice-list]");
  practices.replaceChildren();
  const seen = new Set();
  for (const id of weakest) {
    const template = results.querySelector(`template[data-lc-practices="${id}"]`);
    for (const item of template.content.querySelectorAll("li")) {
      const href = item.querySelector("a").getAttribute("href");
      if (seen.has(href)) continue;
      seen.add(href);
      practices.appendChild(item.cloneNode(true));
    }
  }

  const lowest = results.querySelector("[data-lc-lowest]");
  lowest.replaceChildren();
  for (const q of lowestStatements(answers, 3)) {
    const item = el("li", {}, q.text);
    const note = q.reverse ? " Agreeing with this one lowers the score." : "";
    item.appendChild(el("span", { class: "lc-lowest-answer" }, ` You answered: ${SCALE[answers[q.id - 1] - 1].toLowerCase()}.${note}`));
    lowest.appendChild(item);
  }

  document.getElementById("lc-form").hidden = true;
  document.querySelector(".cs-intro").hidden = true;
  document.querySelector(".cs-restore-prompt").hidden = true;
  results.hidden = false;
  scrollTo(results);
}

// --- Init -----------------------------------------------------------------

function init() {
  const form = document.getElementById("lc-form");
  const results = document.getElementById("lc-results");
  const restore = document.querySelector(".cs-restore-prompt");
  if (!form || !results) return;

  form.addEventListener("change", () => updateCounter(form));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answers = readAnswers(form);
    if (answers.some((a) => a === null)) return;
    writeUrl(answers);
    save(answers);
    renderResults(results, answers);
  });

  results.querySelector("[data-lc-reset]").addEventListener("click", (event) => {
    event.preventDefault();
    form.reset();
    clearUrl();
    clearSaved();
    results.hidden = true;
    form.hidden = false;
    document.querySelector(".cs-intro").hidden = false;
    updateCounter(form);
    scrollTo(form);
  });

  const fromUrl = decodeAnswers(new URL(window.location.href).searchParams.get("a"));
  if (fromUrl) {
    setAnswers(form, fromUrl);
    renderResults(results, fromUrl);
  } else if (load()) {
    restore.hidden = false;
    restore.querySelector("[data-lc-restore]").addEventListener("click", (event) => {
      event.preventDefault();
      const saved = load();
      if (!saved) return;
      setAnswers(form, saved);
      updateCounter(form);
      restore.hidden = true;
    });
  }

  updateCounter(form);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
