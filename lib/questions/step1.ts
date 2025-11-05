/**
 * Step 1: Powerlessness & Unmanageability
 *
 * Progressive phases that build understanding of addiction:
 * 1. Recognition - Surface level awareness
 * 2. Mental Obsession - Understanding how the mind lies
 * 3. Craving Compulsion - Why stopping is impossible
 * 4. Powerlessness Evidence - Concrete proof of powerlessness
 * 5. Unmanageability - Life consequences
 */

export type Step1Phase =
  | 'recognition'
  | 'mentalObsession'
  | 'cravingCompulsion'
  | 'powerlessnessEvidence'
  | 'unmanageability';

interface Question {
  text: string;
  phase: Step1Phase;
  followUps?: string[]; // Optional follow-up questions if answer is too brief
}

export const step1Questions: Question[] = [
  // PHASE 1: RECOGNITION (Surface awareness)
  {
    text: "Tell me about the last time you tried to stop or control your behavior and couldn't.",
    phase: 'recognition',
    followUps: [
      "What did you tell yourself you'd do?",
      "What actually happened?",
    ],
  },
  {
    text: "What promises have you made to yourself that you've broken? Be specific.",
    phase: 'recognition',
    followUps: [
      "How many times have you made that promise?",
      "What happens when you break it?",
    ],
  },
  {
    text: "When did you first realize this might be a problem? What was happening then?",
    phase: 'recognition',
  },

  // PHASE 2: MENTAL OBSESSION (How the mind lies)
  {
    text: "What does your mind tell you to get you to use? What's the conversation in your head?",
    phase: 'mentalObsession',
    followUps: [
      "How does it convince you?",
      "What lies does it tell?",
    ],
  },
  {
    text: "Describe the bargaining - what deals do you make with yourself before you act out?",
    phase: 'mentalObsession',
    followUps: [
      "'Just this once' - sound familiar?",
      "What other deals do you make?",
    ],
  },
  {
    text: "How does the obsession feel in your body when it starts? Where do you feel it?",
    phase: 'mentalObsession',
  },
  {
    text: "At what point do you stop being able to think about anything else? Walk me through it.",
    phase: 'mentalObsession',
  },

  // PHASE 3: CRAVING COMPULSION (Why you can't stop once started)
  {
    text: "Once you start, what happens? Can you have just a little, or does it take over?",
    phase: 'cravingCompulsion',
    followUps: [
      "Give me a specific example.",
      "What's different between what you planned and what happened?",
    ],
  },
  {
    text: "Tell me about a time you said 'just 5 minutes' or 'just one' - what actually happened?",
    phase: 'cravingCompulsion',
  },
  {
    text: "What's the difference between what you plan to do and what you actually do?",
    phase: 'cravingCompulsion',
  },
  {
    text: "When you're in it, can you stop yourself? What happens when you try?",
    phase: 'cravingCompulsion',
  },

  // PHASE 4: POWERLESSNESS EVIDENCE (Concrete proof)
  {
    text: "How many times have you tried to quit or cut back? Count them if you can.",
    phase: 'powerlessnessEvidence',
  },
  {
    text: "What strategies have you tried to control this? List them. Which ones failed?",
    phase: 'powerlessnessEvidence',
    followUps: [
      "Why did they fail?",
      "What does that tell you?",
    ],
  },
  {
    text: "When was the last time you had real choice in this behavior? Be honest.",
    phase: 'powerlessnessEvidence',
  },
  {
    text: "If you could control this, would you be here right now? What does that tell you?",
    phase: 'powerlessnessEvidence',
  },

  // PHASE 5: UNMANAGEABILITY (Life consequences)
  {
    text: "What areas of your life have been affected by this? Name them specifically.",
    phase: 'unmanageability',
    followUps: [
      "How bad has it gotten in each area?",
    ],
  },
  {
    text: "What have you lost or risked losing because of this behavior?",
    phase: 'unmanageability',
  },
  {
    text: "How has this affected your relationships? Give me real examples.",
    phase: 'unmanageability',
    followUps: [
      "What have people said to you?",
      "What have you had to hide?",
    ],
  },
  {
    text: "What responsibilities have you neglected or failed at because of this?",
    phase: 'unmanageability',
  },
  {
    text: "What does your life look like when you're acting out versus when you're not?",
    phase: 'unmanageability',
  },
  {
    text: "If nothing changes, where will you be in a year? Be honest with yourself.",
    phase: 'unmanageability',
  },
];

/**
 * Get initial question for Step 1
 */
export function getInitialStep1Question(): Question {
  return step1Questions[0];
}

/**
 * Get questions for a specific phase
 */
export function getQuestionsForPhase(phase: Step1Phase): Question[] {
  return step1Questions.filter(q => q.phase === phase);
}

/**
 * Get the next phase in progression
 */
export function getNextPhase(currentPhase: Step1Phase): Step1Phase | null {
  const phaseOrder: Step1Phase[] = [
    'recognition',
    'mentalObsession',
    'cravingCompulsion',
    'powerlessnessEvidence',
    'unmanageability',
  ];

  const currentIndex = phaseOrder.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
    return null; // Either invalid phase or last phase
  }

  return phaseOrder[currentIndex + 1];
}

/**
 * Determine if we should progress to next phase based on conversation
 */
export function shouldProgressToNextPhase(
  currentPhase: Step1Phase,
  questionsAsked: number,
  breakthroughCount: number
): boolean {
  const questionsInPhase = getQuestionsForPhase(currentPhase).length;

  // Progress if:
  // - We've asked at least 2 questions in this phase AND
  // - We've had at least 1 breakthrough moment OR asked all questions in phase
  return questionsAsked >= 2 && (breakthroughCount >= 1 || questionsAsked >= questionsInPhase);
}
