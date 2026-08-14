import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

// Canonical domain — used to build absolute URLs for the sitemap and
// SEO/Open Graph tags.
const SITE_URL = "https://k-decoded.com";

export default defineConfig({
  site: SITE_URL,
  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
  ],
});
