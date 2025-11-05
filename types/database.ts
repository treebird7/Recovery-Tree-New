export interface Session {
  id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  pre_walk_mood?: string;
  pre_walk_intention?: string;
  step_responses?: Record<string, any>;
  final_reflection?: string;
  generated_image_url?: string;
  encouragement_message?: string;
  insights?: string[];
  created_at: string;
}

export interface SessionAnalytics {
  id: string;
  session_id: string;
  walk_duration?: number;
  questions_completed?: number;
  step_worked?: 'step1' | 'step2' | 'step3' | 'mixed';
  created_at: string;
}
