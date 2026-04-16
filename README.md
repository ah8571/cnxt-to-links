# cnxt to links

**The free, open-source link-in-bio platform.**

Linktree charges $5–24/month. Stan Store charges $29/month. Both are serving a styled page with a list of links. cnxt to links does the same thing — for free — and you own everything.

---

## Why

Every creator needs a link-in-bio page. Most are paying monthly fees for what is fundamentally a small file served through a CDN. There's no reason this should cost money.

cnxt to links strips the problem down to its core: **each creator's profile is a JSON file, rendered as a fast static page, served at the edge.** No bloated backend. No database. No vendor lock-in.

## How It Works

```
yourapp.com/username → fetch JSON → render page → done
```

1. A creator signs up and edits their profile through a simple dashboard.
2. Their profile is saved as a JSON file in cloud storage (Cloudflare R2).
3. When someone visits their page, a lightweight edge function fetches the JSON and renders it instantly.
4. Click analytics are tracked with simple counters — no cookies, no third-party tracking.

That's the entire architecture.

## Features

- **Link-in-bio pages** — clean, mobile-first, loads instantly worldwide
- **Creator dashboard** — manage your links, bio, avatar, and social profiles
- **Themes** — built-in minimal themes (more community themes to come)
- **Social icons** — auto-display for major platforms
- **Click analytics** — per-link click counts and page views, privacy-friendly
- **SEO & Open Graph** — proper meta tags so shared links look great
- **Custom domains** — point your own domain at your page
- **Self-hostable** — deploy to your own Cloudflare account for $0/month

## Architecture

Built entirely on Cloudflare's infrastructure:

| Layer | Technology |
|---|---|
| Storage | Cloudflare R2 (one JSON file per creator) |
| Backend | Cloudflare Workers (tiny API) |
| Frontend | Cloudflare Pages (creator dashboard) |
| CDN | Cloudflare (built-in, global) |
| Analytics | Cloudflare KV (lightweight counters) |
| Auth | Passwordless magic links |

The entire platform runs within Cloudflare's free tier for thousands of users.

## Pricing

**Free for creators.** A link-in-bio page costs essentially nothing to serve. We're not going to charge for it.

For high-traffic creators with heavy usage, there may be a minimal hosting fee to cover real infrastructure costs — but we're talking dollars, not $29/month.

We're also building toward a **self-host option**: deploy to your own Cloudflare account, pay nothing, and own your entire stack.

## vs. Alternatives

| | Linktree Free | Linktree Pro | Stan Store | **cnxt** |
|---|---|---|---|---|
| Price | $0 | $5–24/mo | $29/mo | **Free** |
| Custom domains | No | Yes | Yes | **Yes** |
| Remove branding | No | Yes | Yes | **Yes** |
| Analytics | Basic | Full | Full | **Basic (V1)** |
| Own your data | No | No | No | **Yes** |
| Open source | No | No | No | **Yes** |
| Self-hostable | No | No | No | **Yes** |

## Current Status

🚧 **In active development — not yet ready for use.**

See [ROADMAP-V1.md](ROADMAP-V1.md) for the full development plan and [CONCEPT.md](CONCEPT.md) for the detailed product concept.

## Contributing

This project is in its early stages. Contributions, ideas, and feedback are welcome. More contribution guidelines coming soon.

## License

[GNU General Public License v3.0](LICENSE)
