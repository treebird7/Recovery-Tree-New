/**
 * Type-safe API response definitions
 *
 * Provides consistent typing for all API endpoints
 */

/**
 * Standard API response wrapper
 */
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// Step In Types
// =============================================================================

export interface Question {
  id: string;
  text: string;
  type: string;
  phase: string;
  phaseTitle: string;
  questionOrder: number;
  followUpType: string | null;
  followUpText: string | null;
  conditionalFollowUp: any;
  isFinal: boolean;
  completionMarker: boolean;
  safetyFlag: boolean;
}

export interface QuestionResponse extends APIResponse<Question> {}

export interface AnswerRequest {
  questionId: string;
  answerText: string;
  stepNumber: number;
  sessionId: string;
  saveToJournal: boolean;
}

export interface AnswerResponse extends APIResponse {
  saved: boolean;
  nextQuestion: Question | null;
  stepComplete: boolean;
}

export interface EncouragementRequest {
  user_id: string;
  step_number: number;
  session_id: string;
  questions_answered: number;
  session_duration_minutes: number;
  answers: Array<{
    question_id: string;
    question_text: string;
    answer_text: string;
    phase: string;
  }>;
  step_complete: boolean;
}

export interface EncouragementResponse extends APIResponse {
  message: string;
  tone: 'acknowledgment' | 'celebration' | 'gentle_push';
  next_step_hint: string | null;
  step_complete: boolean;
  safety_flag?: boolean;
}

// =============================================================================
// Mining Types
// =============================================================================

export interface MiningSession {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number | null;
  coinsEarned: number;
  isExisting?: boolean;
}

export interface MiningStartResponse extends APIResponse<MiningSession> {}

export interface MiningEndRequest {
  sessionId: string;
  userState?: 'stable' | 'crisis';
}

export interface MiningStats {
  sessionId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  coinsEarned: number;
}

export interface MiningEndResponse extends APIResponse<MiningStats> {}

// =============================================================================
// Inventory Types
// =============================================================================

export interface InventoryData {
  id: string;
  user_id: string;
  what_went_well: string;
  struggles_today: string;
  gratitude: string;
  tomorrow_intention: string;
  additional_notes?: string;
  elder_reflection: string;
  created_at: string;
}

export interface InventoryRequest {
  whatWentWell: string;
  strugglesToday: string;
  gratitude: string;
  tomorrowIntention: string;
  additionalNotes?: string;
}

export interface InventoryResponse extends APIResponse<InventoryData> {}

export interface InventoryCheckResponse extends APIResponse {
  hasInventory: boolean;
  inventory: InventoryData | null;
}

// =============================================================================
// Walk Session Types
// =============================================================================

export interface WalkSession {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  pre_walk_mood: string;
  post_walk_mood: string | null;
  current_step: string;
  session_type: 'walk' | 'mining' | 'walkabout';
  location?: string;
  body_need?: string;
}

export interface WalkSessionResponse extends APIResponse<WalkSession> {}

export interface WalkCompleteRequest {
  sessionId: string;
  postWalkMood: string;
  reflectionNotes?: string;
}

// =============================================================================
// User & Auth Types
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface UserStats {
  totalSessions: number;
  currentStreak: number;
  totalCoins: number;
  inventoryStreak: number;
}

export interface DashboardData {
  sessions: number;
  streak: number;
  coins: number;
  inventory: InventoryData | null;
  invStreak: number;
}

export interface DashboardResponse extends APIResponse<DashboardData> {}

// =============================================================================
// Urge Support Types
// =============================================================================

export interface UrgeEntry {
  id: string;
  user_id: string;
  intensity: number;
  triggers: string[];
  coping_used: string[];
  outcome: 'resisted' | 'relapsed' | 'ongoing';
  notes?: string;
  created_at: string;
}

export interface UrgeEntryRequest {
  intensity: number;
  triggers: string[];
  copingUsed: string[];
  outcome: 'resisted' | 'relapsed' | 'ongoing';
  notes?: string;
}

export interface UrgeEntryResponse extends APIResponse<UrgeEntry> {}

// =============================================================================
// Admin Types
// =============================================================================

export interface SeedQuestionsResponse extends APIResponse {
  success: boolean;
  message: string;
  breakdown: {
    step_1: number;
    step_2: number;
    step_3: number;
  };
}

export interface SeedStatusResponse extends APIResponse {
  seeded: boolean;
  question_count: number;
  expected: number;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Extract data type from API response
 */
export type ExtractData<T> = T extends APIResponse<infer U> ? U : never;

/**
 * Make all fields in T optional except for K
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
