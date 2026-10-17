import type { ReactNode } from "react";
import { socialLinks, type SocialIconName } from "@/data/site";
import { cn } from "@/lib/cn";
import { SmartLink } from "./SmartLink";

const icons: Record<SocialIconName, ReactNode> = {
  linkedin: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="#0A66C2" aria-hidden="true" className="block">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="#000000" aria-hidden="true" className="block">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" aria-hidden="true" className="block">
      <defs>
        <linearGradient id="ig-gradient-icon" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bc1888" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="100%" stopColor="#f09433" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-gradient-icon)" strokeWidth={2.2} />
      <circle cx="12" cy="12" r="4.2" stroke="url(#ig-gradient-icon)" strokeWidth={2.2} />
      <circle cx="17.5" cy="6.5" r="1.3" fill="url(#ig-gradient-icon)" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" aria-hidden="true" className="block">
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
        fill="#FF0000"
      />
      <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" aria-hidden="true" className="block">
      {/* Google Blue pillar */}
      <path d="M2 7v10c0 1.1.9 2 2 2h3V9.5L2 7z" fill="#4285F4" />
      {/* Google Green pillar */}
      <path d="M22 7v10c0 1.1-.9 2-2 2h-3V9.5L22 7z" fill="#34A853" />
      {/* Center Google Red folds */}
      <path d="M12 14.5L2 7l2-1.5 8 6 8-6 2 1.5-10 7.5z" fill="#EA4335" />
      {/* Top-left Google Dark Red corner */}
      <path d="M4 5h3v4.5L2 7c0-1.1.9-2 2-2z" fill="#C5221F" />
      {/* Top-right Google Yellow corner */}
      <path d="M20 5h-3v4.5L22 7c0-1.1-.9-2-2-2z" fill="#FBBC05" />
    </svg>
  ),
};

const brandHoverStyles: Record<SocialIconName, string> = {
  linkedin:
    "hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 hover:shadow-[0_4px_14px_rgba(10,102,194,0.18)]",
  x:
    "hover:border-black hover:bg-black/5 hover:shadow-[0_4px_14px_rgba(0,0,0,0.18)]",
  instagram:
    "hover:border-[#dc2743] hover:bg-[#dc2743]/5 hover:shadow-[0_4px_14px_rgba(220,39,67,0.18)]",
  youtube:
    "hover:border-[#FF0000] hover:bg-[#FF0000]/5 hover:shadow-[0_4px_14px_rgba(255,0,0,0.18)]",
  email:
    "hover:border-google-blue hover:bg-blue-pale/40 hover:shadow-[0_4px_14px_rgba(66,133,244,0.18)]",
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2.5", className)}>
      {socialLinks.map((link) => (
        <li key={link.icon}>
          <SmartLink
            href={link.href}
            aria-label={link.label}
            title={link.label}
            className={cn(
              "flex size-11 items-center justify-center rounded-full border border-[#dadce0] bg-white shadow-sm transition-all duration-200 hover:scale-108 active:scale-95",
              brandHoverStyles[link.icon],
            )}
          >
            {icons[link.icon]}
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
