"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { useLang } from "@/lib/i18n";
import type { AssessAIResult } from "@/types";

const STORAGE_KEY = "sathi_assess";

type Stored = {
  assessmentId: string;
  result: AssessAIResult;
  savedAt: number;
};

export default function ResultsPage() {
  const { t } = useLang();
  const [data, setData] = useState<Stored | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFromSession = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoadError("No saved result found. Run an assessment first.");
        setData(null);
        return;
      }
      const parsed = JSON.parse(raw) as Stored;
      if (!parsed?.result?.matched_schemes) {
        setLoadError("Saved result is incomplete. Please run a new assessment.");
        setData(null);
        return;
      }
      setData(parsed);
    } catch {
      setLoadError("Could not read saved result. Please retry.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromSession();
  }, [loadFromSession]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">
        Loading your assessment result...
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="p-6 text-center">
          <h1 className="font-display text-2xl font-semibold">Result unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {loadError ?? "We could not load your result."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button type="button" variant="outline" onClick={loadFromSession}>
              Retry
            </Button>
            <Button asChild>
              <Link href="/assess">Go to assessment</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { result, assessmentId, savedAt } = data;

  function shareSummary() {
    const blob = `${result.summary_en.slice(0, 280)}…\n\n— Sathi AI (${assessmentId.slice(0, 8)})`;
    if (navigator.share) {
      void navigator.share({ text: blob }).catch(() => fallbackCopy(blob));
    } else {
      fallbackCopy(blob);
    }
  }

  function fallbackCopy(text: string) {
    void navigator.clipboard.writeText(text).then(
      () => toast.success("Copied summary"),
      () => toast.error("Could not copy"),
    );
  }

  const phases = [
    { key: "week_1_2" as const, label: "Weeks 1–2" },
    { key: "week_3_4" as const, label: "Weeks 3–4" },
    { key: "month_2" as const, label: "Month 2" },
    { key: "month_3" as const, label: "Month 3" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Disclaimer className="mb-8" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{result.greeting}</p>
          <h1 className="font-display text-3xl font-semibold">{t("results.title")}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("results.generated")} ·{" "}
            {new Date(savedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="font-mono text-[10px] uppercase tracking-wide">
            {assessmentId.slice(0, 8)}
          </Badge>
          <Button type="button" variant="outline" size="sm" onClick={shareSummary}>
            {t("results.share")}
          </Button>
        </div>
      </div>

      <Card className="mb-8 p-6">
        <h2 className="font-display text-lg font-semibold">Summary</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {result.summary_en}
        </p>
        <p className="mt-4 border-t border-border pt-4 font-deva text-sm leading-relaxed text-muted-foreground">
          {result.summary_np}
        </p>
      </Card>

      <h2 className="font-display text-xl font-semibold">Matches</h2>
      <ul className="mt-4 space-y-4">
        {result.matched_schemes.map((m) => (
          <Card key={m.scheme_id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">
                  {m.scheme_id}
                </p>
                <p className="font-medium">{m.match_reason_en}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{Math.round(m.match_score)} / 100</Badge>
                <Badge className="border border-border bg-transparent text-muted-foreground">
                  {m.difficulty}
                </Badge>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{m.match_reason_np}</p>
            <p className="mt-3 text-sm">
              <span className="font-medium text-brand-forest dark:text-brand-gold">
                Next step:
              </span>{" "}
              {m.priority_action_en}
            </p>
            <p className="mt-1 font-deva text-sm text-muted-foreground">
              {m.priority_action_np}
            </p>
          </Card>
        ))}
      </ul>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">{t("results.roadmap")}</h2>
        <div className="mt-4 space-y-6">
          {phases.map(({ key, label }) => {
            const p = result.roadmap[key];
            return (
              <Card key={key} className="p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold">
                  {p.title_en}
                </h3>
                <p className="font-deva text-sm text-muted-foreground">{p.title_np}</p>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {p.tasks_en.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
                <ul className="mt-2 list-inside list-disc space-y-1 font-deva text-sm text-muted-foreground">
                  {p.tasks_np.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="mt-10 p-6">
        <h2 className="font-display text-lg font-semibold">{t("results.insight")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{result.insight_en}</p>
        <p className="mt-3 font-deva text-sm text-muted-foreground">{result.insight_np}</p>
      </Card>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild variant="outline">
          <Link href="/assess">New assessment</Link>
        </Button>
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
