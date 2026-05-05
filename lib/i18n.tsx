"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "@/types";

const DICT: Record<
  Lang,
  Record<string, string>
> = {
  en: {
    "nav.home": "Home",
    "nav.assess": "Assessment",
    "nav.language": "Language",
    "disclaimer.short":
      "Information is indicative. Final eligibility is determined by the issuing office. Last verified: 2026-05-05.",
    "disclaimer.short_np":
      "जानकारी सूचक मात्र हो। अन्तिम योग्यता सम्बन्धित कार्यालयले निर्धारण गर्छ। अन्तिम पुष्टि: २०२६-०५-०५।",
    "hero.badge": "Free for Nepal's entrepreneurs",
    "hero.title1": "Find your",
    "hero.title2": "government scheme match",
    "hero.title3": "in minutes",
    "hero.subtitle":
      "Answer a few questions — Sathi maps you to verified programs and a practical roadmap.",
    "hero.cta": "Start free assessment",
    "how.title": "How it works",
    "how.1.title": "Tell us about you",
    "how.1.desc": "Age, province, background — no account required.",
    "how.2.title": "Describe your idea",
    "how.2.desc": "We match against verified schemes with sources.",
    "how.3.title": "Get your roadmap",
    "how.3.desc": "Next steps, documents, and where to apply.",
    "pricing.title": "Pricing",
    "pricing.free": "Free forever",
    "pricing.free_desc": "Matching, roadmap, sharing.",
    "pricing.pdf": "PDF export (soon)",
    "pricing.pdf_desc": "One-time NPR 499 via Khalti when you enable payments.",
    "cta.end": "Ready to find your path?",
    "footer.copy": "© 2026 Sathi AI · Made in Nepal",
    "assess.step": "Step {{n}} of 3",
    "assess.next": "Continue",
    "assess.back": "Back",
    "assess.submit": "Find my matches",
    "assess.loading": "Sathi is analyzing your profile…",
    "results.title": "Your matches",
    "results.generated": "Generated just now",
    "results.roadmap": "Your roadmap",
    "results.insight": "Insider insight",
    "results.share": "Share",
  },
  np: {
    "nav.home": "गृह",
    "nav.assess": "मूल्यांकन",
    "nav.language": "भाषा",
    "disclaimer.short":
      "जानकारी सूचक मात्र हो। अन्तिम योग्यता सम्बन्धित कार्यालयले निर्धारण गर्छ। अन्तिम पुष्टि: २०२६-०५-०५।",
    "disclaimer.short_np":
      "जानकारी सूचक मात्र हो। अन्तिम योग्यता सम्बन्धित कार्यालयले निर्धारण गर्छ। अन्तिम पुष्टि: २०२६-०५-०५।",
    "hero.badge": "नेपाली उद्यमीका लागि निःशुल्क",
    "hero.title1": "आफ्नो",
    "hero.title2": "सरकारी योजना",
    "hero.title3": "छिटो भेट्टाउनुहोस्",
    "hero.subtitle":
      "केही प्रश्नको उत्तर दिनुहोस् — साथीले प्रमाणित रूपमा योजना र रोडम्याप देखाउँछ।",
    "hero.cta": "मूल्यांकन सुरु गर्नुहोस्",
    "how.title": "कसरी काम गर्छ?",
    "how.1.title": "आफ्नो बारेमा",
    "how.1.desc": "उमेर, प्रदेश, पृष्ठभूमि — खाता चाहिँदैन।",
    "how.2.title": "व्यवसाय विचार",
    "how.2.desc": "हामी प्रमाणित योजनाहरूसँग मिलाउँछौं।",
    "how.3.title": "रोडम्याप पाउनुहोस्",
    "how.3.desc": "अर्को चरण, कागजात, कहाँ आवेदन दिने।",
    "pricing.title": "मूल्य",
    "pricing.free": "सधैं निःशुल्क",
    "pricing.free_desc": "मिलान, रोडम्याप, सेयर।",
    "pricing.pdf": "PDF (छिट्टै)",
    "pricing.pdf_desc": "भुक्तानी खोल्दा खालती NPR ४९९ एक पटक।",
    "cta.end": "यात्रा सुरु गर्न तयार?",
    "footer.copy": "© २०२६ साथी AI · नेपालमा बनेको",
    "assess.step": "चरण {{n}} / ३",
    "assess.next": "अगाडि",
    "assess.back": "पछाडि",
    "assess.submit": "मिलान हेर्नुहोस्",
    "assess.loading": "साथीले विश्लेषण गर्दैछ…",
    "results.title": "तपाईंको मिलान",
    "results.generated": "भर्खरै तयार",
    "results.roadmap": "रोडम्याप",
    "results.insight": "अन्तरदृष्टि",
    "results.share": "सेयर",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = DICT[lang][key] ?? DICT.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replaceAll(`{{${k}}}`, String(v));
        }
      }
      return s;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return (
    <LangContext.Provider value={value}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within LangProvider");
  }
  return ctx;
}

export function useTranslation() {
  return useLang();
}
