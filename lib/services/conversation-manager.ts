import { generateNextQuestion } from './anthropic';
import {
  getInitialStep1Question,
  getQuestionsForPhase,
  getNextPhase,
  shouldProgressToNextPhase,
  Step1Phase,
} from '../questions/step1';
import { getInitialStep2Question, getRandomStep2Question } from '../questions/step2';
import { getInitialStep3Question, getRandomStep3Question } from '../questions/step3';
import type { UserContext, SessionSummary } from './user-context';

export interface ConversationTurn {
  question: string;
  answer: string;
  timestamp: string;
  hasRedFlags?: boolean;
  isBreakthrough?: boolean;
}

export interface ConversationState {
  currentStep: 'step1' | 'step2' | 'step3';
  currentPhase?: string; // Only used for Step 1
  conversationHistory: ConversationTurn[];
  questionsAskedInPhase: number;
  breakthroughCount: number;
  redFlagCount: number;
  askedQuestionIndices: number[]; // Track which questions have been asked
  location?: string;
  bodyNeed?: string;
  userContext?: UserContext | null; // Cross-session memory
  recentSessions?: SessionSummary[]; // Recent session summaries
}

/**
 * Conversation Manager
 * Orchestrates the flow of questions, detects when to push back or progress,
 * and manages the Elder Tree conversation state
 */
export class ConversationManager {
  private state: ConversationState;

  constructor(
    initialStep: 'step1' | 'step2' | 'step3',
    existingHistory?: ConversationTurn[],
    location?: string,
    bodyNeed?: string,
    userContext?: UserContext | null,
    recentSessions?: SessionSummary[]
  ) {
    this.state = {
      currentStep: initialStep,
      currentPhase: initialStep === 'step1' ? 'recognition' : undefined,
      conversationHistory: existingHistory || [],
      questionsAskedInPhase: 0,
      breakthroughCount: 0,
      redFlagCount: 0,
      askedQuestionIndices: [],
      location,
      bodyNeed,
      userContext,
      recentSessions,
    };
  }

  /**
   * Get the first question to start the session
   */
  getInitialQuestion(): string {
    let question: string;

    switch (this.state.currentStep) {
      case 'step1':
        question = getInitialStep1Question().text;
        break;
      case 'step2':
        question = getInitialStep2Question().text;
        break;
      case 'step3':
        question = getInitialStep3Question().text;
        break;
    }

    return question;
  }

  /**
   * Process user's answer and get the next question from Elder Tree
   */
  async processAnswerAndGetNext(answer: string): Promise<{
    nextQuestion: string;
    hasRedFlags: boolean;
    isBreakthrough: boolean;
    shouldComplete: boolean;
  }> {
    // Get the last question asked
    const lastQuestion =
      this.state.conversationHistory.length > 0
        ? this.state.conversationHistory[this.state.conversationHistory.length - 1].question
        : this.getInitialQuestion();

    // Generate next question using Elder Tree AI
    const { question, hasRedFlags, isBreakthrough } = await generateNextQuestion({
      currentStep: this.state.currentStep,
      conversationHistory: this.state.conversationHistory,
      lastAnswer: answer,
      currentPhase: this.state.currentPhase,
      location: this.state.location,
      bodyNeed: this.state.bodyNeed,
      userContext: this.state.userContext,
      recentSessions: this.state.recentSessions,
    });

    // Update state
    this.state.conversationHistory.push({
      question: lastQuestion,
      answer,
      timestamp: new Date().toISOString(),
      hasRedFlags,
      isBreakthrough,
    });

    if (hasRedFlags) {
      this.state.redFlagCount++;
    }

    if (isBreakthrough) {
      this.state.breakthroughCount++;
    }

    this.state.questionsAskedInPhase++;

    // Determine if we should complete the session
    const shouldComplete = this.shouldCompleteSession();

    // For Step 1, check if we should progress to next phase
    if (this.state.currentStep === 'step1' && this.state.currentPhase) {
      const shouldProgress = shouldProgressToNextPhase(
        this.state.currentPhase as Step1Phase,
        this.state.questionsAskedInPhase,
        this.state.breakthroughCount
      );

      if (shouldProgress) {
        const nextPhase = getNextPhase(this.state.currentPhase as Step1Phase);
        if (nextPhase) {
          this.state.currentPhase = nextPhase;
          this.state.questionsAskedInPhase = 0; // Reset counter for new phase
        }
      }
    }

    return {
      nextQuestion: question,
      hasRedFlags,
      isBreakthrough,
      shouldComplete,
    };
  }

  /**
   * Determine if the session has reached a natural completion point
   */
  private shouldCompleteSession(): boolean {
    const totalQuestions = this.state.conversationHistory.length;

    // Complete after:
    // - At least 5 questions answered AND
    // - At least 2 breakthrough moments OR
    // - At least 8 questions answered (even without breakthroughs)
    return (
      (totalQuestions >= 5 && this.state.breakthroughCount >= 2) ||
      totalQuestions >= 8
    );
  }

  /**
   * Get a suggested question from the question bank (for manual fallback)
   */
  getSuggestedQuestion(): string {
    switch (this.state.currentStep) {
      case 'step1':
        if (this.state.currentPhase) {
          const phaseQuestions = getQuestionsForPhase(this.state.currentPhase as Step1Phase);
          const unaskedQuestions = phaseQuestions.filter(
            (_, index) => !this.state.askedQuestionIndices.includes(index)
          );

          if (unaskedQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * unaskedQuestions.length);
            return unaskedQuestions[randomIndex].text;
          }

          // If all questions in phase asked, get from next phase
          const nextPhase = getNextPhase(this.state.currentPhase as Step1Phase);
          if (nextPhase) {
            return getQuestionsForPhase(nextPhase)[0].text;
          }
        }
        return getInitialStep1Question().text;

      case 'step2':
        return getRandomStep2Question(this.state.askedQuestionIndices).text;

      case 'step3':
        return getRandomStep3Question(this.state.askedQuestionIndices).text;
    }
  }

  /**
   * Get current conversation state (for saving to database)
   */
  getState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationTurn[] {
    return this.state.conversationHistory;
  }

  /**
   * Get analytics for the session
   */
  getAnalytics() {
    return {
      questionsCompleted: this.state.conversationHistory.length,
      breakthroughMoments: this.state.breakthroughCount,
      redFlagsEncountered: this.state.redFlagCount,
      currentPhase: this.state.currentPhase,
      stepWorked: this.state.currentStep,
    };
  }
}

/**
 * Helper: Create conversation manager from saved session data
 */
export function createFromSavedSession(
  step: 'step1' | 'step2' | 'step3',
  history: ConversationTurn[],
  currentPhase?: string,
  location?: string,
  bodyNeed?: string,
  userContext?: UserContext | null,
  recentSessions?: SessionSummary[]
): ConversationManager {
  const manager = new ConversationManager(
    step,
    history,
    location,
    bodyNeed,
    userContext,
    recentSessions
  );

  // Restore state from history
  if (currentPhase) {
    manager.getState().currentPhase = currentPhase;
  }

  // Recalculate counts from history
  let breakthroughCount = 0;
  let redFlagCount = 0;

  history.forEach((turn) => {
    if (turn.isBreakthrough) breakthroughCount++;
    if (turn.hasRedFlags) redFlagCount++;
  });

  manager.getState().breakthroughCount = breakthroughCount;
  manager.getState().redFlagCount = redFlagCount;

  return manager;
}
