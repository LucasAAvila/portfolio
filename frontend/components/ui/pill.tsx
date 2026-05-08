import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type PillVariant = "default" | "amber" | "solid";

interface PillBaseProps {
  variant?: PillVariant;
  className?: string;
  children: ReactNode;
}

type SpanPillProps = PillBaseProps &
  Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> & {
    as?: "span";
    href?: never;
  };

type AnchorPillProps = PillBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    as: "a";
    href: string;
  };

type PillProps = SpanPillProps | AnchorPillProps;

const base =
  "inline-flex items-center font-mono text-[11px] rounded-[3px] px-[10px] py-[2px] whitespace-nowrap";

const variantStyles: Record<PillVariant, string> = {
  default: "border border-border-3 text-text-dimmer",
  amber: "border border-accent-border-soft text-accent-soft",
  solid: "bg-surface-2 border border-border-3 text-text-mute",
};

function withoutInternalProps<T extends Record<string, unknown>>(props: T) {
  const rest = { ...props };
  delete rest.as;
  delete rest.variant;
  delete rest.className;
  delete rest.children;
  return rest;
}

export function Pill(props: PillProps) {
  const { variant = "default", className, children } = props;
  const classes = cn(base, variantStyles[variant], className);

  if (props.as === "a") {
    const rest = withoutInternalProps(
      props as unknown as Record<string, unknown>
    ) as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const rest = withoutInternalProps(
    props as unknown as Record<string, unknown>
  ) as HTMLAttributes<HTMLSpanElement> & { href?: string };
  delete rest.href;

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
