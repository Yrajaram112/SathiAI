"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/components/layout/LangToggle";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Navbar() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-brand-forest dark:text-brand-gold">
          Sathi AI
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/assess"
            className="text-sm font-medium text-brand-forest hover:underline dark:text-brand-gold"
          >
            {t("nav.assess")}
          </Link>
          <ThemeToggle />
          <LangToggle />
        </nav>
      </div>
    </header>
  );
}
