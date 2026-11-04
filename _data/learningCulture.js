// The learning culture survey's statements and dimensions, for the tool page
// to render its form. The browser script imports the same module, so the
// statements live in one place.
import { DIMENSIONS, QUESTIONS, SCALE } from "../js/learning-culture/scoring.js";

export default {
  dimensions: DIMENSIONS.map((d) => ({ ...d, questions: QUESTIONS.filter((q) => q.dim === d.id) })),
  total: QUESTIONS.length,
  scale: SCALE,
};
