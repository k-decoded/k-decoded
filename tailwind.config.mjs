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
        // Editorial display serif — used explicitly via `font-display`
        // wherever the homepage/Nav/Footer redesign wants a magazine
        // headline. NOT applied globally (unlike `heading` above), so
        // every other page's h1–h6 stay Fredoka exactly as before.
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
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
        // Editorial palette additions — warm-neutral (slight brown/
        // yellow undertone) rather than cool grey, so they read as
        // "warm cream / deep charcoal" instead of generic SaaS
        // greyscale. Used by the site-wide Nav/Footer redesign and the
        // homepage's editorial sections.
        cream: {
          DEFAULT: "#faf6f0",
          50: "#fdfbf8",
          100: "#faf6f0",
          200: "#f3ebe0",
        },
        ink: {
          DEFAULT: "#211f1d",
          700: "#3a3733",
          400: "#7a746c",
        },
        // Optional secondary accent (dividers, small tags) — brand
        // pink stays the one primary accent color.
        sage: {
          50: "#f4f6f1",
          200: "#dbe3d3",
          400: "#a9b99a",
          600: "#7c9268",
        },
      },
    },
  },
  // Adds the `prose` utility class, which gives nicely spaced/typeset
  // Markdown content (headings, paragraphs, lists) with one class name
  // instead of styling every element by hand.
  plugins: [typography],
};
