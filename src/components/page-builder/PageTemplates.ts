export interface PageTemplate {
  id: string;
  label: string;
  icon: string;
  description: string;
  pageTitle: string;
  pageSlug: string;
  blocks: { block_type: string; content: Record<string, any>; styles: Record<string, any> }[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "about",
    label: "About Us",
    icon: "📄",
    description: "Company overview with mission, team & values",
    pageTitle: "About",
    pageSlug: "about",
    blocks: [
      { block_type: "heading", content: { text: "About Us", subtitle: "Who we are and what we do", fontSize: 40 }, styles: { alignment: "center", paddingY: 48 } },
      { block_type: "text", content: { text: "We are a passionate team dedicated to delivering exceptional experiences. Our journey began with a simple idea — to make technology more human.", fontSize: 16, lineHeight: 1.8 }, styles: { alignment: "center", maxWidth: "640px", paddingY: 16 } },
      { block_type: "divider", content: { thickness: 1 }, styles: { paddingY: 16, maxWidth: "640px" } },
      { block_type: "icon_grid", content: { items: [{ icon: "🎯", label: "Mission", description: "Empowering people through innovation" }, { icon: "👁️", label: "Vision", description: "A world connected by technology" }, { icon: "💎", label: "Values", description: "Integrity, creativity, impact" }] }, styles: { paddingY: 24 } },
      { block_type: "stats", content: { items: [{ value: "5+", label: "Years" }, { value: "1K+", label: "Clients" }, { value: "50+", label: "Projects" }, { value: "4.9", label: "Rating" }] }, styles: { paddingY: 24 } },
    ],
  },
  {
    id: "mission",
    label: "Mission & Vision",
    icon: "🎯",
    description: "Your organization's purpose and goals",
    pageTitle: "Mission & Vision",
    pageSlug: "mission",
    blocks: [
      { block_type: "heading", content: { text: "Our Mission", fontSize: 36 }, styles: { alignment: "center", paddingY: 48 } },
      { block_type: "quote", content: { text: "To empower individuals and businesses with tools that inspire connection, creativity, and growth.", author: "Our Founder" }, styles: { paddingY: 24, maxWidth: "640px" } },
      { block_type: "spacer", content: { height: 32 }, styles: {} },
      { block_type: "heading", content: { text: "Our Vision", fontSize: 36 }, styles: { alignment: "center", paddingY: 24 } },
      { block_type: "text", content: { text: "We envision a future where every professional has the tools to showcase their identity, build meaningful relationships, and grow their network effortlessly.", fontSize: 16, lineHeight: 1.8 }, styles: { alignment: "center", maxWidth: "640px", paddingY: 16 } },
    ],
  },
  {
    id: "team",
    label: "Meet the Team",
    icon: "👥",
    description: "Showcase your team members",
    pageTitle: "Team",
    pageSlug: "team",
    blocks: [
      { block_type: "heading", content: { text: "Meet the Team", subtitle: "The people behind the magic", fontSize: 36 }, styles: { alignment: "center", paddingY: 48 } },
      { block_type: "team", content: { name: "Alex Rivera", role: "CEO & Founder", description: "Visionary leader with 10+ years in tech" }, styles: { paddingY: 8, maxWidth: "640px" } },
      { block_type: "team", content: { name: "Sam Chen", role: "CTO", description: "Full-stack architect and systems thinker" }, styles: { paddingY: 8, maxWidth: "640px" } },
      { block_type: "team", content: { name: "Jordan Lee", role: "Head of Design", description: "Crafting beautiful, intuitive experiences" }, styles: { paddingY: 8, maxWidth: "640px" } },
    ],
  },
  {
    id: "products",
    label: "Products Showcase",
    icon: "🛍️",
    description: "Feature your products and store",
    pageTitle: "Products",
    pageSlug: "products",
    blocks: [
      { block_type: "heading", content: { text: "Our Products", subtitle: "Browse our collection", fontSize: 36 }, styles: { alignment: "center", paddingY: 48 } },
      { block_type: "text", content: { text: "Handpicked and curated just for you. Every product is crafted with care and quality.", fontSize: 16 }, styles: { alignment: "center", maxWidth: "640px", paddingY: 8 } },
      { block_type: "products", content: {}, styles: { paddingY: 24 } },
      { block_type: "testimonial", content: { text: "Amazing quality and fast delivery!", name: "Happy Customer", company: "Verified Buyer", rating: 5 }, styles: { paddingY: 16, maxWidth: "640px" } },
    ],
  },
  {
    id: "contact",
    label: "Contact Page",
    icon: "✉️",
    description: "Contact form with social links",
    pageTitle: "Contact",
    pageSlug: "contact",
    blocks: [
      { block_type: "heading", content: { text: "Get in Touch", subtitle: "We'd love to hear from you", fontSize: 36 }, styles: { alignment: "center", paddingY: 48 } },
      { block_type: "contact", content: { title: "Send us a message", buttonText: "Send Message" }, styles: { maxWidth: "640px", paddingY: 16 } },
      { block_type: "divider", content: { thickness: 1 }, styles: { paddingY: 24, maxWidth: "640px" } },
      { block_type: "social", content: { links: [] }, styles: { paddingY: 16 } },
    ],
  },
  {
    id: "faq",
    label: "FAQ Page",
    icon: "❓",
    description: "Frequently asked questions",
    pageTitle: "FAQ",
    pageSlug: "faq",
    blocks: [
      { block_type: "heading", content: { text: "Frequently Asked Questions", fontSize: 32 }, styles: { alignment: "center", paddingY: 48 } },
      { block_type: "faq", content: { items: [{ q: "What is NFC Hub?", a: "NFC Hub is a platform for creating digital business cards and professional landing pages." }, { q: "How do I get started?", a: "Simply sign up, create a persona, and customize your page using the Page Builder." }, { q: "Can I sell products?", a: "Yes! With a Pro plan, you can set up a storefront and manage orders directly." }] }, styles: { maxWidth: "640px", paddingY: 16 } },
    ],
  },
];
