import { QUESTIONS, scoreInventory, determineStyle, encodeAnswers, decodeAnswers } from "./scoring.js";

const STORAGE_KEY = "profound-comm-styles-v1";

function readAnswersFromForm(form) {
  const answers = [];
  for (const q of QUESTIONS) {
    const el = form.querySelector(`input[name="q${q.id}"]:checked`);
    answers.push(el ? Number(el.value) : null);
  }
  return answers;
}

function countAnswered(answers) {
  return answers.filter((a) => a !== null).length;
}

function updateCounter(form) {
  const n = countAnswered(readAnswersFromForm(form));
  form.querySelector("[data-cs-counter]").textContent = String(n);
  form.querySelector("[data-cs-submit]").disabled = n < 18;
}

function init() {
  const form = document.getElementById("cs-form");
  if (!form) return;
  form.addEventListener("change", () => updateCounter(form));
  updateCounter(form);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
