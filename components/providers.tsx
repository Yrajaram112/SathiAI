"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { LangProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <LangProvider>
        {children}
        <Toaster position="bottom-center" />
      </LangProvider>
    </ThemeProvider>
  );
}
