"use client";

import { useLang } from "@/lib/i18n";
import { Info } from "lucide-react";

export function Disclaimer({ className }: { className?: string }) {
  const { lang, t } = useLang();
  const text =
    lang === "np" ? t("disclaimer.short_np") : t("disclaimer.short");

  return (
    <div
      role="note"
      className={`flex gap-3 rounded-xl border border-brand-forest/15 bg-amber-50/90 px-4 py-3 text-xs text-stone-800 dark:border-brand-gold/20 dark:bg-stone-900/80 dark:text-stone-200 ${className ?? ""}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-forest dark:text-brand-gold" />
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
