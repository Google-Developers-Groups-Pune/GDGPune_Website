import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { SmartLink } from "./SmartLink";

const variants = {
  primary:
    "bg-google-blue text-white shadow-[0_2px_4px_rgba(26,115,232,.24)] hover:bg-[#174ea6]",
  outline: "border-[1.5px] border-fg text-fg hover:border-google-blue hover:text-google-blue",
  light: "bg-white text-ink hover:bg-surface",
  yellow: "bg-google-yellow text-ink hover:bg-yellow-pale",
} as const;

const sizes = {
  sm: "min-h-11 px-5 text-sm",
  md: "min-h-11 px-[18px] text-sm",
  lg: "min-h-[52px] px-[26px] text-base",
} as const;

type ButtonLinkProps = ComponentProps<typeof SmartLink> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return (
    <SmartLink
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full text-center font-semibold whitespace-nowrap transition-colors",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
