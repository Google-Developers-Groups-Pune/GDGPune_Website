import type { ComponentProps } from "react";

type SmartLinkProps = ComponentProps<"a"> & { href: string };

/** Anchor that opens absolute http(s) URLs in a new tab safely. */
export function SmartLink({ href, ...props }: SmartLinkProps) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  );
}
