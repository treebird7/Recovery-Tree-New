/**
 * Step 3: Decision to Turn Over
 *
 * Core theme: Making the decision to turn our will and our lives over
 * to the care of a Higher Power. This is about daily practice and action,
 * not a one-time decision.
 */

interface Question {
  text: string;
  followUps?: string[];
}

export const step3Questions: Question[] = [
  {
    text: "What specifically are you willing to turn over today? Name it.",
    followUps: [
      "Not everything forever - just today. What?",
      "What does turning that over look like in action?",
    ],
  },
  {
    text: "Let's be honest - what are you NOT ready to let go of yet? What are you still holding onto?",
    followUps: [
      "Why is it so important to control that?",
      "What are you afraid will happen if you release it?",
    ],
  },
  {
    text: "How would your day look different if you weren't trying to control everything?",
    followUps: [
      "What would you stop doing?",
      "What might become possible?",
    ],
  },
  {
    text: "What's one small thing you can practice letting go of on this walk? Right now.",
    followUps: [
      "How does it feel to release that, even just for these few minutes?",
    ],
  },
  {
    text: "What does 'turning it over' actually mean in practical action? Give me an example.",
    followUps: [
      "What would you DO differently?",
      "How would you know you'd actually turned it over?",
    ],
  },
  {
    text: "When you try to control everything, what does that cost you? Be specific.",
    followUps: [
      "What do you sacrifice to maintain control?",
      "How exhausted are you?",
    ],
  },
  {
    text: "What decision are you facing right now where you could practice turning it over?",
    followUps: [
      "What would it look like to ask for guidance instead of forcing your way?",
    ],
  },
  {
    text: "Complete this sentence: 'If I truly trusted a Higher Power today, I would stop trying to...'",
    followUps: [
      "What are you trying to control right now?",
    ],
  },
  {
    text: "What's the difference between turning something over and giving up? How do you know?",
    followUps: [
      "Is surrender the same as quitting?",
    ],
  },
  {
    text: "How can you remind yourself throughout today that you've made this decision to turn things over?",
    followUps: [
      "What's a practical way to come back to this decision when you forget?",
      "What phrase or action could help you remember?",
    ],
  },
  {
    text: "What would you be free to focus on if you weren't spending all your energy trying to control outcomes?",
  },
  {
    text: "Tell me about a time today when you caught yourself trying to control something. What was it?",
    followUps: [
      "What happened when you tried to control it?",
      "What might happen if you turned it over right now?",
    ],
  },
];

/**
 * Get initial question for Step 3
 */
export function getInitialStep3Question(): Question {
  return step3Questions[0];
}

/**
 * Get a random follow-up question (for variety in conversation)
 */
export function getRandomStep3Question(excludeIndices: number[] = []): Question {
  const availableQuestions = step3Questions.filter(
    (_, index) => !excludeIndices.includes(index)
  );

  if (availableQuestions.length === 0) {
    return step3Questions[0]; // Fallback to first question
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}
