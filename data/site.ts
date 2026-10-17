export const site = {
  name: "GDG Pune",
  url: "https://gdgpune.in",
  description:
    "Google Developers Group (GDG) is where developers of all levels, interests, and background meet to learn new skills and share passion for technology.",
  email: "connect@gdgpune.in",
  bevyUrl: "https://gdg.community.dev/gdg-pune/",
  upcomingEventsUrl: "https://gdg.community.dev/gdg-pune/#upcoming-events",
  devfestUrl: "https://devfest.gdgpune.in",
  devfestProgramUrl: "https://developers.google.com/community/devfest",
  gdgProgramUrl: "https://developers.google.com/community/gdg",
  buildWithAiUrl: "https://developers.google.com/community/build-with-ai",
  puneMapUrl: "https://maps.app.goo.gl/tu25sgauUXwBRfDb6",
  videoId: "V6s5kjSoqzw",
} as const;

export type NavLink = { href: string; label: string };

export const navLinks: NavLink[] = [
  { href: "#about", label: "About" },
  { href: "#vision", label: "Vision" },
  { href: "#events", label: "Events" },
  { href: "#team", label: "Organizers" },
  { href: "#contact", label: "Contact" },
];

export type FocusArea = {
  tag: string;
  title: string;
  description: string;
  className: string;
};

export const focusAreas: FocusArea[] = [
  {
    tag: "AI / GEN AI & AGENTIC AI",
    title: "Build with AI, Autonomous Agents & Production Systems",
    description:
      "Gemini, Vertex AI, and advanced Agentic AI frameworks — moving from prompt engineering to production-grade multi-agent pipelines, automation workflows, and real-world hands-on labs.",
    className: "bg-green-pale",
  },
  {
    tag: "GOOGLE CLOUD",
    title: "Cloud, Infrastructure & Scalable Architecture",
    description:
      "GKE, Cloud Run, serverless, networking, and cost-aware architecture on Google Cloud designed to scale enterprise applications and startup platforms efficiently.",
    className: "bg-cyan-pale",
  },
  {
    tag: "MOBILE & WEB",
    title: "Modern Cross-Platform & Frontend Engineering",
    description:
      "Flutter, Android, web technologies, and progressive design patterns for building fast, responsive, and delightful user experiences across all devices.",
    className: "bg-yellow-pale",
  },
  {
    tag: "PRODUCT, STARTUPS & ENTREPRENEURSHIP",
    title: "Strategy, Scaling & Mentoring",
    description:
      "Bridging technology and business value. Sessions focused on product management best practices, scaling early-stage ventures, rapid prototyping, go-to-market strategies, and peer or expert mentoring for aspiring startup founders.",
    className: "bg-red-pale",
  },
  {
    tag: "COMMUNITY",
    title: "Career & Connections",
    description:
      "Lightning talks, study jams, founder firesides, and hallway conversations connecting practitioners, builders, and leaders across Pune.",
    className: "bg-blue-pale",
  },
];

export type ChapterEvent = {
  date: string;
  kind: string;
  kindClassName: string;
  title: string;
  host: string;
  url: string;
  description?: string;
};

export const events: ChapterEvent[] = [
  {
    date: "10 OCT 2026",
    kind: "WORKSHOP",
    kindClassName: "bg-tag-pink",
    title: "Build with AI - Pre DevFest Pune'26 Workshop Series 5.0 | Altimetrik India",
    host: "Altimetrik India, Pune • Hosted by GDG Pune",
    url: "https://gdg.community.dev/events/details/google-gdg-pune-presents-build-with-ai-pre-devfest-pune26-workshop-series-50-altimetrik-india/",
    description:
      "Hands-on AI workshop for developers exploring Google's latest technologies, key architecture sessions, and networking with tech practitioners.",
  },
  {
    date: "12 SEP 2026",
    kind: "WORKSHOP",
    kindClassName: "bg-tag-green",
    title: "Build with AI - Code for Communities - Pre DevFest Pune'26 Workshop Series 4.0 | Thoughtworks",
    host: "Thoughtworks, Yerwada • Hosted by GDG Pune",
    url: "https://gdg.community.dev/events/details/google-gdg-pune-presents-build-with-ai-code-for-communities-pre-devfest-pune26-workshop-series-40-thoughtworks/",
    description:
      "Hands-on sessions on prototyping and deploying applications using Google's latest AI technologies including Gemini and Vertex AI.",
  },
  {
    date: "05 SEP 2026",
    kind: "WORKSHOP",
    kindClassName: "bg-tag-yellow",
    title: "Build with AI - Code for Communities - Pre DevFest Pune'26 Workshop Series 3.0 | Josh Software",
    host: "Josh Software, Baner • Hosted by GDG Pune",
    url: "https://gdg.community.dev/events/details/google-gdg-pune-presents-build-with-ai-code-for-communities-pre-devfest-pune26-workshop-series-30-josh-software/",
    description:
      "Community-led workshop series focusing on AI code generation, Gemini APIs, and building impactful community solutions.",
  },
  {
    date: "22 AUG 2026",
    kind: "WORKSHOP",
    kindClassName: "bg-cyan",
    title: "Build with AI - Pre DevFest Pune'26 Workshop Series | PubMatic",
    host: "PubMatic, Aundh • Hosted by GDG Pune",
    url: "https://gdg.community.dev/events/details/google-gdg-pune-presents-build-with-ai-pre-devfest-pune26-workshop-series-pubmatic/",
    description:
      "Hands-on workshop exploring generative AI models, developer workflows, and scalable cloud deployment on Google Cloud.",
  },
  {
    date: "08 AUG 2026",
    kind: "WORKSHOP",
    kindClassName: "bg-tag-pink",
    title: "Build with AI - Google Developer Group Pune | Deutsche Bank",
    host: "Deutsche Bank, Magarpatta • Hosted by GDG Pune",
    url: "https://gdg.community.dev/events/details/google-gdg-pune-presents-build-with-ai-google-developer-group-pune-deutsche-bank-1/",
    description:
      "Hands-on workshop in association with Deutsche Bank exploring the Gemini Enterprise Agent Platform, Vertex AI, and real-world AI applications.",
  },
  {
    date: "31 MAY 2026",
    kind: "HACKATHON",
    kindClassName: "bg-tag-yellow",
    title: "Build with AI - Agentic Premier League | Pune Edition",
    host: "Pune Builder Space • Hosted by GDG Pune",
    url: "https://gdg.community.dev/events/details/google-gdg-pune-presents-build-with-ai-agentic-premier-league-pune-edition/",
    description:
      "Live coding vibe check combining the IPL cricket watch party with building fast agentic AI workflows and micro-solutions on Google Cloud.",
  },
  {
    date: "09 MAY 2026",
    kind: "WORKSHOP",
    kindClassName: "bg-tag-green",
    title: "Build with AI - Google Developer Group Pune | IntraEdge Technologies",
    host: "IntraEdge, Viman Nagar • Hosted by GDG Pune",
    url: "https://gdg.community.dev/events/details/google-gdg-pune-presents-build-with-ai-google-developer-group-pune-intraedge-technologies/",
    description:
      "Building AI-ready systems with practical governance, Model Context Protocol (MCP), and deploying enterprise agents on Cloud Run.",
  },
  {
    date: "25 APR 2026",
    kind: "CONFERENCE",
    kindClassName: "bg-cyan",
    title: "International Women’s Day | Break the Pattern",
    host: "In collaboration with Pendo • GDG & WTM Pune",
    url: "https://gdg.community.dev/events/details/google-gdg-pune-presents-international-womens-day-break-the-pattern/",
    description:
      "Annual IWD celebration bringing together women leaders in tech to break barriers, spark innovation, and challenge conventional patterns.",
  },
];

export type Organizer = {
  name: string;
  role: string;
  company?: string;
  image: string;
  url: string;
  linkedin: string;
  bio?: string;
};

export const organizers: Organizer[] = [
  {
    name: "Mahaveer Muttha",
    role: "GDG ORGANIZER",
    company: "Birdvision Consulting Pvt Ltd",
    image:
      "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/mahaveer_muttha_C00umYC.jpg",
    url: "https://gdg.community.dev/u/mrtzaa/",
    linkedin: "https://www.linkedin.com/in/mahaveer-muttha/",
    bio: "Lead: Google Developer Group Pune, Director BirdVision consulting pvt ltd. Tech commercialisation expert | Startup Coach.",
  },
  {
    name: "Swapnil Jathar",
    role: "GDG ORGANIZER",
    company: "Mphasis",
    image:
      "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/swapnil_jathar.JPG",
    url: "https://gdg.community.dev/u/mp4cjx/",
    linkedin: "https://www.linkedin.com/in/swapniljathar/",
    bio: "Organizer, Google Developer Group Pune. Software engineer at Mphasis.",
  },
  {
    name: "Pranoti Nandurkar",
    role: "WTM AMBASSADOR",
    company: "Tata Consultancy Services",
    image:
      "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/pranoti_nandurkar.jpg",
    url: "https://gdg.community.dev/u/pranoti/",
    linkedin: "https://www.linkedin.com/in/pranoti-nandurkar-170021b/",
    bio: "Women Techmakers Ambassador and GDG Organiser for Pune chapter. Solution Architect at Tata Consultancy Services.",
  },
  {
    name: "Namrata More",
    role: "WTM AMBASSADOR",
    company: "OneCard",
    image:
      "https://res.cloudinary.com/startup-grind/image/upload/c_fill,w_250,h_250,g_center/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-goog/avatars/namrata_more_TjJKQM8.JPG",
    url: "https://gdg.community.dev/u/mry4sh/",
    linkedin: "https://www.linkedin.com/in/namratamore",
    bio: "Product Manager at OneCard, Google Developer Expert (Payments), and GDG/WTM Pune Organizer.",
  },
];

export type SocialIconName = "linkedin" | "x" | "instagram" | "youtube" | "email";

export type SocialLink = { label: string; href: string; icon: SocialIconName };

export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/gdgpune", icon: "linkedin" },
  { label: "X (Twitter)", href: "https://www.twitter.com/gdgpune", icon: "x" },
  { label: "Instagram", href: "https://www.instagram.com/gdgpune", icon: "instagram" },
  { label: "YouTube", href: "https://www.youtube.com/@gdgpune", icon: "youtube" },
  { label: `Email ${site.email}`, href: `mailto:${site.email}`, icon: "email" },
];

export const footerChapterLinks: NavLink[] = [
  { href: "#about", label: "About" },
  { href: "#vision", label: "Vision" },
  { href: "#events", label: "Events" },
  { href: "#team", label: "Organizers" },
];

export const footerProgramLinks: NavLink[] = [
  { href: "https://developers.google.com/community/gdg", label: "About GDG" },
  { href: "https://developers.google.com/community-guidelines", label: "Code of Conduct" },
  { href: "https://gdg.community.dev/participation-terms/", label: "Participation Terms" },
  { href: "https://gdg.community.dev/chapters/", label: "Find other chapters" },
];
