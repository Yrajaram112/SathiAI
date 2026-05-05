"use client";

import { useEffect, useRef } from "react";

type TurnstileOpts = {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void;
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOpts) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Renders Cloudflare Turnstile when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set.
 * Server verification is skipped in development if the secret is unset.
 */
export function Turnstile({
  onToken,
  onClear,
}: {
  onToken: (token: string) => void;
  onClear?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !hostRef.current) return;

    const el = hostRef.current;

    const render = () => {
      if (!window.turnstile || !hostRef.current) return;
      widgetIdRef.current = window.turnstile.render(hostRef.current, {
        sitekey: SITE_KEY,
        callback: onToken,
        "error-callback": () => onClear?.(),
        "expired-callback": () => onClear?.(),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector(
        'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
      );
      if (!existing) {
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        s.async = true;
        s.defer = true;
        s.onload = () => render();
        document.body.appendChild(s);
      } else {
        existing.addEventListener("load", render, { once: true });
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
      }
      el.innerHTML = "";
      widgetIdRef.current = null;
    };
  }, [onToken, onClear]);

  if (!SITE_KEY) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
        Turnstile not configured (dev). Assessment still works when the server skips verification.
      </p>
    );
  }

  return <div ref={hostRef} className="min-h-[65px]" />;
}
