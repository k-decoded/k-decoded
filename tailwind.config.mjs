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
        // "Editorial pastel" brand palette — a K-Decoded brand refresh.
        // Named stops map to the brief's four pink swatches; the numeric
        // slots in between reuse the nearest named swatch so existing
        // classes (focus rings, hovers, decorative accents) update for
        // free without touching every file that references them.
        //   50/100  = Pale Pink / Soft Blush Pink (backgrounds)
        //   300–800 = Main Pastel Pink / Deep Dusty Rose (borders, text,
        //             links, active states — anything that needs to
        //             stay AA-readable)
        brand: {
          50: "#faecef", // Pale Pink — Quick Decode, newsletter, large tinted bg
          100: "#f1d8de", // Soft Blush Pink — highlighted bg, cards, My Korea
          200: "#ebc5cd", // hover step between blush and main pastel
          300: "#d9a7b0", // MAIN PASTEL PINK — decorative use only (borders,
          // button backgrounds under dark text, selected-state fills).
          // The brief's literal #B97F8A ("Deep Dusty Rose") only measures
          // ~3:1 against the Warm Ivory/Soft White backgrounds it's meant
          // to sit on — well under the 4.5:1 AA text requirement the
          // brief's own accessibility section calls for, and this shade
          // is used site-wide for real body links and small labels. 400
          // upward use a darkened, still-clearly-"dusty rose" value
          // (~4.7:1) instead, so links/labels/focus rings stay legible.
          400: "#916070",
          500: "#916070",
          600: "#916070",
          700: "#916070", // AA-safe dusty rose — links, labels, icons, active states
          800: "#916070",
          900: "#7a4e5a", // deeper hover-only step for links
        },
        // Warm-neutral "paper" palette — ivory/beige/soft-white instead
        // of pure white, so large neutral areas read as warm editorial
        // paper rather than generic SaaS grey.
        cream: {
          DEFAULT: "#f8f4ef", // Warm Ivory — primary bg, article bg
          50: "#fffdfc", // Soft White — elevated surfaces, cards, forms
          100: "#f8f4ef",
          200: "#f3ece7", // Warm Beige — alternate sections
        },
        // Deep Charcoal (primary text/headings/buttons) + Warm Taupe
        // (secondary text/metadata). Article body copy intentionally
        // matches heading darkness — see .article-body in global.css.
        ink: {
          DEFAULT: "#2a2624",
          700: "#2a2624",
          400: "#736963",
        },
        // Muted Sage — a secondary accent used sparingly (tips, travel
        // info), never alongside large pink areas.
        sage: {
          50: "#e1e5dc", // Soft Sage — informational backgrounds
          200: "#e1e5dc",
          400: "#a8b09f", // Muted Sage — accent/border
          600: "#8b9884",
        },
        // Warm Border — the one neutral divider/card/input border color,
        // used instead of scattering opacity-modified ink borders.
        line: "#ded5cf",
      },
    },
  },
  // Adds the `prose` utility class, which gives nicely spaced/typeset
  // Markdown content (headings, paragraphs, lists) with one class name
  // instead of styling every element by hand.
  plugins: [typography],
};
