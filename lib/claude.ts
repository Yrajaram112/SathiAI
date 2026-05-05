import Anthropic from "@anthropic-ai/sdk";

export function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

export function getAnthropicModel() {
  /** Current API id per https://docs.anthropic.com/en/docs/about-claude/models */
  return process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
}
