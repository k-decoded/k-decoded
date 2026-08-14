import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

// Replace with your real domain once you buy one — Vercel gives you a
// *.vercel.app URL for free, but the sitemap/SEO tags need a canonical
// domain to point search engines at.
const SITE_URL = "https://k-decoded.vercel.app";

export default defineConfig({
  site: SITE_URL,
  integrations: [
    tailwind(),
    sitemap(),
    mdx(),
  ],
});
