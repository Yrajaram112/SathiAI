export const metadata = {
  title: "Privacy",
  description: "How Sathi AI handles your assessment data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-foreground">
      <h1 className="font-display text-3xl font-semibold">Privacy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Sathi AI provides indicative scheme matching. We do not guarantee eligibility.
          Information you submit is used to generate guidance and may be logged for abuse
          prevention (rate limits, IP hashing). When you use the optional email field, we
          may contact you about product updates — we do not sell personal data.
        </p>
        <p>
          Government schemes change; always confirm terms with the issuing bank or
          ministry.
        </p>
      </div>
    </div>
  );
}
