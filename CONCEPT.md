# cnxt to links — Concept

## What It Is

**cnxt to links** is a free, open-source alternative to Linktree and Stan Store. It gives creators a clean, fast "link-in-bio" page — the single URL they drop in their Instagram, TikTok, YouTube, or X bio that points followers to everything they do.

The difference: **no monthly fees**, no platform lock-in, and full ownership of your data.

## The Problem

Linktree charges $5–24/month. Stan Store charges $29/month. Both are doing something remarkably simple under the hood — serving a single page with a list of links. Creators are paying recurring subscriptions for what amounts to a styled JSON file behind a CDN.

Most creators — especially smaller ones just getting started — don't need landing page builders, payment processing, or email funnels. They need a clean page with their links on it, and maybe some click analytics. That's it.

## The Insight

A creator's profile page is just data:

```json
{
  "username": "jd",
  "displayName": "Jane Doe",
  "bio": "Designer & content creator",
  "links": [
    { "title": "My Portfolio", "url": "https://janedoe.design" },
    { "title": "YouTube", "url": "https://youtube.com/@janedoe" },
    { "title": "Book a Call", "url": "https://cal.com/janedoe" }
  ]
}
```

That's a 200-byte JSON file. You don't need a database. You don't need a backend framework. You don't need auth-heavy infrastructure. You store a JSON file, serve it through a CDN, and render a page. Done.

## How It Works

```
Creator edits profile → API writes JSON to cloud storage
Visitor hits cnxt.link/jd → Edge fetches JSON → Renders page instantly
```

1. **Each creator = one JSON file** stored in object storage (Cloudflare R2).
2. **Public pages** are rendered at the edge (Cloudflare Workers) or pre-built as static HTML — either way, they load near-instantly worldwide.
3. **A tiny API** handles profile creation and edits. That's the entire backend.
4. **A simple dashboard** lets creators manage their links, bio, and theme.
5. **Analytics** are lightweight click counters — no third-party tracking, no cookies.

No databases. No complex infrastructure. No vendor dependencies beyond a single Cloudflare account (free tier).

## Core Features (V1)

| Feature | Description |
|---|---|
| **Link-in-bio page** | Clean, mobile-first public page at `cnxt.link/username` |
| **Creator dashboard** | Simple editor — manage links, bio, avatar, social profiles |
| **Themes** | A few built-in minimal themes (light, dark, bold) |
| **Social icons** | Auto-display icons for major platforms (X, IG, TikTok, YouTube, GitHub, etc.) |
| **Click analytics** | Per-link click counts + page views — simple, private, no cookies |
| **SEO & Open Graph** | Proper meta tags so shared links look good everywhere |
| **Custom domains** | Point your own domain at your cnxt page |
| **Self-hostable** | Open source — deploy to your own Cloudflare account for $0/month |

## What It's NOT (V1)

- Not a payment platform (no tipping, no digital product sales — yet)
- Not an email marketing tool
- Not a website builder
- Not trying to do everything — it does one thing well

## Pricing Philosophy

**Free for the vast majority of creators.** A link-in-bio page is tiny — the infrastructure cost to serve it is essentially zero. We're not going to charge people for something that costs us fractions of a penny.

For heavy-usage creators (high traffic, lots of analytics data, large media), there may be a minimal hosting fee to cover real infrastructure costs — but we're talking dollars, not $29/month.

Long-term, we'll also offer a **self-host option**: deploy to your own Cloudflare account and pay nothing at all, ever. Your data, your infrastructure, your rules.

## Who It's For

- **Small creators** who don't want to pay $5–29/month for a link page
- **Developers / technical creators** who want full control and self-hosting
- **Privacy-conscious users** who don't want invasive tracking on their link page
- **Anyone** who thinks Linktree is overpriced for what it does

## Why Open Source

1. **Trust** — creators can see exactly what the code does with their data.
2. **Free forever** — self-host on Cloudflare's free tier. No one can price you out.
3. **Community-driven** — themes, features, and integrations built by people who use it.
4. **No lock-in** — your data is a JSON file. Export it, move it, do whatever you want.

## Architecture at a Glance

| Layer | Technology | Cost (Free Tier) |
|---|---|---|
| Storage | Cloudflare R2 (JSON files per creator) | 10GB / 10M reads free |
| Backend | Cloudflare Workers (tiny API) | 100K requests/day free |
| Frontend | Cloudflare Pages (dashboard) | Unlimited free |
| CDN | Cloudflare (built-in) | Free |
| Analytics | Cloudflare KV (click counters) | 100K reads/day free |
| Auth | Magic links via KV tokens + email | Free |

**Total infrastructure cost for thousands of users: $0/month.**

## The Competitive Angle

| | Linktree Free | Linktree Pro | Stan Store | **cnxt** |
|---|---|---|---|---|
| Price | $0 | $5–24/mo | $29/mo | **$0 (self-host)** |
| Custom domains | No | Yes | Yes | **Yes** |
| Remove branding | No | Yes | Yes | **Yes** |
| Analytics | Basic | Full | Full | **Basic (V1)** |
| Themes | Limited | Full | Full | **Open themes** |
| Own your data | No | No | No | **Yes** |
| Open source | No | No | No | **Yes** |
| Payments | No | No | Yes | **Not yet** |

## Long-Term Vision

V1 is the Linktree replacement — free, fast, open. Future versions can layer in Stan Store–style features:

- **Digital product sales** (link to Gumroad/Stripe, or native payment links)
- **Email capture** (simple newsletter signup integrated into the page)
- **Advanced analytics** (referrer tracking, geo, time-based trends)
- **Themes marketplace** (community-built themes)
- **Team accounts** (agencies managing multiple creators)

But the foundation stays the same: **a JSON file, served fast, for free.**
