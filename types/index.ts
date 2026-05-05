export type Lang = "en" | "np";

export type SchemeEligibility = Record<string, unknown>;

export interface Scheme {
  id: string;
  name_en: string;
  name_np: string;
  short_en: string;
  type: string;
  umbrella: string | null;
  legal_basis?: string;
  category: string[];
  ministry: string;
  apply_at: string;
  max_loan_npr: number | null;
  subsidy_pct: number | null;
  max_loan_period_years?: number;
  grace_period_years?: number;
  effective_rate_note_en: string;
  effective_rate_note_np: string;
  eligibility: SchemeEligibility;
  industries: string[];
  documents: string[];
  processing_days_estimate: number;
  description_en: string;
  description_np: string;
  source_urls: string[];
  primary_source_urls?: string[];
  last_verified_on: string;
  verification_status: "verified" | "indicative";
  confidence: "high" | "medium" | "low";
  tags: string[];
}

export interface AssessmentFormData {
  age: number;
  gender: "male" | "female" | "other";
  province: string;
  employment_status: string;
  is_marginalized_community: boolean;
  business_idea: string;
  industry: string;
  is_registered: boolean;
  capital_needed: string;
  education: string;
  has_collateral: boolean;
  is_rural: boolean;
  email?: string;
  is_dalit?: boolean;
  returned_from_abroad?: boolean;
}

export interface MatchedSchemeAI {
  scheme_id: string;
  match_score: number;
  match_reason_en: string;
  match_reason_np: string;
  priority_action_en: string;
  priority_action_np: string;
  estimated_days_to_apply: number;
  difficulty: "Easy" | "Medium" | "Hard";
  respect_indicative_flag: boolean;
}

export interface RoadmapPhase {
  title_en: string;
  title_np: string;
  tasks_en: string[];
  tasks_np: string[];
}

export interface AssessAIResult {
  greeting: string;
  summary_en: string;
  summary_np: string;
  matched_schemes: MatchedSchemeAI[];
  roadmap: {
    week_1_2: RoadmapPhase;
    week_3_4: RoadmapPhase;
    month_2: RoadmapPhase;
    month_3: RoadmapPhase;
  };
  insight_en: string;
  insight_np: string;
}
