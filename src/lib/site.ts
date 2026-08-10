export interface NavLink {
  label: string;
  href: string;
}

export interface ContactLink {
  label: string;
  href: string;
}

export const siteConfig = {
  name: "Rafael Macalaba",
  tagline:
    "Researcher and engineer working at the intersection of data, policy, and applied systems.",
  url: "https://rafmacalaba.github.io",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Work", href: "/work" },
    { label: "Writing", href: "/writing" },
    { label: "About", href: "/about" },
    { label: "Now", href: "/now" },
  ] satisfies NavLink[],
  contactLinks: [
    { label: "Email", href: "mailto:rafael@example.com" },
    { label: "GitHub", href: "https://github.com/rafmacalaba" },
  ] satisfies ContactLink[],
  copyrightYear: new Date().getFullYear(),
} as const;

export type SiteConfig = typeof siteConfig;
