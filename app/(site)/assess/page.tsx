"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  type MouseEvent,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { Turnstile } from "@/components/Turnstile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Progress } from "@/components/ui/Progress";
import {
  CAPITAL_OPTIONS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  INDUSTRY_OPTIONS,
  NEPAL_PROVINCES,
} from "@/lib/form-options";
import type { AssessmentFormData } from "@/types";

const STEPS = 3;
const STORAGE_KEY = "sathi_assess";
const LOADING_PHASES = [
  "Filtering schemes...",
  "Scoring eligibility...",
  "Generating roadmap...",
  "Finalizing your matches...",
] as const;

const initialForm: AssessmentFormData = {
  age: 25,
  gender: "other",
  province: "bagmati",
  employment_status: "self_employed",
  is_marginalized_community: false,
  business_idea: "",
  industry: "technology",
  is_registered: false,
  capital_needed: "under_5lakh",
  education: "bachelor",
  has_collateral: false,
  is_rural: false,
  email: "",
};

export default function AssessPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [tiltStyle, setTiltStyle] = useState<{
    transform: string;
    background: string;
  }>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
    background:
      "radial-gradient(120px circle at 50% 50%, rgba(255,255,255,0.18), rgba(255,255,255,0))",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [form, setForm] = useState<AssessmentFormData>(initialForm);

  const progress = useMemo(
    () => ((step - 1) / Math.max(1, STEPS - 1)) * 100,
    [step],
  );

  const update = useCallback(
    <K extends keyof AssessmentFormData>(key: K, value: AssessmentFormData[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
    },
    [],
  );

  const handleToken = useCallback((t: string) => setTurnstileToken(t), []);
  const clearToken = useCallback(() => setTurnstileToken(""), []);

  const canNext = useMemo(() => {
    if (step === 1) {
      return form.age >= 16 && form.age <= 100 && form.province.length > 0;
    }
    if (step === 2) {
      return form.business_idea.trim().length >= 20;
    }
    return true;
  }, [step, form]);

  async function submit() {
    setSubmitError(null);
    setLastStatus(null);
    setLoading(true);
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          email: form.email?.trim() || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        result?: unknown;
        assessmentId?: string;
      };
      if (!res.ok) {
        setLastStatus(res.status);
        const friendly =
          res.status === 429
            ? "You've hit the hourly limit. Please wait a bit, then retry."
            : res.status === 422
              ? "No direct matches yet. Adjust registration, industry, or education and try again."
              : res.status === 503 && data.error?.includes("model id")
                ? "Temporary model configuration issue. Please retry in a minute."
                : res.status === 502
                  ? "We had trouble formatting your result. Please retry once."
                  : data.error ?? "Something went wrong. Try again.";
        setSubmitError(friendly);
        toast.error(friendly);
        return;
      }
      if (data.result && typeof data.assessmentId === "string") {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            assessmentId: data.assessmentId,
            result: data.result,
            savedAt: Date.now(),
          }),
        );
        router.push("/results");
      } else {
        setSubmitError("Unexpected response from the server. Please retry.");
      }
    } catch (e) {
      console.error(e);
      const msg = "Network error. Check your connection and retry.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const noMatches = lastStatus === 422;

  useEffect(() => {
    if (!loading) {
      setLoadingPhase(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingPhase((p) => (p + 1) % LOADING_PHASES.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [loading]);

  function onLoaderMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 8;
    const rx = (0.5 - py) * 6;
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`,
      background: `radial-gradient(160px circle at ${(px * 100).toFixed(0)}% ${(py * 100).toFixed(0)}%, rgba(255,255,255,0.28), rgba(255,255,255,0))`,
    });
  }

  function onLoaderLeave() {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
      background:
        "radial-gradient(120px circle at 50% 50%, rgba(255,255,255,0.18), rgba(255,255,255,0))",
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Disclaimer className="mb-8" />
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Step {step} of {STEPS}
          </p>
          <Progress value={progress} className="mt-2" />
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <h1 className="font-display text-2xl font-semibold">About you</h1>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Age</span>
              <input
                type="number"
                min={16}
                max={100}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-forest/30 dark:focus:ring-brand-gold/30"
                value={form.age}
                onChange={(e) =>
                  update("age", Number.parseInt(e.target.value, 10) || 0)
                }
              />
            </label>
            <fieldset>
              <legend className="text-sm font-medium">Gender</legend>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {(["male", "female", "other"] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="gender"
                      checked={form.gender === g}
                      onChange={() => update("gender", g)}
                    />
                    <span className="capitalize">{g}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Province</span>
              <select
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-forest/30"
                value={form.province}
                onChange={(e) => update("province", e.target.value)}
              >
                {NEPAL_PROVINCES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Employment</span>
              <select
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-forest/30"
                value={form.employment_status}
                onChange={(e) =>
                  update("employment_status", e.target.value)
                }
              >
                {EMPLOYMENT_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.is_marginalized_community}
                onChange={(e) =>
                  update("is_marginalized_community", e.target.checked)
                }
                className="h-4 w-4 rounded border-border"
              />
              I identify with a marginalized community (e.g. Dalit, Janajati,
              disability, remote region)
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h1 className="font-display text-2xl font-semibold">
              Your idea & sector
            </h1>
            <label className="block space-y-2">
              <span className="text-sm font-medium">
                Describe your business or idea (20+ characters)
              </span>
              <textarea
                rows={5}
                className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-forest/30"
                placeholder="What problem are you solving? Who are your customers?"
                value={form.business_idea}
                onChange={(e) => update("business_idea", e.target.value)}
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Primary industry</span>
              <select
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-forest/30"
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
              >
                {INDUSTRY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">
                Rough capital you need to raise
              </span>
              <select
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-forest/30"
                value={form.capital_needed}
                onChange={(e) => update("capital_needed", e.target.value)}
              >
                {CAPITAL_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Highest education</span>
              <select
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-forest/30"
                value={form.education}
                onChange={(e) => update("education", e.target.value)}
              >
                {EDUCATION_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h1 className="font-display text-2xl font-semibold">
              Status & verification
            </h1>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.is_registered}
                onChange={(e) => update("is_registered", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Business is registered (firm / company / cooperative)
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.has_collateral}
                onChange={(e) => update("has_collateral", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              I can offer traditional collateral (land / housing / FD)
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.is_rural}
                onChange={(e) => update("is_rural", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Project is in a rural / peri-urban municipality priority
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium">
                Email (optional — for product updates only)
              </span>
              <input
                type="email"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-forest/30"
                value={form.email ?? ""}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <div>
              <p className="mb-2 text-sm font-medium">Human check</p>
              <Turnstile onToken={handleToken} onClear={clearToken} />
            </div>
          </div>
        )}

        {submitError && (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-50/80 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-medium">{submitError}</p>
            {noMatches ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Try selecting a broader industry (e.g. technology, services, other).</li>
                <li>If possible, switch Business registered to yes.</li>
                <li>Add more detail in your business idea and retry.</li>
                <li>Try a different education level if your project is student/youth-focused.</li>
              </ul>
            ) : null}
            <div className="mt-3">
              <Button type="button" size="sm" variant="outline" onClick={() => void submit()} disabled={loading}>
                Retry assessment
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div
            className="relative mt-6 rounded-2xl bg-gradient-to-r from-brand-forest/25 via-brand-gold/25 to-brand-forest/25 p-[1px] dark:from-brand-gold/30 dark:via-white/20 dark:to-brand-gold/30"
            onMouseMove={onLoaderMove}
            onMouseLeave={onLoaderLeave}
          >
            <div
              className="overflow-hidden rounded-2xl border border-white/30 bg-white/60 p-4 shadow-glass backdrop-blur-glass transition-transform duration-200 ease-out dark:border-white/15 dark:bg-white/10 dark:shadow-glass-dark"
              style={{ transform: tiltStyle.transform }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{ background: tiltStyle.background }}
              />
              <div className="relative z-10 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-forest dark:bg-brand-gold" />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-brand-forest/80 dark:bg-brand-gold/80"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-brand-forest/60 dark:bg-brand-gold/60"
                    style={{ animationDelay: "240ms" }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {LOADING_PHASES[loadingPhase]}
                </p>
              </div>
              <p className="relative z-10 mt-2 text-xs text-muted-foreground">
                This can take up to ~1-2 minutes depending on model load.
              </p>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between gap-4">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 1 || loading}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Back
          </Button>
          {step < STEPS ? (
            <Button
              type="button"
              disabled={!canNext || loading}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              disabled={loading}
              onClick={() => void submit()}
            >
              {loading ? "Analyzing your profile..." : "Find my matches"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
