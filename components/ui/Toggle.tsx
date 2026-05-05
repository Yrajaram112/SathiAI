"use client";

import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onCheckedChange,
  id,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <Switch.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-muted transition-colors data-[state=checked]:bg-brand-forest dark:data-[state=checked]:bg-brand-gold",
      )}
    >
      <Switch.Thumb
        className={cn(
          "block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-6",
        )}
      />
    </Switch.Root>
  );
}
