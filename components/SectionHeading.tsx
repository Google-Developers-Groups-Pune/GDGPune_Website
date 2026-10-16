import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  id: string;
  label?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
};

/** Mono eyebrow label followed by the section h2. */
export function SectionHeading({ id, label, children, className, labelClassName = "text-cyan" }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {label && <span className={cn("font-mono text-[13px] tracking-[.06em]", labelClassName)}>{label}</span>}
      <h2
        id={id}
        className="text-[clamp(1.875rem,4vw,2.875rem)] leading-[1.1] font-normal tracking-[-.02em] text-balance"
      >
        {children}
      </h2>
    </div>
  );
}
