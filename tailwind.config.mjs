import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind scans these files for class names and only generates CSS
  // for classes it actually finds — this keeps the final CSS tiny.
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        // Headings: Fredoka — warm, rounded, friendly. Applied via a
        // global base-layer rule (see src/styles/global.css) so every
        // h1–h6 across the site picks it up automatically.
        heading: ['"Fredoka"', "ui-sans-serif", "system-ui", "sans-serif"],
        // Body text: Work Sans — set as the default body font, so
        // paragraphs, nav links, and buttons all inherit it without
        // needing the class added everywhere by hand.
        body: ['"Work Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        // Korean: Noto Sans KR first, so Hangul always renders with a
        // font that actually has those glyphs, falling back to Work
        // Sans for any Latin characters mixed into the same string.
        korean: ['"Noto Sans KR"', '"Work Sans"', "sans-serif"],
      },
      colors: {
        // A soft dusty-rose accent fits a K-beauty brand — muted rather
        // than a saturated hot-pink/fuchsia, so it reads calm and
        // premium instead of loud. Feel free to tune these hex values
        // later — every "brand" class below will update automatically.
        brand: {
          50: "#fdf3f5",
          100: "#fbe8ec",
          200: "#f6d2db",
          300: "#eeb3c3",
          400: "#e08fa5",
          500: "#cd6d88",
          600: "#b3536e",
          700: "#904058",
          800: "#713347",
          900: "#562737",
        },
      },
    },
  },
  // Adds the `prose` utility class, which gives nicely spaced/typeset
  // Markdown content (headings, paragraphs, lists) with one class name
  // instead of styling every element by hand.
  plugins: [typography],
};
