import { NotFoundError } from "@anthropic-ai/sdk";
import { createHash, randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  buildAssessmentPrompt,
  compactSchemesForPrompt,
  parseAssessAIResult,
} from "@/lib/assess-ai";
import { prefilterSchemes } from "@/lib/assess-prefilter";
import { getAnthropic, getAnthropicModel } from "@/lib/claude";
import { limitAssessByIp } from "@/lib/ratelimit";
import { getServiceSupabase } from "@/lib/supabase-server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import type { AssessAIResult, AssessmentFormData, Scheme } from "@/types";
import schemesJson from "@/lib/schemes.json";

const assessBodySchema = z.object({
  age: z.coerce.number().int().min(16).max(100),
  gender: z.enum(["male", "female", "other"]),
  province: z.string().min(1),
  employment_status: z.string().min(1),
  is_marginalized_community: z.boolean(),
  business_idea: z.string().min(20).max(8000),
  industry: z.string().min(1),
  is_registered: z.boolean(),
  capital_needed: z.string().min(1),
  education: z.string().min(1),
  has_collateral: z.boolean(),
  is_rural: z.boolean(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  turnstileToken: z.string().optional(),
});

function clientIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip")?.trim() ?? "unknown";
}

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}

async function repairAndParseResult(rawText: string): Promise<AssessAIResult> {
  const client = getAnthropic();
  const repaired = await client.messages.create({
    model: getAnthropicModel(),
    max_tokens: 4096,
    system:
      "You are a strict JSON repair tool. Return ONLY valid JSON matching the requested schema.",
    messages: [
      {
        role: "user",
        content: `Reformat the following content into valid JSON for the assessment schema.
Do not add explanations, markdown fences, or extra keys.
For each matched_schemes item:
- estimated_days_to_apply must be an integer number
- difficulty must be exactly one of Easy, Medium, Hard

CONTENT:
${rawText}`,
      },
    ],
  });
  const block = repaired.content.find((c) => c.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("No text in repair response");
  }
  return parseAssessAIResult(block.text);
}

function buildDeterministicFallbackResult(
  form: AssessmentFormData,
  schemes: Scheme[],
): AssessAIResult {
  const selected = schemes.slice(0, 5);
  const matched = selected.map((s, idx) => {
    const days = s.processing_days_estimate ?? 30;
    const difficulty: "Easy" | "Medium" | "Hard" =
      days <= 30 ? "Easy" : days <= 60 ? "Medium" : "Hard";
    const score = Math.max(55, 90 - idx * 7);
    return {
      scheme_id: s.id,
      match_score: score,
      match_reason_en: `${s.name_en} fits your profile based on industry, registration, and funding need filters.`,
      match_reason_np: `${s.name_np} तपाईंको प्रोफाइलसँग उद्योग, दर्ता स्थिति र पूँजी आवश्यकता अनुसार मेल खान्छ।`,
      priority_action_en: `Prepare core documents and contact ${s.apply_at} to confirm latest eligibility and required papers.`,
      priority_action_np: `मुख्य कागजात तयार गरी ${s.apply_at} मा सम्पर्क गरेर अद्यावधिक योग्यता र कागजात सूची पुष्टि गर्नुहोस्।`,
      estimated_days_to_apply: days,
      difficulty,
      respect_indicative_flag: s.verification_status !== "verified",
    };
  });

  return {
    greeting:
      "Namaste! We generated a stable fallback assessment while preserving your profile inputs.",
    summary_en: `We found ${matched.length} scheme matches for a ${form.industry} idea in ${form.province}. This response uses deterministic scoring because the AI output format was unstable.`,
    summary_np: `${form.province} मा ${form.industry} विचारका लागि ${matched.length} वटा उपयुक्त योजनाहरू भेटिएका छन्। AI नतिजाको ढाँचा अस्थिर भएकाले यो उत्तर स्थिर नियम-आधारित स्कोरबाट तयार गरिएको हो।`,
    matched_schemes: matched,
    roadmap: {
      week_1_2: {
        title_en: "Prepare essentials",
        title_np: "आधारभूत तयारी",
        tasks_en: [
          "Finalize one-page business concept and projected budget.",
          "Collect citizenship, PAN, and education documents.",
          "Confirm whether registration is needed for your target scheme.",
        ],
        tasks_np: [
          "एक पृष्ठको व्यवसाय अवधारणा र बजेट अनुमान तयार गर्नुहोस्।",
          "नागरिकता, PAN र शैक्षिक कागजातहरू संकलन गर्नुहोस्।",
          "लक्षित योजनाका लागि दर्ता अनिवार्य छ कि छैन पुष्टि गर्नुहोस्।",
        ],
      },
      week_3_4: {
        title_en: "Begin applications",
        title_np: "आवेदन सुरु",
        tasks_en: [
          "Shortlist top two schemes and verify office-level requirements.",
          "Submit initial application with supporting documents.",
          "Track follow-up calls and requested corrections.",
        ],
        tasks_np: [
          "शीर्ष दुई योजना छनोट गरी कार्यालय-स्तरीय आवश्यकताहरू पुष्टि गर्नुहोस्।",
          "समर्थन कागजातसहित प्रारम्भिक आवेदन दिनुहोस्।",
          "फलो-अप र मागिएका सुधारहरू ट्र्याक गर्नुहोस्।",
        ],
      },
      month_2: {
        title_en: "Strengthen file quality",
        title_np: "फाइल गुणस्तर सुधार",
        tasks_en: [
          "Improve financial projections and repayment assumptions.",
          "Obtain recommendation letters where applicable.",
          "Keep documents synchronized across all applications.",
        ],
        tasks_np: [
          "वित्तीय प्रक्षेपण र भुक्तानी योजना सुधार गर्नुहोस्।",
          "आवश्यक भएमा सिफारिस पत्र प्राप्त गर्नुहोस्।",
          "सबै आवेदनमा कागजातहरू एकरूप राख्नुहोस्।",
        ],
      },
      month_3: {
        title_en: "Close and execute",
        title_np: "स्वीकृति र कार्यान्वयन",
        tasks_en: [
          "Review sanction terms before signing.",
          "Start phased fund utilization against milestones.",
          "Maintain compliance documents for audits and renewals.",
        ],
        tasks_np: [
          "हस्ताक्षर अघि स्वीकृत सर्तहरू ध्यानपूर्वक जाँच गर्नुहोस्।",
          "माइलस्टोन अनुसार चरणबद्ध रूपमा रकम उपयोग सुरु गर्नुहोस्।",
          "अडिट र नवीकरणका लागि अनुपालन कागजात सुरक्षित राख्नुहोस्।",
        ],
      },
    },
    insight_en:
      "Use this as an actionable starting point, then verify final eligibility directly with the issuing office before committing costs.",
    insight_np:
      "यो नतिजालाई कार्ययोजनाको प्रारम्भिक आधार बनाउनुहोस् र खर्च गर्ने निर्णय अघि सम्बन्धित कार्यालयबाट अन्तिम योग्यता अवश्य पुष्टि गर्नुहोस्।",
  };
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = assessBodySchema.safeParse(json);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Please complete all required fields" },
      { status: 400 },
    );
  }

  const b = validated.data;

  const okTurnstile = await verifyTurnstileToken(b.turnstileToken);
  if (!okTurnstile) {
    return NextResponse.json(
      { error: "Human verification failed. Refresh and try again." },
      { status: 403 },
    );
  }

  const ip = clientIp(req);
  const ipHash = hashIp(ip);
  const limited = await limitAssessByIp(ipHash);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many assessments. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": String(limited.remaining),
          "X-RateLimit-Reset": String(limited.reset),
        },
      },
    );
  }

  const form: AssessmentFormData = {
    age: b.age,
    gender: b.gender,
    province: b.province,
    employment_status: b.employment_status,
    is_marginalized_community: b.is_marginalized_community,
    business_idea: b.business_idea,
    industry: b.industry,
    is_registered: b.is_registered,
    capital_needed: b.capital_needed,
    education: b.education,
    has_collateral: b.has_collateral,
    is_rural: b.is_rural,
    email: b.email && b.email.length > 0 ? b.email : undefined,
    returned_from_abroad: b.employment_status === "foreign_returned",
  };

  const allSchemes = schemesJson as Scheme[];
  const filtered = prefilterSchemes(allSchemes, form);
  const compact = compactSchemesForPrompt(filtered);

  if (compact.length === 0) {
    return NextResponse.json(
      {
        error:
          "No schemes matched your hard filters. Try adjusting registration or industry.",
      },
      { status: 422 },
    );
  }

  const userPrompt = buildAssessmentPrompt(form, compact);

  let textOut: string;
  try {
    const client = getAnthropic();
    const res = await client.messages.create({
      model: getAnthropicModel(),
      max_tokens: 8192,
      system:
        "You output only valid JSON for Nepal entrepreneur scheme matching. Never include prose outside JSON.",
      messages: [{ role: "user", content: userPrompt }],
    });
    const block = res.content.find((c) => c.type === "text");
    textOut =
      block && block.type === "text"
        ? block.text
        : (() => {
            throw new Error("No text in model response");
          })();
  } catch (e) {
    console.error("[assess] Claude error", e);
    if (e instanceof NotFoundError) {
      return NextResponse.json(
        {
          error:
            "Invalid Anthropic model id. Set ANTHROPIC_MODEL to a current id (e.g. claude-sonnet-4-6). See Anthropic models overview.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Analysis service is temporarily unavailable." },
      { status: 503 },
    );
  }

  let result: AssessAIResult;
  try {
    result = parseAssessAIResult(textOut);
  } catch (e) {
    console.error("[assess] parse error", e, textOut.slice(0, 500));
    try {
      result = await repairAndParseResult(textOut);
    } catch (repairErr) {
      console.error("[assess] parse repair failed", repairErr);
      result = buildDeterministicFallbackResult(form, filtered);
    }
  }

  const assessmentId = randomUUID();

  const supabase = getServiceSupabase();
  if (supabase) {
    try {
      await supabase.from("assessment_events").insert({
        id: assessmentId,
        ip_hash: ipHash,
        scheme_count: filtered.length,
        model: getAnthropicModel(),
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("[assess] supabase insert skipped", e);
    }
  }

  return NextResponse.json({
    ok: true,
    assessmentId,
    result,
  });
}
