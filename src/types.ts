export interface Candidate {
  id: string;
  name: string;
  title: string;
  state: string;
  skills: string[];
  experience: number;
  resumeText: string;
}

export interface KeywordMatch {
  keyword: string;
  inJobDescription: boolean;
  inResume: boolean;
  category: string;
}

export interface ScoredCandidate {
  candidate: Candidate;
  score: number;
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
  explanation: string;
  categoryScores: CategoryScore[];
}

export interface CategoryScore {
  category: string;
  label: string;
  matched: number;
  total: number;
  percentage: number;
}

export interface SearchHistoryItem {
  id: string;
  job_description: string;
  state_filter: string | null;
  source: string;
  candidate_count: number;
  top_score: number;
  created_at: string;
}

export type ResumeSource = 'techfetch' | 'upload';
