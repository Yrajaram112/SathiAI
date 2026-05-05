import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-brand-forest text-white shadow hover:bg-brand-forest/90",
        variant === "secondary" && "bg-brand-gold text-stone-900 hover:bg-brand-gold/90",
        variant === "ghost" && "bg-transparent hover:bg-muted",
        variant === "outline" &&
          "border border-brand-forest/30 bg-transparent text-brand-forest hover:bg-brand-forest/5",
        size === "sm" && "min-h-10 px-4 text-sm",
        size === "md" && "min-h-11 px-5 text-sm",
        size === "lg" && "min-h-12 px-8 text-base",
        className,
      )}
      {...props}
    />
    );
  },
);
Button.displayName = "Button";
