# cnxt to links — V1 Development Roadmap

> Minimalistic, open-source alternative to Linktree & Stan Store.
> Built on Cloudflare (R2 + Workers + Pages + KV). Cheap, fast, scalable.

---

## URL Architecture

### Public URLs (what creators share in bios)

| URL | Behavior |
|---|---|
| `cnxt.to/username` | Creator's **default view** — shows links page in V1. Later, creators can set this to contractor profile, hub page, etc. via `defaultView` preference. |
| `cnxt.to/username/links` | Always shows the links page explicitly |
| `cnxt.to/username/about` | (Future) Contractor profile |
| `cnxt.to/username/portfolio` | (Future) Portfolio page |

### App URLs (where creators edit)

| URL | What it is |
|---|---|
| `links.cnxt.to` | Standalone links editor/dashboard (Cloudflare Pages SPA) |
| `hire.cnxt.to` | (Future) Contractor profile editor |
| `app.cnxt.to` | (Future) Unified dashboard if needed |

### Why this structure works

- `cnxt.to/jd` is **10 characters** — shorter than `linktr.ee/jd`. No wasted URL real estate.
- `cnxt.to/jd/links` reads like a sentence — permanent, explicit URL that works even when default view changes.
- **Editor is separate** from public pages — `links.cnxt.to` is its own deploy with its own release cycle. The public Worker on `cnxt.to` stays lean.
- **Adding future products = adding paths** — `cnxt.to/jd/about`, `cnxt.to/jd/portfolio`, etc. The `cnxt.to` Worker is a lightweight router.

### Technical mapping

| Domain | Infrastructure | Purpose |
|---|---|---|
| `cnxt.to/*` | Cloudflare Worker | Public page rendering + API |
| `links.cnxt.to` | Cloudflare Pages (SPA) | Links editor/dashboard |

---

## Architecture Summary

```
Creator edits profile → links.cnxt.to (SPA) → API on cnxt.to → Writes JSON to R2
Visitor hits cnxt.to/username → Worker fetches JSON from R2 → Renders page instantly
Click events → Batched writes to KV → Simple analytics
```

Each creator = **one JSON file** in R2. No database required for V1.

---

## Phase 0: Project Scaffolding

- [x] Set up TypeScript + Wrangler (Cloudflare Workers CLI)
- [x] Configure R2 bucket (`cnxt-profiles`) via `wrangler.toml`
- [x] Configure KV namespace (`cnxt-analytics`) via `wrangler.toml`
- [x] Set up local dev environment (`wrangler dev`)
- [x] Define the creator JSON schema (`src/schema.ts`)
- [x] Deploy Worker to Cloudflare
- [x] Configure `cnxt.to` and `links.cnxt.to` custom domain routes

---

## Phase 1: Creator JSON Schema & Storage

- [x] Design V1 creator profile JSON schema (Zod-validated):
  - `username` (slug, unique)
  - `displayName`
  - `bio`
  - `avatarUrl`
  - `theme` (preset string, e.g. `"minimal-dark"`, `"minimal-light"`)
  - `links[]` — array of `{ title, url, icon?, enabled }`
  - `socialLinks[]` — array of `{ platform, url }`
  - `createdAt`, `updatedAt`
- [x] Add `defaultView` field to schema (controls what `cnxt.to/username` displays)
- [x] Write R2 helper: `putProfile(username, json)` → writes `profiles/{username}.json` to R2
- [x] Write R2 helper: `getProfile(username)` → reads JSON from R2
- [x] Add JSON schema validation (Zod)
- [ ] Write integration test: round-trip write/read of a profile

---

## Phase 2: Public Page Rendering (the core product)

- [x] Create Worker route: `GET /:username`
- [x] Add Worker route: `GET /:username/links` (explicit links path)
- [x] Worker logic: fetch `profiles/{username}.json` from R2 → render HTML
- [x] Build server-side HTML renderer (plain string templates — no framework needed)
- [x] Design 2–3 minimal themes (HTML + inline CSS, no JS required):
  - `minimal-light`
  - `minimal-dark`
  - `bold`
- [x] Render social icons (inline SVGs for Twitter/X, Instagram, TikTok, YouTube, GitHub, etc.)
- [x] Add `<meta>` tags for SEO + Open Graph (title, description, image)
- [x] Handle 404 for unknown usernames
- [x] Add `Cache-Control` headers (CDN caching, e.g. `s-maxage=60`)
- [x] Test: verify page renders correctly from a fresh profile JSON

### Stretch: Static Pre-rendering (zero compute at runtime)
- [ ] On profile save, generate static HTML and write to R2 alongside the JSON
- [ ] Serve pre-rendered HTML directly — fall back to dynamic render if missing
- [ ] Invalidate/rebuild on profile update

---

## Phase 3: Tiny Profile API (edit profiles)

- [x] Create Worker route: `POST /api/profile` — create profile
- [x] Create Worker route: `PUT /api/profile/:username` — update profile
- [x] Create Worker route: `GET /api/profile/:username` — get profile JSON (authenticated)
- [x] Input validation + sanitization on all writes (prevent XSS in links/bio)
- [x] Username validation: lowercase alphanumeric + hyphens, 3–30 chars
- [x] Username uniqueness check (check R2 key existence)
- [x] Reserve system slugs (`api`, `admin`, `dashboard`, `login`, `settings`, etc.)
- [ ] Rate limiting on write endpoints (Cloudflare rate limiting or simple KV counter)
- [x] CORS configuration for `links.cnxt.to` dashboard origin

---

## Phase 4: Authentication (keep it minimal)

- [x] Choose V1 auth strategy — recommended: **passwordless email magic links**
  - Alternative: OAuth (Google/GitHub) via Cloudflare Access or simple OAuth flow
- [x] Implement magic link flow:
  - `POST /api/auth/send-link` → generate token, store in KV (TTL 15min), send email
  - `GET /api/auth/verify?token=xxx` → validate token, issue session
- [x] Session management: signed JWT or opaque token stored in KV
- [x] Middleware: auth guard on `/api/profile/*` write routes
- [x] Email sending: Cloudflare Email Workers, Resend, or Mailgun (free tiers)
- [x] Store minimal user record in KV or R2: `{ email, username, createdAt }`
- [ ] **Future: Migrate to [Better Auth](https://www.better-auth.com/)** when adding mobile app or social login (Google/Apple/GitHub). Current magic link system is sufficient for web launch.

---

## Phase 5: Creator Dashboard at `links.cnxt.to` (frontend)

- [x] Scaffold lightweight SPA (Preact, Solid, or plain vanilla JS — keep bundle tiny)
- [x] Host on Cloudflare Pages at `links.cnxt.to`
- [x] **Landing page**: explain what cnxt to links is, "claim your link" CTA, open source pitch
- [x] Login / magic link request screen
- [x] **Signup flow**: claim a username → create profile → redirect to editor
- [x] Profile editor:
  - Display name, bio, avatar URL
  - Add / remove / reorder links (drag-and-drop optional in V1)
  - Toggle link enabled/disabled
  - Social links editor
  - Theme selector (visual preview)
- [ ] Live preview panel (shows what the public page looks like)
- [x] Save button → calls `PUT /api/profile/:username`
- [x] Show creator's public URL: `cnxt.to/username` (with copy button)
- [x] Basic form validation + error handling
- [ ] Mobile-responsive layout

---

## Phase 6: Analytics (cheap & simple)

- [x] Create Worker route: `POST /api/event` — log a click event
- [x] Event payload: `{ username, linkIndex, timestamp }`
- [x] **Option A (V1 recommended):** Batch writes to KV
  - Increment counters atomically (read-modify-write with KV)
- [x] Add a tiny inline `<script>` to public pages: on link click, fire `POST /api/event` (via `navigator.sendBeacon`)
- [x] Track page views: fire event on page load
- [ ] Dashboard: simple analytics view (views + clicks per link, last 7/30 days)
- [ ] Rate limit event endpoint to prevent abuse

### Future (not V1):
- [ ] Option B: Cloudflare Logpush for richer analytics without custom code
- [ ] Click-through graphs / charts in dashboard

---

## Phase 7: Custom Domains (nice-to-have for V1)

- [ ] Allow creators to CNAME their own domain to the app
- [ ] Store domain → username mapping in KV (`domains:{domain}` → `username`)
- [ ] Worker checks `Host` header → resolve username → serve page
- [ ] Cloudflare for SaaS (SSL for custom domains) or document manual setup
- [ ] Dashboard UI: "Add custom domain" with DNS instructions

---

## Phase 8: Polish & Launch Prep

- [ ] Favicon + branding for default pages
- [ ] "Powered by cnxt" footer link (optional, removable for paid tier later)
- [ ] Error pages (404, 500) with branding
- [ ] README.md with setup instructions (self-hosting guide)
- [ ] `wrangler.toml` example config for self-hosters
- [ ] One-click deploy button (Deploy to Cloudflare Workers)
- [ ] LICENSE file (MIT or similar)
- [ ] Landing page: explain what cnxt is, open source pitch, "claim your link" CTA
- [ ] Write CONTRIBUTING.md

---

## Out of Scope for V1 (Backlog)

- [ ] Payments / tipping (Stan Store parity)
- [ ] Email capture / newsletter integration
- [ ] A/B testing on link order
- [ ] Team / multi-user accounts
- [ ] Custom CSS / advanced theming
- [ ] Image upload (use external URLs for V1)
- [ ] Postgres / D1 migration (only if KV + R2 limits become an issue)
- [ ] Self-hosted Docker alternative
- [ ] **Research social platform API costs** — Document pricing, rate limits, and terms for: Facebook, Instagram, TikTok, X (Twitter), LinkedIn, and Bluesky APIs. Feeds into social posting feature and metered billing model (see BILLING.md).

---

## Cost Estimate (Cloudflare Free Tier)

| Resource | Free Tier | V1 Usage |
|---|---|---|
| Workers | 100K req/day | Profile reads + API |
| R2 | 10GB storage, 10M reads/mo | JSON files (~1KB each = millions of profiles) |
| KV | 100K reads/day, 1K writes/day | Auth tokens + analytics counters |
| Pages | Unlimited sites, 500 builds/mo | Dashboard hosting |

**Bottom line:** A creator platform serving thousands of users for **$0/month** is realistic on the free tier.

---

## Suggested Build Order (shortest path to demo)

1. ~~**Phase 0** → scaffolding~~ ✅
2. ~~**Phase 1** → JSON schema + R2 read/write~~ ✅
3. ~~**Phase 2** → public page rendering~~ ✅ (live at `links-by-cnxt.workers.dev`)
4. ~~**Phase 3** → API for editing~~ ✅ (profile CRUD working)
5. **Phase 5** → dashboard at `links.cnxt.to` ← **we are here**
6. **Phase 4** → auth (magic links)
7. **Phase 6** → analytics dashboard
8. **Phase 7–8** → custom domains + polish

After Phase 5, creators can sign up, build their page, and share `cnxt.to/username`.
