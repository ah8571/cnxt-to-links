# Competitive Analysis — cnxt to links

## The Market

The "link-in-bio" space has exploded into a multi-hundred-million dollar market. What started as simple link aggregators have evolved into full creator platforms with monetization, email capture, analytics, scheduling, and eCommerce. Most charge $6–$30+/month for features that should be table stakes.

**cnxt to links** is positioned as the **open-source, self-hostable, free-for-most-users** alternative. We don't need to beat every feature — we need to nail the core use case and offer something none of them do: **full data ownership**.

---

## Competitor Breakdown

### 1. Linktree

**The incumbent.** 70M+ users. The name people know.

| Plan | Price | Key Differentiators |
|------|-------|---------------------|
| Free | $0 | Unlimited links, social icons, basic analytics, QR code, digital product sales (12% fee) |
| Starter | $6/mo | Custom themes, email/phone collection, redirect links, social scheduling (10 posts/mo) |
| Pro | $12/mo | Custom logo, animated links, comprehensive analytics, email integrations (Mailchimp, Kit, Klaviyo), link shortener, Instagram auto-reply (1.5k/mo), 50 social posts/mo |
| Premium | $30/mo | 0% seller fees, unlimited IG auto-replies, unlimited social posts, concierge onboarding, 4hr support, admin/team tools |

**Feature inventory:**
- Link types: standard, header, spotlight/featured, scheduled, locked (age/code/NFT), redirect
- Embeds: YouTube, TikTok, Instagram, Twitch, Vimeo, Spotify, Apple Music, SoundCloud
- Monetization: digital products, courses (Kajabi-powered), Linktree Shops, sponsored links, affiliate commissions, Shopify/Spring/Bonfire integrations
- Email/SMS collection with integrations (Mailchimp, Google Sheets, Kit, Klaviyo, Zapier)
- Analytics: clicks, CTR, referrer, location, device, social icons, conversion tracking, data export, custom date ranges
- SEO settings, UTM parameters, Facebook Conversion API, Google Analytics
- Social media scheduling + AI content tools
- Instagram auto-reply (DM automation)
- Custom domains (Premium only)
- Team management: admins, custom T&Cs, MFA

**What they paywall:**
- Custom themes/colors → Starter ($6)
- Email collection → Starter ($6)
- Detailed analytics (location, device, referrer) → Pro ($12)
- Hide Linktree footer → Pro ($12)
- Email integrations → Pro ($12)
- Custom domain → Premium ($30)
- 0% seller fees → Premium ($30)

**Weaknesses:**
- Heavy branding on free tier (Linktree footer, no custom themes)
- 12% fee on digital product sales on free tier
- No self-hosting option — you're locked into their platform
- Analytics locked behind expensive tiers
- Increasingly bloated — social scheduling, AI credits, IG auto-reply feel bolted on

---

### 2. Stan Store

**The creator-commerce play.** Focused on selling, not just linking.

| Plan | Price | Key Differentiators |
|------|-------|---------------------|
| Creator | $29/mo | Link-in-bio page, digital products, courses, 1-on-1 bookings/calendar, email funnels, payment processing |
| Creator Pro | $99/mo | Upsells, order bumps, affiliate program, email sequences, advanced analytics, priority support |

**Feature inventory:**
- Link-in-bio landing page with embedded store
- Digital product sales (eBooks, templates, downloads)
- Course builder (modules, drip content)
- Calendar/booking integration (1-on-1 calls, coaching)
- Email list building with opt-in forms
- Sales funnels with upsells and order bumps (Pro)
- Affiliate program management (Pro)
- Payment processing (Stripe integration)
- Email broadcast sequences (Pro)
- Mobile-optimized checkout
- Custom domains
- Analytics dashboard

**What makes Stan different:**
- It's less "link-in-bio" and more "Shopify for creators"
- All-in-one: replaces Gumroad + Calendly + ConvertKit for small creators
- Direct checkout — followers buy without leaving the page

**Weaknesses:**
- Expensive ($29/mo minimum, $99/mo for real features)
- Not open source, no self-hosting
- Locked ecosystem — migrating away is painful
- No free tier at all
- Transaction fees on top of subscription

---

### 3. Beacons.ai

**The free-tier king.** Generous free plan, aimed at creators.

| Plan | Price | Key Differentiators |
|------|-------|---------------------|
| Free | $0 | Link-in-bio, digital storefront, media kit builder, invoicing, email collection, donations, TikTok product feeds |
| Entrepreneur | $10/mo | Custom domain, priority support, advanced analytics, marketing integrations, email/SMS via Zapier |

**Feature inventory:**
- Link-in-bio with rich customization
- Digital storefront (sell products directly)
- Media kit builder (for brand deals)
- Invoicing tool (for freelancers)
- Email/phone number collection
- Donation/tip jar
- TikTok product feed integration
- Referral program
- Custom domains (paid)
- Analytics and tracking

**Strengths:**
- Very generous free tier — more features free than Linktree Pro
- Media kit builder is unique and useful for influencers
- Invoicing built in (replaces a separate tool)

**Weaknesses:**
- Not open source
- Can feel cluttered — tries to do too much
- Smaller brand recognition vs Linktree


---

### 5. Later (Linkin.bio)

**Social media management platform** with link-in-bio as a feature.

| Plan | Price | Key Differentiators |
|------|-------|---------------------|
| Starter | $18.75/mo | 30 posts/profile, basic analytics (3 months), link-in-bio, 1 social set |
| Growth | $37.50/mo | 180 posts, 1yr analytics, social inbox, collab tools, UGC collection |
| Scale | $82.50/mo | Unlimited posts, 2yr analytics, competitive benchmarking, brand monitoring |

**Strengths:**
- Deeply integrated with social scheduling
- Up to 5 links per IG post
- Shopify integration for eCommerce
- Strong analytics tied to social performance

**Weaknesses:**
- Very expensive for just link-in-bio
- Really a social media management tool that includes link-in-bio
- No free tier
- Overkill for someone who just wants a link page

---

### 6. Other Notable Competitors

| Tool | Price | Niche |
|------|-------|-------|
| **Lnk.Bio** | Free / $0.99/mo / $24.99 one-time | Budget-friendly, one-time pricing option |
| **Bio.fm** | Free | Auto-embeds latest posts, email collection, polls, video embeds |
| **Campsite.bio** | Free / $7/mo / $24/mo | Clean UI, good analytics on Pro+, drag-and-drop |
| **ContactInBio** | Free / $4.55/mo / $18.20/mo | Video, image carousels, payment links, Google Analytics |
| **Milkshake** | Free | Mobile-first app (iPhone/Android), swipeable "card" pages |
| **Tap Bio** | Free / $5/mo / $12/mo | Card-based layout, Instagram-focused |
| **Koji** | Free | App-powered link-in-bio, mini-apps, tipping, games |
| **Shorby** | $12/mo+ | Smart pages, messenger links, retargeting pixels |
**link.me**
---

## Feature Gap Analysis — cnxt to links

### What We Already Have (v1)
- [x] Unlimited links
- [x] Social icons
- [x] 3 themes (light, dark, bold)
- [x] Photo upload (avatar)
- [x] Bio / display name
- [x] Basic click + view analytics
- [x] SEO meta tags (og:title, og:description, og:image)
- [x] QR code (easy to add)
- [x] Magic link auth (no passwords)
- [x] Edge-deployed (Cloudflare Workers — fast globally)
- [x] Open source (GNU licensed)
- [x] Self-hostable
- [x] No branding forced on users
- [x] Free

### High-Priority Features to Add (Free Tier)

These are features that competitors paywall but we can offer free:

| Feature | Competitors Charge | Effort | Impact |
|---------|-------------------|--------|--------|
| **Custom themes / colors** | Linktree $6/mo | Medium | High — instant differentiation |
| **Email collection** (simple list) | Linktree $6/mo, Beacons free | Medium | High — creators need this |
| **Link scheduling** (show/hide by date) | Linktree $6/mo | Low | Medium |
| **Link thumbnails / icons** | Linktree $12/mo | Low | Medium |
| **Detailed analytics** (referrer, device, location) | Linktree $12/mo | Medium | High |
| **Analytics data export** (CSV) | Linktree $30/mo | Low | Medium |
| **Custom domains** | Linktree $30/mo, Beacons $10/mo | Medium | Very High — huge differentiator if free |
| **Video / music embeds** | Linktree free (limited) | Medium | Medium |
| **Hide platform branding** | Linktree $12/mo, Carrd $9/yr | Already done | High (we already don't force it) |
| **Contact form** | Carrd $19/yr | Low | Medium |

### Medium-Priority Features (Differentiation)

| Feature | Why | Effort |
|---------|-----|--------|
| **Digital product sales** (simple file downloads) | Stan charges $29/mo for this. Even a basic version is powerful. | High |
| **Tip jar / donations** | Beacons has this free. Stripe integration. | Medium |
| **Newsletter integration** (Mailchimp, Kit, Buttondown) | Linktree $12/mo. Webhook-based could be simpler. | Medium |
| **Multi-page support** (links / about / portfolio tabs) | Schema already supports defaultView. Expand it. | Medium |
| **Custom CSS / advanced theming** | For power users. No competitor offers this at all. | Low |
| **Drag-and-drop link reordering** | UX improvement. Everyone has this. | Medium |
| **Link groups / sections** | Organize links by category | Low |
| **QR code generator** (built into dashboard) | Linktree free tier has this | Low |

### Future / Ambitious Features

| Feature | Why | Effort |
|---------|-----|--------|
| **Course builder** | Stan charges $29–99/mo. Even a basic markdown-based course would be killer. | Very High |
| **Calendar / booking** | Stan's $29/mo feature. Integrate with Cal.com (open source). | High |
| **API / webhooks** | Let developers build on top. No competitor does this well. | Medium |
| **Import from Linktree** | Migration tool. JSON import of existing link pages. | Medium |
| **White-label / agency mode** | Let agencies manage multiple creators | High |
| **A/B testing links** | Show different link titles/order to different visitors | High |
| **Geolocation routing** | Show different links based on visitor location (e.g., regional store links) | Medium |
| **Self-host one-click deploy** | Cloudflare Workers deploy button, Docker image, Vercel template | Medium |

---

## Our Competitive Positioning

### Why cnxt to links wins

| Advantage | Details |
|-----------|---------|
| **Truly free** | No "free tier with catch." Features others charge $12–30/mo for. |
| **Open source** | GNU licensed. Fork it, modify it, self-host it. No lock-in ever. |
| **Own your data** | R2 storage you control. Export anytime. No platform risk. |
| **Fast** | Cloudflare edge network. Sub-50ms globally. Competitors are 200ms+. |
| **No branding** | No "Made with cnxt to" forced on anyone. |
| **Privacy-first** | No cookies, no third-party tracking, no selling user data. |
| **Simple** | Not trying to be a social media scheduler or IG auto-reply bot. |

### Where we're NOT competing (intentionally)

- Social media scheduling → Not our lane. Use Buffer/Later.
- Instagram auto-replies → Platform-specific gimmick.
- AI content generation → Commodity feature, not a differentiator.
- Full eCommerce store → Use Shopify. We do simple digital downloads.

### Target users

1. **Privacy-conscious creators** who don't trust centralised platforms
2. **Developers / technical creators** who want self-hosting and customization
3. **Budget-conscious creators** who can't afford $12-30/mo for basic features
4. **Open source advocates** who prefer transparent, community-driven tools
5. **International creators** where $12/mo USD is a significant amount

---

## Implementation Roadmap (Priority Order)

### Phase 1 — Catch Up (make free what others charge for)
1. Custom theme colors (user picks accent, bg, text colors)
2. Link thumbnails/icons (upload or emoji)
3. Link scheduling (start/end dates)
4. Detailed analytics (referrer, device, country via CF headers)
5. Analytics CSV export
6. QR code in dashboard
7. Drag-and-drop link reordering

### Phase 2 — Differentiate
8. Email collection (simple subscriber list with CSV export)
9. Custom domains (CNAME setup guide + Worker routing)
10. Contact form
11. Link groups / section headers
12. Custom CSS injection (for power users)
13. Import from Linktree (JSON parser)

### Phase 3 — Monetization Features
14. Tip jar (Stripe Connect)
15. Simple digital product sales (file upload + Stripe checkout)
16. Newsletter integrations (webhook to Mailchimp/Kit/Buttondown)

### Phase 4 — Platform
17. Public API + webhooks
18. Self-host deploy templates (CF Workers, Docker, Vercel)
19. Multi-page (portfolio/about tabs)
20. A/B testing
21. Calendar integration (Cal.com embed)

---

## Revenue Model (how we sustain "free for most users")

Since we're GNU licensed and free for most users, potential revenue:

| Tier | Price | What's Included |
|------|-------|-----------------|
| **Free** | $0 | Everything above through Phase 2. Unlimited links, full analytics, custom themes, email collection. |
| **Pro** | ~$5/mo | Custom domains, digital product sales (0% fee), priority support, early access to new features |
| **Self-Host** | $0 | Deploy your own. Full control. Community support only. |

The key: **never paywall features that are free elsewhere.** Only charge for genuinely premium infrastructure (custom domains cost us money) and commerce features (payment processing has real costs).

---

## Deep Dive: What They Charge For vs. What It Actually Costs

This is the core thesis of cnxt to links. Most "premium" features in the link-in-bio space are **artificially paywalled**. The actual infrastructure cost to provide them is pennies — or literally zero on Cloudflare's free/cheap tiers. Here's the breakdown:

---

### TIER 1: Features That Cost Literally $0 to Provide

These are pure software features. No infrastructure cost. Competitors charge for them purely because they can.

| Feature | Who Charges | What They Charge | Real Cost | How We Do It Free |
|---------|-------------|------------------|-----------|-------------------|
| **Custom theme colors** (pick your own accent, background, text) | Linktree Starter | **$6/mo ($72/yr)** | $0 — it's CSS variables | Store 3 hex values in the profile JSON. Render them inline. Already have the theme system. |
| **Custom fonts** | Linktree Pro | **$12/mo ($144/yr)** | $0 — Google Fonts is free | Add a `fontFamily` field. Load from Google Fonts CDN in the rendered page. Zero bandwidth cost to us. |
| **Hide platform branding** | Linktree Pro | **$12/mo ($144/yr)** | $0 | We already don't show branding. Footer is optional. Literally nothing to implement. |
| **Link scheduling** (show/hide links by date) | Linktree Starter | **$6/mo ($72/yr)** | $0 — date comparison in JS | Add `startDate`/`endDate` to LinkSchema. Filter at render time. Same CPU cost as rendering normally. |
| **Featured / spotlight links** | Linktree Pro | **$12/mo ($144/yr)** | $0 — CSS styling | Add a `featured: boolean` to LinkSchema. Render with larger/highlighted style. |
| **Animated links** | Linktree Pro | **$12/mo ($144/yr)** | $0 — CSS animations | A few CSS keyframe animations. Stored as a setting. |
| **Link thumbnails / icons** | Linktree Pro | **$12/mo ($144/yr)** | ~$0 — tiny images in R2 | Upload small icon per link to R2. We already have avatar upload infrastructure. Cost: fractions of a penny. |
| **Link groups / section headers** | Linktree (all tiers have basic) | Locked customization | $0 | Add a `type: "link" | "header"` field. Render headers differently. |
| **SEO settings** (custom title, meta description) | Linktree Pro | **$12/mo ($144/yr)** | $0 — HTML meta tags | We already render og:title, og:description. Just let users edit them in dashboard. |
| **UTM parameters** (auto-append to links) | Linktree Pro | **$12/mo ($144/yr)** | $0 — string concatenation | Append `?utm_source=cnxt&utm_medium=linkinbio` to outbound links. Zero cost. |
| **QR code generation** | Linktree Free (but limited) | $0 but upsells | $0 — client-side JS library | Use `qrcode.js` (4KB). Generate in browser. No server cost. |
| **Drag-and-drop reordering** | Most competitors | Table stakes | $0 — frontend JS | Use SortableJS or native drag API. Reorder the array, save. |
| **Social icon analytics** | Linktree Pro | **$12/mo ($144/yr)** | $0 — same click tracking | We already track link clicks. Add same tracking to social icons. Same KV write. |
| **Custom button styles** (rounded, sharp, outline, fill) | Linktree Pro | **$12/mo ($144/yr)** | $0 — CSS border-radius | Store button style preference. Apply via CSS class. |
| **Video profile image** | Linktree Pro | **$12/mo** | ~$0.01/user — short video in R2 | Upload a small video loop. Render as `<video>` tag instead of `<img>`. R2 cost negligible. |

**Total annual revenue Linktree extracts from these $0-cost features: $72–$360/yr per user.**

---

### TIER 2: Features That Cost Pennies to Provide

These involve real infrastructure but the per-user cost is trivially small on Cloudflare.

| Feature | Who Charges | What They Charge | Real Cost (per user/mo) | How We Do It Free |
|---------|-------------|------------------|------------------------|-------------------|
| **Detailed analytics** (referrer, device, country) | Linktree Pro | **$12/mo** | **$0** — Cloudflare gives us this in request headers: `CF-IPCountry`, `User-Agent` | Parse CF headers on each page view. Store in KV: `views:{user}:{date}:{country}`. No extra API calls. |
| **Analytics date ranges** (custom) | Linktree Pro: 90 days. Premium: all time | **$12–30/mo** | **~$0.005/mo** — KV reads | We already store daily analytics keys. Query by date prefix. KV reads are $0.50/million. A user checking analytics costs ~$0.001. |
| **Analytics CSV export** | Linktree Premium | **$30/mo ($360/yr)** | **$0** — client-side | Read KV data, format as CSV string, trigger browser download. Zero server cost. |
| **Email collection** (subscriber list) | Linktree Starter | **$6/mo ($72/yr)** | **~$0.01/mo** — KV writes | Store emails in KV: `subscribers:{username}:{email}`. KV writes are $5/million. A creator getting 100 subs/mo = $0.0005. |
| **Email list CSV export** | Linktree Starter | **$6/mo** | **$0** — same as analytics export | List KV keys with prefix, format as CSV. Client-side download. |
| **Redirect links** (temporarily send all traffic to one link) | Linktree Starter | **$6/mo** | **$0** — conditional in Worker | Add a `redirectUrl` field to profile. If set, return 302 redirect instead of rendering page. |
| **Conversion tracking** | Linktree Pro | **$12/mo** | **~$0.01/mo** | Track click-throughs to specific links. We already have click tracking. Add a "conversion" event type. |
| **Contact form** | Carrd Pro | **$19/yr** | **~$0.01/mo** — KV write + optional email | Store submissions in KV. Optional webhook to email. Resend is already integrated. |
| **Link click-through rate** | Linktree Pro | **$12/mo** | **$0** — math | `CTR = clicks / views`. We already have both numbers. Division is free. |
| **Video / music embeds** (YouTube, Spotify) | Linktree Free (limited) | Free but upsold | **$0** — iframe | Store embed URL. Render as `<iframe>`. YouTube/Spotify serve the bandwidth, not us. |
| **Location-based analytics** (top countries) | Linktree Pro: top 10. Premium: full | **$12–30/mo** | **$0** — `CF-IPCountry` header | Cloudflare literally sends us the country code on every request. We just need to store it. |
| **Device-based analytics** | Linktree Pro | **$12/mo** | **$0** — User-Agent parsing | Parse `User-Agent` header (mobile/desktop/tablet). Store alongside view data. |
| **Referrer-based analytics** | Linktree Pro | **$12/mo** | **$0** — `Referer` header | Standard HTTP header. Parse and store. Know if traffic comes from Instagram, Twitter, Google, etc. |

**Cloudflare free tier limits (what we get for $0):**
- Workers: 100,000 requests/day (free), then $0.50/million
- KV: 100,000 reads/day, 1,000 writes/day (free)
- R2: 10GB storage free, then $0.015/GB/mo. No egress fees ever.
- No bandwidth charges on Workers.

**For a typical creator with 1,000 page views/day, our infrastructure cost is literally $0/mo.** Even at 10,000 views/day we'd be well within free tier. A creator would need 100,000+ daily views before we'd pay anything — and that would be ~$0.50/day.

---

### TIER 3: Features With Real (But Small) Costs

These features have genuine infrastructure or third-party costs, but are still dramatically cheaper than what competitors charge.

| Feature | Who Charges | What They Charge | Real Cost | How We Could Handle It |
|---------|-------------|------------------|-----------|----------------------|
| **Custom domains** | Linktree Premium | **$30/mo ($360/yr)** | **~$0.10/mo** per domain — Cloudflare for SaaS (custom hostname) or free with CNAME + Worker route | Cloudflare for SaaS: $0.10/active hostname after the first 100. Or: user points CNAME to us, Worker checks `Host` header. Could offer free for all users and it costs us pennies. |
| **Email integrations** (Mailchimp, Kit, Klaviyo sync) | Linktree Pro | **$12/mo** | **$0** — outbound HTTP POST | When we collect a subscriber email, fire a webhook to Mailchimp/Kit API. It's one HTTP request. The user provides their own API key. Zero cost to us. |
| **Digital product sales** (file downloads) | Stan Store | **$29–99/mo** | **~$0.01–0.10/sale** — R2 storage + Stripe fees (2.9% + $0.30, paid by buyer) | Upload file to R2. On purchase, generate signed URL. Stripe handles payment. We never touch money — Stripe pays the creator directly. Our cost: R2 storage (pennies) + one KV write per sale. |
| **Tip jar / donations** | Beacons Free, Stan $29/mo | $0–$29/mo | **$0 from us** — Stripe fee on transaction (paid by donor/buyer) | Embed Stripe payment link or use Stripe Checkout. Creator connects their own Stripe account. We just render the button. |
| **Newsletter delivery** (actually sending emails) | ConvertKit $15/mo+, Mailchimp $13/mo+ | $13–300/mo | **$0.40/1,000 emails** via Resend (which we already use) | We already have Resend integrated for magic links. Same API. But: this is genuinely expensive at scale. Better approach: collect emails (free), let creators export to their email tool of choice. |
| **Course hosting** (video-heavy) | Stan Store | **$29–99/mo** | **R2 storage: $0.015/GB/mo**, no egress | A 10-video course (~5GB) costs us $0.075/mo to host. Cloudflare R2 has zero egress fees. Stan charges $348–1,188/yr for this. |
| **Calendar / booking** | Stan Store | **$29/mo** | **$0** — embed Cal.com (open source) | Cal.com is open source and has a free hosted tier. We just embed their widget. Or integrate their API. |
| **Google Analytics integration** | Linktree/Carrd Pro | **$12/mo / $49/yr** | **$0** — inject GA snippet | User gives us their GA measurement ID. We add `<script>` tag to their rendered page. Zero cost. Linktree charges $12/mo for this. |
| **Facebook Conversion API** | Linktree Pro | **$12/mo** | **$0** — outbound HTTP POST | On page view / link click, POST event to Facebook's API. User provides their pixel ID. One HTTP call. |

---

### TIER 4: The Real Math — What Would 10,000 Users Cost Us?

Let's model actual Cloudflare costs for 10,000 active creators:

| Resource | Usage Estimate | Monthly Cost |
|----------|---------------|--------------|
| **Workers requests** | 10K users × 500 views/day × 30 = 150M requests | $75 ($0.50/million after free 3M/mo on paid plan) |
| **KV reads** | Analytics + sessions: ~200M reads/mo | $100 ($0.50/million) |
| **KV writes** | Analytics + signups: ~20M writes/mo | $100 ($5/million) |
| **R2 storage** | Profiles + avatars: ~5GB | $0.075 |
| **R2 reads** | Avatar images: ~50M reads/mo | $18 ($0.36/million Class B) |
| **Resend emails** | Magic links: ~50K/mo | $20 (first 3K free, then $0.40/1K) |
| **Domain (cnxt.to)** | Annual | ~$2/mo amortized |
| **Workers Paid plan** | Required at this scale | $5/mo |
| **Total** | | **~$320/mo** |

That's **$0.032/user/month** to run the entire platform. Linktree charges $6–30/user/month.

Even if only 5% of users (500) paid $5/mo for a Pro tier, that's **$2,500/mo revenue** against **$320/mo costs**. The unit economics are absurd in our favor because Cloudflare's pricing is designed for this exact use case.

---

### What This Means Strategically

The link-in-bio market is built on **artificial scarcity**. Linktree's marginal cost per user is probably similar to ours — pennies. They charge $6–30/mo because:

1. **They were first** and set the pricing anchor
2. **Creators don't know** these features are cheap to provide
3. **Investors demand revenue growth** — Linktree raised $170M+ in funding, so they need to extract value
4. **Lock-in** — once your page is set up, switching costs feel high (they're not)

**Our opportunity:** Be the tool that treats creators with respect. Give away what costs nothing. Charge only for what has real costs. Be transparent about it.

| What Competitors Sell | Annual Price | What It Actually Costs | cnxt to links |
|----------------------|-------------|----------------------|---------------|
| Custom colors | $72/yr | $0 | **Free** |
| Email collection | $72/yr | $0.006/yr | **Free** |
| Detailed analytics | $144/yr | $0 | **Free** |
| Hide branding | $144/yr | $0 | **Free** (never added) |
| Analytics export | $360/yr | $0 | **Free** |
| Custom fonts | $144/yr | $0 | **Free** |
| Link scheduling | $72/yr | $0 | **Free** |
| SEO settings | $144/yr | $0 | **Free** |
| Email integrations | $144/yr | $0 | **Free** |
| Custom domain | $360/yr | $1.20/yr | **Free or ~$5/mo** |
| Digital product sales | $348–1,188/yr | Stripe fees only | **Free (Stripe fees pass-through)** |
| Course hosting | $348–1,188/yr | $0.90/yr (for 5GB) | **Free** |
| **Total if you used all features** | **$1,152–$3,252/yr** | **< $5/yr** | **$0–60/yr** |

A creator paying Linktree Pro ($12/mo) is paying **$144/year for features that cost $0–$2/year to provide.** That's the gap we exploit.
