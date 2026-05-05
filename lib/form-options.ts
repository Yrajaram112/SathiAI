/** Form value enums aligned with `AssessmentFormData` and scheme prefiltering. */

export const NEPAL_PROVINCES = [
  { value: "koshi", label: "Koshi" },
  { value: "madhesh", label: "Madhesh" },
  { value: "bagmati", label: "Bagmati" },
  { value: "gandaki", label: "Gandaki" },
  { value: "lumbini", label: "Lumbini" },
  { value: "karnali", label: "Karnali" },
  { value: "sudurpashchim", label: "Sudurpashchim" },
] as const;

export const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology / IT" },
  { value: "fintech", label: "Fintech" },
  { value: "agriculture", label: "Agriculture" },
  { value: "food", label: "Food & beverage" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "tourism", label: "Tourism" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
] as const;

export const EMPLOYMENT_OPTIONS = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-employed" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Not currently employed" },
  { value: "homemaker", label: "Homemaker" },
  { value: "foreign_returned", label: "Returned from foreign employment" },
] as const;

export const CAPITAL_OPTIONS = [
  { value: "under_5lakh", label: "Under NPR 5 lakh" },
  { value: "5_to_25", label: "NPR 5–25 lakh" },
  { value: "25_to_1cr", label: "NPR 25 lakh – 1 crore" },
  { value: "over_1cr", label: "Above NPR 1 crore" },
  { value: "not_sure", label: "Not sure yet" },
] as const;

export const EDUCATION_OPTIONS = [
  { value: "none", label: "No formal schooling" },
  { value: "primary", label: "Primary" },
  { value: "see", label: "Basic / SEE" },
  { value: "plus2", label: "+2 / Diploma" },
  { value: "bachelor", label: "Bachelor's" },
  { value: "master", label: "Master's or higher" },
] as const;
