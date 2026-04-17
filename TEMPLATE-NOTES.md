# Template Design Notes

Notes and inspiration for public profile page templates. Each template uses the same underlying data model (links, avatar, bio, theme) — only the presentation changes. A `template` field on the profile swaps which layout `render.ts` uses.

---

## Template Catalog

### 1. Minimal (current default)

Clean text-based links, small circular avatar, no hero section. Works great for professional/personal branding where the focus is on the links themselves, not visuals.

- Small avatar above name
- Name + bio centered
- Social icon row beneath bio
- Stacked full-width link buttons
- Light/dark/bold color themes
- No background image, solid or gradient background

**Best for:** professionals, developers, personal brands, anyone who wants a clean no-nonsense link page.

---

### 2. Photo-Forward

Hero image dominates the top of the page. Visual-first layout for creators whose brand is their image.

**Reference:** link.me profiles (see screenshots from competitor review)

**Key elements:**
- **Hero section:** User's uploaded photo rendered large at the top of the profile card area. The single uploaded photo serves dual purpose — hero and avatar.
- **Blurred background:** Same photo, heavily blurred + darkened, set as `background-image` on `body`. Fills the desktop viewport naturally around the phone-width card. On mobile the card is full-width so the blur is hidden.
- **Sticky nav on scroll:** `position: sticky` header with small circular avatar + username text. Hidden initially, shown via `IntersectionObserver` when the hero scrolls out of the viewport. Gives persistent identity without taking up space.
- **Social icon row:** Row of branded platform icons beneath the name/handle (e.g. Instagram, TikTok, Threads, OnlyFans, YouTube, etc.)
- **Link cards with images:** Links can optionally include a thumbnail image, rendered as visual cards rather than plain text buttons.
- **Phone-width container:** Centered max-width column (~430px) that looks like a phone screen on desktop. Content fills full width on mobile.

**Implementation notes:**
- Single photo upload — no separate cover vs. avatar upload
- If the photo is too small or doesn't render well as a hero, the creator sees it immediately and can swap it out
- Hero could have a subtle gradient overlay at the bottom for text readability
- Sticky nav transition: fade in when hero leaves viewport, fade out when hero re-enters

**Best for:** models, photographers, visual creators, influencers, adult content creators.

---

### 3. Grid

Side-by-side image link cards in a 2-column layout. Each link gets a thumbnail image with the link title overlaid at the bottom (like the Instagram/JFF cards from the link.me example).

**Key elements:**
- Small avatar + name at the top (not a full hero)
- Social icon row
- Links rendered as square/rectangular image cards in a 2-column CSS grid
- Platform icon badge in the corner of each card
- Links without images fall back to a solid-color card with large text

**Best for:** creators with multiple content platforms, anyone who wants a more app-like visual grid.

---

### 4. Classic

Standard Linktree-style stacked buttons. The layout most people recognize from link-in-bio pages. Familiar, functional, no surprises.

**Key elements:**
- Circular avatar centered
- Name + bio
- Social icon row
- Full-width rounded buttons stacked vertically
- Optional button style variants: rounded, pill, sharp corners, outline vs. filled
- Simple solid or gradient background

**Best for:** anyone who just wants the standard link-in-bio look. Low friction, universally understood.

---

## Shared Features Across All Templates

These elements should work in every template:

- **Social icon row:** Expand `SOCIAL_ICONS` map to cover more platforms with proper branded SVG icons. Current coverage is limited — need: LinkedIn, GitHub, TikTok, YouTube, Snapchat, Discord, Twitch, Pinterest, Threads, OnlyFans, Patreon, Spotify, Apple Music, SoundCloud, Telegram, WhatsApp, Facebook, Reddit, Mastodon, Bluesky, Kick, Rumble.
- **Description expand:** The V-chevron description toggle on links (already implemented).
- **Footer:** Privacy policy + Terms links (to be created as static Worker routes at `cnxt.to/privacy` and `cnxt.to/terms`).
- **Theme colors:** Custom accent/bg/text colors (roadmap item) should work within any template.
- **SEO meta tags:** Already implemented, shared across templates.

---

## Implementation Plan

1. Add a `template` field to `ProfileSchema` (e.g. `"minimal" | "photo-forward" | "grid" | "classic"`, default `"minimal"`)
2. Add template selector to dashboard (dropdown or visual preview cards)
3. Refactor `render.ts` to dispatch to template-specific render functions
4. Build out each template incrementally — start with improving Minimal, then Classic, then Photo-Forward, then Grid
5. Expand `SOCIAL_ICONS` with comprehensive branded SVG icon set (shared across all templates)
6. Add privacy/terms static pages and footer links
