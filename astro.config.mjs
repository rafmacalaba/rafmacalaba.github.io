import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://rafmacalaba.github.io",
  base: "/",
  integrations: [sitemap()],
});
