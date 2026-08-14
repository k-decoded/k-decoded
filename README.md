# K-Decoded

Korea, translated — beauty, fashion, and the language behind them.

A static [Astro](https://astro.build) site: K-beauty/K-fashion content
paired with the Korean vocabulary behind it, teaching the language along
the way.

## Running it locally

1. Install dependencies:
   ```
   npm install
   ```
2. Start the dev server:
   ```
   npm run dev
   ```
3. Open http://localhost:4321.

## Project structure

```
src/
  components/     Reusable UI pieces (Nav, Footer, VocabCard, PostCard, ProductReview, SEO)
  content/
    config.ts     Schema every post's frontmatter must match
    posts/        Every blog post, as Markdown files
  layouts/
    BaseLayout.astro   Shared <html> shell every page wraps itself in
  pages/
    index.astro          Homepage ("/")
    about.astro           About page ("/about")
    vocab.astro            Vocab Glossary ("/vocab")
    blog/index.astro       Blog listing ("/blog")
    blog/[slug].astro      Individual post pages ("/blog/your-post-slug")
    tags/[tag].astro       Tag pages ("/tags/skincare", etc.)
public/           Static files served as-is (favicon, images)
```

## Adding a new post

Create a new Markdown file in `src/content/posts/`, e.g.
`src/content/posts/my-new-post.md`:

```markdown
---
title: "Your Post Title"
description: "One sentence shown on cards and in search results."
date: 2026-08-01
tags: ["skincare", "language"]
draft: false
vocab:
  - hangul: "화장품"
    romanization: "hwajangpum"
    meaning: "cosmetics"
---

Your post content here, in normal Markdown.
```

Save it — it's picked up automatically on the next build/dev reload. No
code changes needed. The `vocab` entries automatically show up both at the
bottom of the post (via the VocabCard component) and on the `/vocab`
glossary page.

### Writing a product review post

Add `isReview: true` and a `product` object to the frontmatter (see
`src/content/posts/beauty-of-joseon-relief-sun-review.md` for a full
example):

```yaml
isReview: true
product:
  name: "Product Name"
  brand: "Brand Name"
  price:
    krw: "₩24,000"
    usd: "$18"
    gbp: "£14"
    jpy: "¥2,700"
  affiliateLink: "https://example.com/affiliate-link"
  rating: 4.5
  pros:
    - "First pro"
    - "Second pro"
  cons:
    - "First con"
```

This renders a review summary box (rating, price in all four currencies,
pros/cons, affiliate button) automatically above the post body. All four
currencies are required — pick round, plausible figures if you don't
have exact conversions on hand. KRW is shown first since it's the actual
price on the Korean site.

### Linking a Korean word in the post body to the glossary

Every vocab entry gets an anchor on `/vocab` at `#<romanization-slugified>`
(spaces become hyphens, e.g. "jaoeseon chadanje" → `#jaoeseon-chadanje`).
To highlight and link a word inline in a post's Markdown body, wrap it in a
plain HTML `<a>` tag with this class — Markdown passes raw HTML straight
through, so this works inside any post:

```markdown
This is a chemical (<a href="/vocab#yugijacha" class="font-korean rounded bg-brand-50 px-1 font-semibold text-brand-700 no-underline hover:bg-brand-100">유기자차</a>, *yugijacha*) sunscreen.
```

Clicking it jumps to that word's glossary entry, which lists every other
post that uses the same term — so readers can follow a word across the
whole site. See `beauty-of-joseon-relief-sun-review.md` for more examples.

## Turning on comments

Every post has a "Discussion" section at the bottom (`src/components/Comments.astro`),
powered by [Giscus](https://giscus.app) — comments are stored as GitHub
Discussions on your own repo, so there's no database or backend to pay
for or maintain. Until you set it up, the section just renders empty —
nothing breaks.

To turn it on:

1. Push this project to a **public** GitHub repository (see "Deploying
   to Vercel" below — you need this step anyway).
2. In that repo: **Settings → General → Features → enable "Discussions"**.
3. Install the giscus app on the repo: https://github.com/apps/giscus
4. Go to https://giscus.app, enter your repo, and it'll generate four
   values (`repo`, `repoId`, `category`, `categoryId`).
5. Paste those four values into the constants at the top of
   `src/components/Comments.astro`, replacing the placeholders.

Commenters need a GitHub account to post — that's a feature, not a
limitation: it keeps spam near-zero without you having to moderate.

## Updating the contact page

`src/pages/contact.astro` currently points at a placeholder address
(`hello@k-decoded.example`) — update the `CONTACT_EMAIL` constant at the
top of that file to your real inbox before launch. It's a plain `mailto:`
link, so it works immediately with no signup. If you'd rather have an
embedded contact form later, a free option that needs no backend is
[Formspree](https://formspree.io) — you'd swap the `<a href="mailto:...">`
button for a `<form>` posting to your Formspree endpoint.

## Deploying to Vercel (free tier)

1. Push this project to a GitHub repository.
2. Go to vercel.com, sign in with GitHub, and import the repo.
3. Vercel auto-detects Astro and deploys — you'll get a live URL in about
   a minute. Every push to your main branch auto-redeploys.
4. Update `SITE_URL` in `astro.config.mjs` to your real domain once you
   have one (needed for correct sitemap/SEO URLs).
