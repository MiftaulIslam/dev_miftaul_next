import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

const BASE =
  "group inline-flex h-control items-center justify-center gap-2 rounded-xl px-6 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const VARIANTS = {
  // `!` because .glass is unlayered CSS and would otherwise beat these hovers.
  ghost:
    "glass text-foreground hover:border-primary/50! hover:bg-primary/10! hover:shadow-lg hover:shadow-primary/15",
} as const;

type Shared = {
  variant?: keyof typeof VARIANTS;
  /** Rendered beside the label; turns primary on hover. */
  icon?: ReactNode;
  iconSide?: "start" | "end";
  children: ReactNode;
  className?: string;
};

type AsLink = Shared & { href: string } & Omit<ComponentPropsWithoutRef<typeof Link>, keyof Shared | "href">;
type AsButton = Shared & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, keyof Shared>;

export type V2ButtonProps = AsLink | AsButton;

/** Shared control: renders a Next <Link> when `href` is set, else a <button>. */
export default function V2Button({
  variant = "ghost",
  icon,
  iconSide = "end",
  children,
  className,
  ...rest
}: V2ButtonProps) {
  const classes = cn(BASE, VARIANTS[variant], className);
  const iconNode = icon && (
    <span
      aria-hidden
      className="flex text-muted-foreground transition-all duration-200 group-hover:text-primary [&>svg]:h-4 [&>svg]:w-4"
    >
      {icon}
    </span>
  );
  const content = (
    <>
      {iconSide === "start" && iconNode}
      {children}
      {iconSide === "end" && iconNode}
    </>
  );

  if (rest.href !== undefined) {
    return (
      <Link {...(rest as AsLink)} className={classes}>
        {content}
      </Link>
    );
  }
  const { type = "button", ...buttonProps } = rest as AsButton;
  return (
    <button type={type} {...buttonProps} className={classes}>
      {content}
    </button>
  );
}
