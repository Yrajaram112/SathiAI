export const metadata = {
  title: "Terms",
  description: "Terms of use for Sathi AI.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-foreground">
      <h1 className="font-display text-3xl font-semibold">Terms of use</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Sathi AI is an informational tool. Output is not legal or financial advice.
          Final eligibility and terms are determined solely by banks, regulators, and
          government offices in Nepal.
        </p>
        <p>
          You agree not to misuse the service (including automated scraping, circumventing
          rate limits, or submitting false information). We may change or discontinue the
          service with reasonable notice where feasible.
        </p>
      </div>
    </div>
  );
}
