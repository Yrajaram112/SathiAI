"use client";

import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-full border border-border bg-card p-0.5 text-xs font-medium">
      <Button
        type="button"
        variant={lang === "en" ? "primary" : "ghost"}
        size="sm"
        className="min-h-8 rounded-full px-3"
        onClick={() => setLang("en")}
      >
        EN
      </Button>
      <Button
        type="button"
        variant={lang === "np" ? "primary" : "ghost"}
        size="sm"
        className="min-h-8 rounded-full px-3 font-deva"
        onClick={() => setLang("np")}
      >
        नेपा
      </Button>
    </div>
  );
}
