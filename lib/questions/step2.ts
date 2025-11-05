/**
 * Step 2: Coming to Believe
 *
 * Core theme: Opening to the possibility that a Power greater than ourselves
 * can restore us to sanity. This is about hope and willingness, not religious belief.
 */

interface Question {
  text: string;
  followUps?: string[];
}

export const step2Questions: Question[] = [
  {
    text: "What does 'sanity' mean to you in practical, daily terms? What would it look like?",
    followUps: [
      "How would your mornings be different?",
      "What would change in how you make decisions?",
    ],
  },
  {
    text: "Where in your life have you already experienced help from something beyond yourself?",
    followUps: [
      "When have you been surprised by unexpected support?",
      "What happened that you couldn't have made happen alone?",
    ],
  },
  {
    text: "What would change if you truly believed you didn't have to manage everything alone?",
    followUps: [
      "What are you carrying that you could put down?",
    ],
  },
  {
    text: "What's your biggest fear about trusting something greater than yourself?",
    followUps: [
      "What's the worst thing that could happen if you let go?",
      "Has holding on tight been working?",
    ],
  },
  {
    text: "Tell me about a time when letting go actually worked better than controlling. What happened?",
    followUps: [
      "What was different about that situation?",
      "What did you learn from it?",
    ],
  },
  {
    text: "When you think about 'Higher Power,' what comes up for you? Be honest about any resistance.",
    followUps: [
      "What past experiences shape that feeling?",
      "What would you need it to be like for you to trust it?",
    ],
  },
  {
    text: "Look around you right now on this walk. What evidence of something greater do you see in nature?",
    followUps: [
      "How did those trees know to grow?",
      "What organizes all of this without you controlling it?",
    ],
  },
  {
    text: "What small act of trust could you practice today - just today - to test this?",
    followUps: [
      "Not forever, just today. What's one thing?",
    ],
  },
  {
    text: "How has your own will and self-reliance been working out for you so far? Be specific.",
    followUps: [
      "Where has it gotten you?",
      "Are you willing to try something different?",
    ],
  },
  {
    text: "What would it feel like to believe, even for a moment, that you could be restored to sanity?",
  },
];

/**
 * Get initial question for Step 2
 */
export function getInitialStep2Question(): Question {
  return step2Questions[0];
}

/**
 * Get a random follow-up question (for variety in conversation)
 */
export function getRandomStep2Question(excludeIndices: number[] = []): Question {
  const availableQuestions = step2Questions.filter(
    (_, index) => !excludeIndices.includes(index)
  );

  if (availableQuestions.length === 0) {
    return step2Questions[0]; // Fallback to first question
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}
