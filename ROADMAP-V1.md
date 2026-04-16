# Links by cnxt — V1 Development Roadmap

> Minimalistic, open-source alternative to Linktree & Stan Store.
> Built on Cloudflare (R2 + Workers + Pages + KV). Cheap, fast, scalable.

---

## Architecture Summary

```
Creator edits profile → Tiny API (Worker) → Writes JSON to R2
Visitor hits yourapp.com/username → Worker fetches JSON from R2 → Renders page (or serves pre-rendered HTML from CDN)
Click events → Batched writes to KV → Simple analytics
```

Each creator = **one JSON file** in R2. No database required for V1.

---

## Phase 0: Project Scaffolding

- [ ] Initialize monorepo structure (`/packages/worker`, `/packages/dashboard`, `/packages/shared`)
- [ ] Set up TypeScript + Wrangler (Cloudflare Workers CLI)
- [ ] Configure R2 bucket (`cnxt-profiles`) via `wrangler.toml`
- [ ] Configure KV namespace (`cnxt-analytics`) via `wrangler.toml`
- [ ] Set up local dev environment (`wrangler dev`)
- [ ] Define the creator JSON schema (`/packages/shared/schema.ts`)

---

## Phase 1: Creator JSON Schema & Storage

- [ ] Design V1 creator profile JSON schema:
  - `username` (slug, unique)
  - `displayName`
  - `bio`
  - `avatarUrl`
  - `theme` (preset string, e.g. `"minimal-dark"`, `"minimal-light"`)
  - `links[]` — array of `{ title, url, icon?, enabled }`
  - `socialLinks[]` — array of `{ platform, url }`
  - `createdAt`, `updatedAt`
- [ ] Write R2 helper: `putProfile(username, json)` → writes `profiles/{username}.json` to R2
- [ ] Write R2 helper: `getProfile(username)` → reads JSON from R2
- [ ] Add JSON schema validation (lightweight — Zod or manual)
- [ ] Write integration test: round-trip write/read of a profile

---

## Phase 2: Public Page Rendering (the core product)

- [ ] Create Worker route: `GET /:username`
- [ ] Worker logic: fetch `profiles/{username}.json` from R2 → render HTML
- [ ] Build server-side HTML renderer (plain string templates — no framework needed)
- [ ] Design 2–3 minimal themes (HTML + inline CSS, no JS required):
  - `minimal-light`
  - `minimal-dark`
  - `bold`
- [ ] Render social icons (inline SVGs for Twitter/X, Instagram, TikTok, YouTube, GitHub, etc.)
- [ ] Add `<meta>` tags for SEO + Open Graph (title, description, image)
- [ ] Handle 404 for unknown usernames
- [ ] Add `Cache-Control` headers (CDN caching, e.g. `s-maxage=60`)
- [ ] Test: verify page renders correctly from a fresh profile JSON

### Stretch: Static Pre-rendering (zero compute at runtime)
- [ ] On profile save, generate static HTML and write to R2 alongside the JSON
- [ ] Serve pre-rendered HTML directly — fall back to dynamic render if missing
- [ ] Invalidate/rebuild on profile update

---

## Phase 3: Tiny Profile API (edit profiles)

- [ ] Create Worker route: `POST /api/profile` — create profile
- [ ] Create Worker route: `PUT /api/profile/:username` — update profile
- [ ] Create Worker route: `GET /api/profile/:username` — get profile JSON (authenticated)
- [ ] Input validation + sanitization on all writes (prevent XSS in links/bio)
- [ ] Username validation: lowercase alphanumeric + hyphens, 3–30 chars
- [ ] Username uniqueness check (check R2 key existence)
- [ ] Reserve system slugs (`api`, `admin`, `dashboard`, `login`, `settings`, etc.)
- [ ] Rate limiting on write endpoints (Cloudflare rate limiting or simple KV counter)
- [ ] CORS configuration for dashboard origin

---

## Phase 4: Authentication (keep it minimal)

- [ ] Choose V1 auth strategy — recommended: **passwordless email magic links**
  - Alternative: OAuth (Google/GitHub) via Cloudflare Access or simple OAuth flow
- [ ] Implement magic link flow:
  - `POST /api/auth/send-link` → generate token, store in KV (TTL 15min), send email
  - `GET /api/auth/verify?token=xxx` → validate token, issue session
- [ ] Session management: signed JWT or opaque token stored in KV
- [ ] Middleware: auth guard on `/api/profile/*` write routes
- [ ] Email sending: Cloudflare Email Workers, Resend, or Mailgun (free tiers)
- [ ] Store minimal user record in KV or R2: `{ email, username, createdAt }`

---

## Phase 5: Creator Dashboard (frontend)

- [ ] Scaffold lightweight SPA (Preact, Solid, or plain vanilla JS — keep bundle tiny)
- [ ] Host on Cloudflare Pages (`dashboard.yourdomain.com` or `/dashboard` path)
- [ ] Login / magic link request screen
- [ ] Profile editor:
  - Display name, bio, avatar URL
  - Add / remove / reorder links (drag-and-drop optional in V1)
  - Toggle link enabled/disabled
  - Social links editor
  - Theme selector (visual preview)
- [ ] Live preview panel (shows what the public page looks like)
- [ ] Save button → calls `PUT /api/profile/:username`
- [ ] Basic form validation + error handling
- [ ] Mobile-responsive layout

---

## Phase 6: Analytics (cheap & simple)

- [ ] Create Worker route: `POST /api/event` — log a click event
- [ ] Event payload: `{ username, linkIndex, timestamp }`
- [ ] **Option A (V1 recommended):** Batch writes to KV
  - Key: `analytics:{username}:{date}` → value: `{ totalViews, clicks: { [linkIndex]: count } }`
  - Increment counters atomically (read-modify-write with KV)
- [ ] Add a tiny inline `<script>` to public pages: on link click, fire `POST /api/event` (or `navigator.sendBeacon`)
- [ ] Track page views: fire event on page load
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

1. **Phase 0** → scaffolding
2. **Phase 1** → JSON schema + R2 read/write
3. **Phase 2** → public page rendering ← *this is your "show it off" moment*
4. **Phase 3** → API for editing
5. **Phase 4** → auth
6. **Phase 5** → dashboard
7. **Phase 6** → analytics
8. **Phase 7–8** → custom domains + polish

After Phase 2, you have a working public demo. After Phase 5, you have a usable product.
