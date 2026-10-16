# Google Developer Group Pune (GDG Pune) — Official Website

The official web portal for **Google Developer Group Pune** ([gdgpune.in](https://gdgpune.in)) — built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS v4**.

---

## 🗺️ Complete Website Map & Architecture

### Page Structure & Sections

```mermaid
graph TD
    A["Header (Sticky Navigation, Logo, Social, Join Button)"] --> B["Hero Section"]
    B --> B1["Top Quote (Sundar Pichai)"]
    B --> B2["Chapter Badge (Pune, India) & Theme Toggle"]
    B --> B3["Hero Headline: Start. Build. Grow. with GDG Pune"]
    B --> B4["Hero Action Buttons & Floating Google Dots Tagline"]
    B --> B5["DevFest Pune 2026 Interactive Hero Panel"]
    B --> C["Our Vision / What We Do"]
    C --> C1["4 Core Pillars (Tech Talks, Workshops, Flagship, Networking)"]
    C --> C2["Community Welcome Statement"]
    C --> C3["5 Focus Area Cards (AI, Cloud, Mobile/Web, Startups, Community)"]
    C --> D["Past Events Showcase"]
    D --> E["Organizers (Mahaveer, Swapnil, Pranoti, Namrata)"]
    E --> F["Chapter Video (Community Vibe)"]
    F --> G["Never Miss an Update! (Join on Bevy CTA)"]
    G --> H["Footer (Navigation, Disclaimer, Guidelines, Copyright)"]
```

### File & Directory Map

```text
GDGPune_Website/
├── app/                          # Next.js App Router core
│   ├── globals.css               # Design tokens, color palette, animations (@keyframes dot-float)
│   ├── layout.tsx                # Root layout with Google Sans Flex fonts, SEO metadata, JSON-LD schema
│   ├── page.tsx                  # Home page assembling all visual sections
│   ├── opengraph-image.tsx       # Dynamic edge OG card generator
│   ├── robots.ts                 # Search engine crawler permissions
│   └── sitemap.ts                # XML Sitemap generator
├── components/                   # Modular UI components
│   ├── SiteHeader.tsx            # Sticky navigation bar with mobile drawer
│   ├── Hero.tsx                  # Main hero section with quote and action links
│   ├── DevFestHeroPanel.tsx      # DevFest Pune 2026 showcase card
│   ├── DevFestBraceField.tsx     # Animated brace particle field
│   ├── Focus.tsx                 # "Our Vision" section with 4 pillars & 5 focus areas
│   ├── Events.tsx                # Flagship gatherings & past event cards
│   ├── Organizers.tsx            # Single-line desktop organizer grid (4 columns)
│   ├── ChapterVideo.tsx          # Embedded community vibe YouTube video
│   ├── JoinCta.tsx               # "Never miss an update!" Bevy CTA banner
│   ├── SiteFooter.tsx            # Chapter & Program links, disclaimer, guidelines, copyright
│   ├── SectionHeading.tsx        # Consistent mono-eyebrow section headers
│   ├── ButtonLink.tsx            # Accessible primary and outline button links
│   ├── SmartLink.tsx             # Intelligent routing (internal vs external links)
│   └── SocialLinks.tsx           # LinkedIn, X, Instagram, YouTube social buttons
├── data/
│   └── site.ts                   # Central content hub: URLs, focus tags, events, organizers
├── public/                       # Static images, SVG logos, favicons
│   ├── gdg-pune-logo.svg         # Primary GDG Pune logo
│   ├── gdg-logo.svg              # Google Developer Groups symbol
│   └── gdg-cloud-pune-logo.png   # Chapter branding asset
├── next.config.ts                # Next.js configuration and image domains (Cloudinary)
├── package.json                  # Dependencies and build scripts
└── tsconfig.json                 # TypeScript strict compiler config
```

### Content Hub (`data/site.ts`)

All content that updates regularly is isolated in [`data/site.ts`](data/site.ts):
- **Chapter Links**: Bevy community URL, DevFest site, GDG program links.
- **Focus Areas**: AI/Agentic AI, Cloud, Mobile & Web, Startups, Community.
- **Past Events**: DevFest Pune, Cloud Community Days, Build with AI, Google I/O Extended.
- **Organizers**: Names, titles, company affiliations, profile avatars, Bevy & LinkedIn links.

---

## 💻 Local Development & Cloning

### 1. Prerequisites
- **Node.js**: v20+ or v22 LTS (`node -v`)
- **Package Manager**: `pnpm` (recommended) or `npm`

### 2. Clone the Repository
```bash
git clone https://github.com/Google-Developers-Groups-Pune/GDGPune_Website.git
cd GDGPune_Website
```

### 3. Install Dependencies
```bash
# Using pnpm
pnpm install

# Or using npm
npm install
```

### 4. Run Development Server
```bash
pnpm dev
# or npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Build for Production
```bash
pnpm build
pnpm start
```

---

## 📜 Community & Conduct

- All attendees, speakers, sponsors, and organizers follow the [Google Developer Community Guidelines](https://www.google.com/events/policy/anti-harassmentpolicy.html).
- GDG Pune is an independent group; activities and opinions expressed are not linked to Google the corporation. Learn more at [developers.google.com/community/gdg](https://developers.google.com/community/gdg).

© 2026 Google Developer Group Pune.
