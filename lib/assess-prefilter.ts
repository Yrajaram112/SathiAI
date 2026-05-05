import type { AssessmentFormData, Scheme } from "@/types";

const techIndustries = new Set(["technology", "fintech", "education", "healthcare"]);

export function prefilterSchemes(
  schemes: Scheme[],
  form: AssessmentFormData,
): Scheme[] {
  return schemes.filter((s) => {
    const e = s.eligibility as Record<string, unknown>;

    if (e.gender === "female" && form.gender !== "female") return false;

    if (e.dalit_community === true && !form.is_marginalized_community) return false;

    if (e.returned_from_foreign_employment === true && !form.returned_from_abroad)
      return false;

    if (s.id === "vc_pe_nepal") {
      if (!form.is_registered) return false;
      if (!techIndustries.has(form.industry) && form.industry !== "technology")
        return false;
    }

    if (s.type === "private_investment" && s.id !== "vc_pe_nepal") return false;

    if (s.id === "nrb_educated_youth_project") {
      const edu = form.education;
      if (
        edu === "none" ||
        edu === "see" ||
        edu === "primary"
      )
        return false;
    }

    if (s.id === "moics_startup_enterprise_fund" || s.id === "nrb_startup_loan") {
      if (!form.is_registered) return false;
    }

    if (s.id === "nrb_agriculture" || s.id === "adbl_agriculture_loans") {
      if (form.industry !== "agriculture" && form.industry !== "food") return false;
    }

    return true;
  });
}
