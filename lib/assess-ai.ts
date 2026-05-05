import { z } from "zod";
import type { AssessAIResult, AssessmentFormData, Scheme } from "@/types";

const roadmapPhaseSchema = z.object({
  title_en: z.string(),
  title_np: z.string(),
  tasks_en: z.array(z.string()),
  tasks_np: z.array(z.string()),
});

const difficultySchema = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  const v = val.trim().toLowerCase();
  if (v === "easy") return "Easy";
  if (v === "medium" || v === "moderate") return "Medium";
  if (v === "hard" || v === "difficult") return "Hard";
  return val;
}, z.enum(["Easy", "Medium", "Hard"]));

const daysSchema = z.preprocess((val) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const m = val.match(/\d+/);
    if (m) return Number.parseInt(m[0], 10);
  }
  return val;
}, z.number().int().min(0).max(3650));

const matchedSchemeAISchema = z.object({
  scheme_id: z.string(),
  match_score: z.coerce.number().min(0).max(100),
  match_reason_en: z.string(),
  match_reason_np: z.string(),
  priority_action_en: z.string(),
  priority_action_np: z.string(),
  estimated_days_to_apply: daysSchema,
  difficulty: difficultySchema,
  respect_indicative_flag: z.coerce.boolean().default(false),
});

export const assessAIResultSchema = z.object({
  greeting: z.string(),
  summary_en: z.string(),
  summary_np: z.string(),
  matched_schemes: z.array(matchedSchemeAISchema),
  roadmap: z.object({
    week_1_2: roadmapPhaseSchema,
    week_3_4: roadmapPhaseSchema,
    month_2: roadmapPhaseSchema,
    month_3: roadmapPhaseSchema,
  }),
  insight_en: z.string(),
  insight_np: z.string(),
});

export type AssessAIResultValidated = z.infer<typeof assessAIResultSchema>;

export function compactSchemesForPrompt(schemes: Scheme[]) {
  return schemes.map((s) => ({
    id: s.id,
    name_en: s.name_en,
    name_np: s.name_np,
    short_en: s.short_en,
    verification_status: s.verification_status,
    last_verified_on: s.last_verified_on,
    apply_at: s.apply_at,
    max_loan_npr: s.max_loan_npr,
    subsidy_pct: s.subsidy_pct,
    ministry: s.ministry,
    eligibility: s.eligibility,
    description_en:
      s.description_en.length > 900
        ? `${s.description_en.slice(0, 900)}…`
        : s.description_en,
    primary_source_urls: s.primary_source_urls ?? s.source_urls.slice(0, 3),
  }));
}

export function buildAssessmentPrompt(
  form: AssessmentFormData,
  schemes: ReturnType<typeof compactSchemesForPrompt>,
): string {
  return `You are Sathi AI — a careful assistant helping Nepali entrepreneurs find government / regulated financing programs.

RULES:
- Output a single JSON object ONLY. No markdown fences, no commentary outside JSON.
- Prefer scheme_ids from the provided list. Do not invent new program names.
- If verification_status is "indicative", set respect_indicative_flag true and soften certainty in match_reason_*.
- matched_schemes: order by match_score descending; include at most 5 schemes.
- match_score: number 0–100.
- estimated_days_to_apply: INTEGER NUMBER only (e.g., 14), never "14 days" text.
- difficulty: EXACTLY one of "Easy", "Medium", "Hard" (case-sensitive).
- Be practical: priority_action_* should name a next physical step (which office, bank branch type, or document).
- Nepali fields (summary_np, match_reason_np, tasks_np, etc.) must be natural Nepali (Devanagari), not machine-translated gibberish.

USER_PROFILE_JSON:
${JSON.stringify(form, null, 2)}

FILTERED_SCHEMES_JSON:
${JSON.stringify(schemes, null, 2)}

JSON shape to produce (keys required):
{ "greeting", "summary_en", "summary_np", "matched_schemes", "roadmap": { "week_1_2", "week_3_4", "month_2", "month_3" }, "insight_en", "insight_np" }

roadmap sub-objects: each has title_en, title_np, tasks_en (string array), tasks_np (string array).`;
}

export function extractJsonObject(raw: string): unknown {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }
  return JSON.parse(s.slice(start, end + 1));
}

export function parseAssessAIResult(raw: string): AssessAIResult {
  const extracted = extractJsonObject(raw);
  const parsed = assessAIResultSchema.safeParse(extracted);
  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }
  return parsed.data as AssessAIResult;
}
