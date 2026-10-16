# GDG Pune website

Landing page for [GDG Pune](https://gdgcloudpune.in) — Next.js (App Router), TypeScript, Tailwind CSS v4.

## Develop

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Editing content

All copy that changes often lives in [`data/site.ts`](data/site.ts): links, focus areas, events, organizers and social links. Sections are in [`components/`](components), design tokens in [`app/globals.css`](app/globals.css).

## Environment

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_GA_ID` to enable Google Analytics. Nothing is loaded when it is empty.

## Deploy

Deployed on Vercel — import the repo, add `NEXT_PUBLIC_GA_ID` in project settings, and deploy. `pnpm build` prerenders the page, OG image, sitemap and robots.txt.
