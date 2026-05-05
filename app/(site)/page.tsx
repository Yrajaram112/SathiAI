import Link from "next/link";
import { ArrowRight, Layers, Map, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/ui/Disclaimer";

export default function HomePage() {
  return (
    <div className="relative">
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pt-20">
        <Disclaimer className="mb-10 max-w-3xl" />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-forest/10 px-4 py-1 text-xs font-medium text-brand-forest dark:bg-brand-gold/10 dark:text-brand-gold">
              <Sparkles className="h-3.5 w-3.5" />
              Free for Nepal&apos;s entrepreneurs
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Find your{" "}
              <span className="text-brand-forest dark:text-brand-gold">
                government scheme
              </span>{" "}
              match in minutes
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Answer a few questions — Sathi maps you to programs we track with
              sources and gives you a practical roadmap for next steps.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/assess">
                  Start free assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#how">How it works</Link>
              </Button>
            </div>
          </div>
          <Card className="border-brand-forest/10 p-8 dark:border-brand-gold/10">
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                Indicative matching — final eligibility is always decided by the
                issuing office.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-forest dark:bg-brand-gold" />
                Built on a verified scheme dataset with citations you can open
                yourself.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                No account required for the free assessment.
              </li>
            </ul>
          </Card>
        </div>
      </section>

      <section id="how" className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Tell us about you",
                desc: "Age, province, background — quick and private.",
              },
              {
                icon: Map,
                title: "Describe your idea",
                desc: "We filter schemes and ask the model to explain fit.",
              },
              {
                icon: Sparkles,
                title: "Get your roadmap",
                desc: "Documents, offices, and a phased plan you can act on.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-6">
                <Icon className="h-8 w-8 text-brand-forest dark:text-brand-gold" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Pricing
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-8">
              <h3 className="font-display text-xl font-semibold">Free</h3>
              <p className="mt-2 text-muted-foreground">
                Matching, roadmap view, and sharing from the browser.
              </p>
            </Card>
            <Card className="p-8 ring-1 ring-brand-forest/20 dark:ring-brand-gold/25">
              <h3 className="font-display text-xl font-semibold">
                PDF export <span className="text-sm font-normal">(soon)</span>
              </h3>
              <p className="mt-2 text-muted-foreground">
                One-time NPR 499 via Khalti when payments are enabled — not
                required for the core experience.
              </p>
            </Card>
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/assess">
                Ready to find your path?
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
