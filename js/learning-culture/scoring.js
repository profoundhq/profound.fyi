// Learning culture survey by Sorrel Harriet: 47 statements in four
// dimensions, each answered from 1 (strongly disagree) to 5 (strongly agree).
// Pure functions only, so the scoring can be tested without a browser.

export const DIMENSIONS = [
  {
    id: "task",
    name: "Quality of task",
    summary: "Whether your work itself gives you room to learn: variety, stretch, and collaboration, without overload.",
    practices: ["hack-days", "experiments", "work-shadowing"],
  },
  {
    id: "support",
    name: "Support for learning",
    summary: "Whether you get time, feedback, people, and resources for learning in normal working hours.",
    practices: ["learning-backlog", "mentoring", "pairing", "giving-and-receiving-feedback"],
  },
  {
    id: "relationships",
    name: "Social relationships",
    summary: "Whether it feels safe to speak up, admit mistakes, and disagree, and whether there is mutual trust and respect.",
    practices: ["retrospectives", "blameless-post-mortems", "asking-for-help", "team-health-checks"],
  },
  {
    id: "efficacy",
    name: "Learner efficacy",
    summary: "Whether you feel able to direct your own learning, reflect, and ask for feedback.",
    practices: ["reflective-questioning", "today-i-learned", "learning-backlog", "processing-pauses"],
  },
];

const STATEMENTS = {
  task: [
    "My work requires me to experiment with new ways of doing things.",
    "My work is complex and stretches my skills and capabilities.",
    "My work gives me opportunities to exchange ideas and knowledge with others.",
    "My work requires me to collaborate with others on different problems.",
    "My work is varied and presents me with different problems and challenges.",
    "My work requires me to work on problems which interest me.",
    "My work rarely leaves me feeling overwhelmed by too much information.",
    "My work often requires me to switch between topics and tasks multiple times in a single day.",
    "I feel I have the capabilities needed to do my work effectively.",
    "My work rarely causes me stress.",
  ],
  support: [
    "I have time to reflect on the work I am doing in the course of a normal working day.",
    "I have sufficient time for learning and developing myself within my normal work hours.",
    "I have opportunities to undertake training that is relevant to my learning goals.",
    "I often work closely with people who have knowledge and skills I want to learn.",
    "I receive regular and timely feedback from people I work closely with and who know my work.",
    "The feedback I receive from others helps me learn and develop myself.",
    "I am given the freedom to experiment with new ways of doing things.",
    "My managers or senior colleagues ask me questions about my work and encourage me to think about different approaches.",
    "My managers or senior colleagues take an interest in my development and give attention to my goals and aspirations.",
    "There are people I can turn to for support with my learning and development.",
    "I am given the freedom to tread my own path with respect to my learning.",
    "I am given access to a variety of suitable resources to support me in my learning.",
  ],
  relationships: [
    "I feel safe sharing my opinions at work, even when others may disagree with me.",
    "I feel recognised and appreciated for the work I do.",
    "I feel confident that conflicts at work will be surfaced and resolved constructively.",
    "I believe my thoughts and ideas are listened to and taken seriously.",
    "I am able to communicate my needs to colleagues and managers.",
    "I am able to give good quality feedback to others when asked.",
    "I feel a sense of belonging when I am among colleagues.",
    "I feel safe admitting when I have made a mistake.",
    "I feel there is mutual trust between myself and my colleagues.",
    "I feel there is mutual respect between myself and my colleagues.",
  ],
  efficacy: [
    "I am able to identify and progress toward my learning goals.",
    "I enjoy and benefit from opportunities to learn with others.",
    "I can learn effectively when I am by myself.",
    "I feel motivated to learn and develop myself professionally.",
    "I enjoy the process of learning and derive satisfaction from developing myself professionally.",
    "I am interested in how people learn and in applying theories about learning in my work.",
    "I feel in control of my own learning and development.",
    "I regularly use self-reflection as a way to identify opportunities for improvement in my work.",
    "I believe having personal learning goals is important for driving and focusing my learning.",
    "I believe having regular, good quality feedback is important for my learning and development.",
    "I regularly solicit feedback from others on my work.",
    "I communicate about learning with my close colleagues or team.",
    "I see learning as a really important part of my work.",
    "I know and understand what the collective learning goals are for my team or the wider company.",
    "When setting my personal learning goals, I give attention to the needs and goals of my team or the wider company.",
  ],
};

// Frequent switching between topics and tasks works against learning, so
// agreeing with that statement lowers the score.
const REVERSED = new Set(["My work often requires me to switch between topics and tasks multiple times in a single day."]);

export const QUESTIONS = DIMENSIONS.flatMap((d) => STATEMENTS[d.id].map((text) => ({ dim: d.id, text, reverse: REVERSED.has(text) })))
  .map((q, i) => ({ id: i + 1, ...q }));

export const SCALE = ["Strongly disagree", "Disagree", "Neither agree nor disagree", "Agree", "Strongly agree"];

export function effectiveScore(question, answer) {
  return question.reverse ? 6 - answer : answer;
}

const round1 = (n) => Math.round(n * 10) / 10;

export function scoreSurvey(answers) {
  const scores = {};
  for (const d of DIMENSIONS) {
    const items = QUESTIONS.map((q, i) => [q, answers[i]]).filter(([q]) => q.dim === d.id);
    const total = items.reduce((sum, [q, a]) => sum + effectiveScore(q, a), 0);
    scores[d.id] = round1(total / items.length);
  }
  return scores;
}

export function lowestStatements(answers, n) {
  return QUESTIONS.map((q, i) => ({ ...q, score: effectiveScore(q, answers[i]) }))
    .sort((a, b) => a.score - b.score || a.id - b.id)
    .slice(0, n);
}

export function weakestDimensions(scores) {
  const min = Math.min(...DIMENSIONS.map((d) => scores[d.id]));
  return DIMENSIONS.filter((d) => scores[d.id] === min).map((d) => d.id);
}

export function encodeAnswers(answers) {
  return answers.join("");
}

export function decodeAnswers(str) {
  if (typeof str !== "string") return null;
  if (!new RegExp(`^[1-5]{${QUESTIONS.length}}$`).test(str)) return null;
  return str.split("").map(Number);
}
