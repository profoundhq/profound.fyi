export const QUESTIONS = [
  { id: 1,  left: "I'm usually open to getting to know people personally and establishing relationships with them.", right: "I'm not usually open to getting to know people personally and establishing relationships with them.", aDim: "open",     bDim: "guarded"  },
  { id: 2,  left: "I usually react slowly and deliberately.", right: "I usually react quickly and spontaneously.", aDim: "indirect", bDim: "direct"   },
  { id: 3,  left: "I'm usually guarded about other people's use of my time.", right: "I'm usually open to other people's use of my time.", aDim: "guarded",  bDim: "open"     },
  { id: 4,  left: "I usually introduce myself at social gatherings.", right: "I usually wait for others to introduce themselves to me at social gatherings.", aDim: "direct",   bDim: "indirect" },
  { id: 5,  left: "I usually focus my conversations on the interests of the people involved, even if that means straying from the business or subject at hand.", right: "I usually focus my conversations on the tasks, issues, business, or subject at hand.", aDim: "open",     bDim: "guarded"  },
  { id: 6,  left: "I'm usually not assertive, and I can be patient with a slow pace.", right: "I'm usually assertive, and at times I can be impatient with a slow pace.", aDim: "indirect", bDim: "direct"   },
  { id: 7,  left: "I usually make decisions based on facts or evidence.", right: "I usually make decisions on feelings, experiences, or relationships.", aDim: "guarded",  bDim: "open"     },
  { id: 8,  left: "I usually contribute frequently to group conversations.", right: "I usually contribute infrequently to group conversations.", aDim: "direct",   bDim: "indirect" },
  { id: 9,  left: "I usually prefer to work with and through others, providing support when possible.", right: "I usually prefer to work independently or dictate the conditions in terms of how others are involved.", aDim: "open",     bDim: "guarded"  },
  { id: 10, left: "I usually ask questions or speak tentatively and indirectly.", right: "I usually make emphatic statements or directly express opinions.", aDim: "indirect", bDim: "direct"   },
  { id: 11, left: "I usually focus primarily on ideas, concepts, or results.", right: "I usually focus primarily on persons, interactions, and feelings.", aDim: "guarded",  bDim: "open"     },
  { id: 12, left: "I usually use gestures, facial expression, and voice intonation to emphasise points.", right: "I usually do not use gestures, facial expression, and voice intonation to emphasise points.", aDim: "direct",   bDim: "indirect" },
  { id: 13, left: "I usually accept others' points of view (ideas, feelings, and concerns).", right: "I usually don't accept others' points of view (ideas, feelings, and concerns).", aDim: "open",     bDim: "guarded"  },
  { id: 14, left: "I usually respond to risk and change in a cautious or predictable manner.", right: "I usually respond to risk and change in a dynamic or unpredictable manner.", aDim: "indirect", bDim: "direct"   },
  { id: 15, left: "I usually prefer to keep personal feelings and thoughts private, sharing only when I wish to do so.", right: "I usually find it natural and easy to share and discuss my feelings with others.", aDim: "guarded",  bDim: "open"     },
  { id: 16, left: "I usually seek out new or different experiences and situations.", right: "I usually choose known or similar situations and relationships.", aDim: "direct",   bDim: "indirect" },
  { id: 17, left: "I'm usually responsive to others' agenda, interests, and concerns.", right: "I'm usually directed toward my own agendas, interests, and concerns.", aDim: "open",     bDim: "guarded"  },
  { id: 18, left: "I usually respond to conflict slowly and indirectly.", right: "I usually respond to conflict quickly and directly.", aDim: "indirect", bDim: "direct"   },
];

export function scoreInventory(answers) {
  const totals = { open: 0, guarded: 0, direct: 0, indirect: 0 };
  for (let i = 0; i < QUESTIONS.length; i++) {
    const pos = answers[i];
    const q = QUESTIONS[i];
    const a = 3 - pos;
    const b = pos;
    totals[q.aDim] += a;
    totals[q.bDim] += b;
  }
  return totals;
}

const STYLE_MAP = {
  "open|direct":      "Socialiser",
  "open|indirect":    "Relater",
  "guarded|direct":   "Director",
  "guarded|indirect": "Thinker",
};

export function determineStyle(totals) {
  const tieOpenGuarded    = totals.open === totals.guarded;
  const tieDirectIndirect = totals.direct === totals.indirect;
  const openAxis   = totals.open   >= totals.guarded  ? "open"   : "guarded";
  const directAxis = totals.direct >= totals.indirect ? "direct" : "indirect";

  let style;
  if (tieOpenGuarded && tieDirectIndirect) {
    style = "All four styles in balance";
  } else if (tieOpenGuarded) {
    style = `${STYLE_MAP[`guarded|${directAxis}`]} / ${STYLE_MAP[`open|${directAxis}`]}`;
  } else if (tieDirectIndirect) {
    style = `${STYLE_MAP[`${openAxis}|indirect`]} / ${STYLE_MAP[`${openAxis}|direct`]}`;
  } else {
    style = STYLE_MAP[`${openAxis}|${directAxis}`];
  }

  return { style, openAxis, directAxis, tieOpenGuarded, tieDirectIndirect };
}

export function encodeAnswers(answers) {
  return answers.map((n) => String(n)).join("");
}

export function decodeAnswers(str) {
  if (typeof str !== "string") return null;
  if (str.length !== 18) return null;
  if (!/^[0-3]{18}$/.test(str)) return null;
  return str.split("").map(Number);
}
