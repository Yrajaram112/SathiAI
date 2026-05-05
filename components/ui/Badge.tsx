import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-brand-forest/10 px-3 py-0.5 text-xs font-medium text-brand-forest dark:bg-brand-gold/10 dark:text-brand-gold",
        className,
      )}
      {...props}
    />
  );
}
