import type { ReactNode } from "react";
import { socialLinks, type SocialIconName } from "@/data/site";
import { cn } from "@/lib/cn";
import { SmartLink } from "./SmartLink";

const svgProps = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "block",
} as const;

const icons: Record<SocialIconName, ReactNode> = {
  linkedin: (
    <svg {...svgProps}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="8" y1="10.5" x2="8" y2="17" />
      <circle cx="8" cy="7.2" r=".6" fill="currentColor" />
      <path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4" />
      <line x1="12" y1="10.5" x2="12" y2="17" />
    </svg>
  ),
  x: (
    <svg {...svgProps}>
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  ),
  instagram: (
    <svg {...svgProps}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r=".6" fill="currentColor" />
    </svg>
  ),
  youtube: (
    <svg {...svgProps}>
      <rect x="2.5" y="5" width="19" height="14" rx="4" />
      <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  ),
  email: (
    <svg {...svgProps}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7l8.5 6.5L20.5 7" />
    </svg>
  ),
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {socialLinks.map((link) => (
        <li key={link.icon}>
          <SmartLink
            href={link.href}
            aria-label={link.label}
            title={link.label}
            className="flex size-11 items-center justify-center rounded-full border border-line-strong text-fg transition-colors hover:border-cyan hover:bg-cyan/8 hover:text-cyan"
          >
            {icons[link.icon]}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
