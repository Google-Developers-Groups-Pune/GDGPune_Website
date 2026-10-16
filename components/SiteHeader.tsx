"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { navLinks, site } from "@/data/site";
import { cn } from "@/lib/cn";
import { ButtonLink } from "./ButtonLink";
import { ColorBars } from "./ColorBars";
import { GdgToggleSwitch } from "./GdgToggleSwitch";
import { SocialLinks } from "./SocialLinks";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Layout effect so the scroll lock is released synchronously when the menu closes.
  useLayoutEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !buttonRef.current || !menuRef.current) return;

      // Keep focus cycling between the toggle button and the menu links.
      const focusables = [buttonRef.current, ...menuRef.current.querySelectorAll<HTMLElement>("a")];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  // The scroll lock blocks native anchor jumps, so close (and unlock) first, then scroll.
  const onMenuLinkClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    flushSync(() => setOpen(false));
    document.querySelector(href)?.scrollIntoView();
    history.pushState(null, "", href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/80 bg-white/85 shadow-[0_1px_8px_rgba(60,64,67,.035)] backdrop-blur-[22px] backdrop-saturate-[1.8]">
        <div className="page-container flex h-[72px] items-center justify-between gap-4">
          <div className="flex shrink-0 items-center gap-3">
            <GdgToggleSwitch />
            <a href="#top" onClick={closeMenu} className="flex shrink-0 items-center">
              <Image
                src="/gdg-pune-logo.svg"
                alt="Google Developer Group Pune"
                width={1920}
                height={390}
                preload
                sizes="(min-width: 640px) 440px, 300px"
                className="gdg-logo-launch h-[46px] w-auto sm:h-[58px]"
              />
            </a>
          </div>

          <nav aria-label="Primary" className="flex items-center gap-1.5 text-sm font-medium">
            <ul className="hidden items-center gap-1 rounded-full border border-line bg-white/75 p-1 lg:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block rounded-full px-3.5 py-2 text-fg-muted transition-colors hover:bg-blue-pale hover:text-google-blue"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <span className="ml-1.5 hidden sm:block">
              <ButtonLink href={site.bevyUrl}>Join us</ButtonLink>
            </span>
            <button
              ref={buttonRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="ml-1 grid size-11 place-items-center rounded-full border border-line-strong bg-white text-fg transition-colors hover:bg-surface lg:hidden"
            >
              <span aria-hidden="true" className="relative block h-3.5 w-5">
                <span
                  className={cn(
                    "absolute top-0 left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200",
                    open && "translate-y-1.5 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute top-1.5 left-0 h-0.5 w-5 rounded-full bg-current transition-opacity duration-200",
                    open && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute top-3 left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-200",
                    open && "-translate-y-1.5 -rotate-45",
                  )}
                />
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise trap the fixed overlay. */}
      <div
        id="mobile-menu"
        ref={menuRef}
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-white pt-[72px] duration-200 lg:hidden",
          // Visibility flips instantly on open (so links can take focus) and only fades out on close.
          open ? "visible opacity-100 transition-opacity" : "invisible opacity-0 transition-[opacity,visibility]",
        )}
      >
        <nav aria-label="Mobile" className="page-container flex flex-1 flex-col overflow-y-auto pt-4 pb-8">
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href} className="border-b border-line">
                <a
                  href={link.href}
                  onClick={(event) => onMenuLinkClick(event, link.href)}
                  className="flex min-h-16 items-center justify-between gap-4 py-3 text-[clamp(1.625rem,7vw,2.25rem)] font-semibold tracking-[-.01em] text-fg transition-colors hover:text-google-blue"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-2xl text-google-blue">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink href={site.bevyUrl} size="lg" onClick={closeMenu} className="mt-8 w-full">
            Join us on Bevy
          </ButtonLink>
          <div className="mt-auto flex flex-col gap-6 pt-10">
            <SocialLinks />
            <ColorBars className="gap-1.5" barClassName="h-1 flex-1" />
          </div>
        </nav>
      </div>
    </>
  );
}
