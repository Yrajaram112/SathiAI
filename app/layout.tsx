import type { Metadata } from "next";
import {
  DM_Sans,
  JetBrains_Mono,
  Noto_Sans_Devanagari,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});
const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const deva = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-deva",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Sathi AI — Nepal scheme & startup matching",
    template: "%s · Sathi AI",
  },
  description:
    "Find government schemes and concessional loans matched to your profile—indicative guidance with verified sources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} ${deva.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
