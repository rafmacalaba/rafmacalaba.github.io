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
  tagline: "",
  url: "https://rafmacalaba.github.io",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Work", href: "/work" },
    { label: "Writing", href: "/writing" },
    { label: "About", href: "/about" },
    { label: "Now", href: "/now" },
  ] satisfies NavLink[],
  contactLinks: [] as ContactLink[],
  copyrightYear: new Date().getFullYear(),
} as const;

export type SiteConfig = typeof siteConfig;
