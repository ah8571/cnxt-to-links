# Billing & Usage Tracking

Transparent, per-user cost tracking for cnxt to links. The goal: generous free tier for most users, metered billing only for heavy usage, and full cost transparency so users see exactly where every cent comes from.

---

## Core Principle

**Never charge for what costs us nothing.** Only bill for actual infrastructure consumption, and show users exactly what they're consuming. This is the opposite of Linktree's model (paywall cheap features at premium prices).

---

## Per-User Cost Isolation

Cloudflare's architecture makes per-user tracking natural — every request is scoped to a username via the URL path (`cnxt.to/{username}`).

### What We Can Track Per User

| Resource | How it's scoped | Cost driver | Rate |
|----------|----------------|-------------|------|
| **Page views** | URL `cnxt.to/{username}` | Workers requests | $0.50/million |
| **Link clicks** | Analytics write keyed to username | KV writes | $5/million |
| **Analytics reads** | Dashboard queries keyed to username | KV reads | $0.50/million |
| **Profile storage** | R2 key `profiles/{username}.json` | R2 storage | $0.015/GB/mo |
| **Avatar storage** | R2 key `avatars/{username}` | R2 storage | $0.015/GB/mo |
| **Avatar serves** | R2 reads keyed to username | R2 Class B reads | $0.36/million |

### Usage Counter Keys

On every billable operation, increment a monthly counter in KV:

```
usage:{username}:2026-04:views
usage:{username}:2026-04:clicks
usage:{username}:2026-04:kv_reads
usage:{username}:2026-04:kv_writes
usage:{username}:2026-04:r2_reads
```

One extra KV write per page view to track usage. Monthly rollup. The tracking itself costs almost nothing.

---

## Per-User Cost Estimates

| Usage tier | Monthly views | Est. cost/user/month | Tier |
|------------|--------------|----------------------|------|
| Casual | <1,000 | ~$0.001 | Free |
| Active | 1,000–10,000 | $0.01–0.05 | Free |
| Popular | 10,000–100,000 | $0.05–0.50 | Free (approaching threshold) |
| Viral | 100,000+ | $0.50–5.00 | Paid (metered) |

**99% of users will cost under $0.05/month.** The long tail is essentially free.

---

## Free Tier

Generous enough that most creators never pay:

- Unlimited links
- Avatar/photo upload
- All templates and themes
- Custom theme colors
- Basic analytics (total views + total clicks)
- Social icon row
- SEO meta tags
- Link descriptions
- Link scheduling
- QR code
- No forced branding
- Up to ~100K views/month before any cost consideration

---

## Analytics Tiers (User-Configurable)

The main per-user cost lever is analytics granularity. Users can choose their level:

| Level | What's tracked | KV writes/view | Cost impact |
|-------|---------------|----------------|-------------|
| **No analytics** | Nothing — just serve the page | 0 | Cheapest possible |
| **Basic** (default) | Total views + total clicks | 1 | Negligible |
| **Detailed** | + country, device, referrer breakdowns | 3–4 | Higher at scale |

Users who don't need detailed analytics can opt down to keep their costs at zero. Users who want country/device/referrer data can opt up — still free at normal volumes, only matters at scale.

---

## Paid Tier (Future)

For users who exceed free thresholds or want premium infrastructure:

| Feature | Why it costs real money | Pricing approach |
|---------|----------------------|------------------|
| **High traffic** (100K+ views/mo) | Workers + KV at scale | Metered: pass through Cloudflare costs + margin |
| **Custom domains** | Cloudflare for SaaS ~$0.10/hostname/mo | Flat $5/mo or rolled into Pro |
| **Digital product sales** | Stripe fees (2.9% + $0.30/txn) | Pass-through — Stripe charges buyer, creator gets paid directly |
| **Social posting (X API etc.)** | X charges per API call | Metered: 2x actual API cost to cover overhead |
| **Newsletter sending** | Resend: $0.40/1,000 emails | Metered or capped on free tier |
| **Large file storage** | R2 beyond free tier | Metered at R2 rates + margin |

### Social Posting Pricing Model

When/if we add social posting (X, Instagram, etc.):
- Third-party APIs charge per action
- Our pricing: **2x the API cost** to the user
- Covers: API fees + our compute overhead + margin
- Example: if X charges $0.01/post, we charge $0.02/post
- Users see the breakdown: "X API: $0.01 + cnxt overhead: $0.01 = $0.02"

### Billing Integration

- Stripe usage-based billing (metered subscriptions)
- Monthly invoice based on actual consumption
- Dashboard shows real-time usage + projected cost
- Users can set budget alerts / caps

---

## Platform Cost Model (at Scale)

### 10,000 Active Users

| Resource | Usage estimate | Monthly cost |
|----------|---------------|-------------|
| Workers requests | 150M requests/mo | $75 |
| KV reads | 200M reads/mo | $100 |
| KV writes | 20M writes/mo | $100 |
| R2 storage | ~5GB | $0.075 |
| R2 reads | 50M reads/mo | $18 |
| Resend emails | ~50K/mo | $20 |
| Domain (cnxt.to) | Annual | ~$2/mo |
| Workers Paid plan | Base | $5/mo |
| **Total** | | **~$320/mo** |

**$0.032/user/month** average cost across all users.

If only 5% of users (500) are on a $5/mo paid tier: **$2,500/mo revenue** vs **$320/mo cost**. Sustainable from day one.

---

## Dashboard: Usage Visibility

Users should be able to see their own consumption:

**`/api/usage`** endpoint returns:
```json
{
  "period": "2026-04",
  "views": 12450,
  "clicks": 3210,
  "storage_bytes": 245000,
  "analytics_level": "basic",
  "estimated_cost": "$0.01",
  "tier": "free",
  "limits": {
    "views_before_paid": 87550
  }
}
```

Dashboard renders this as a simple usage meter — "You've used 12% of the free tier this month." Full transparency, no surprises.

---

## Strategic Summary

| What competitors do | What we do |
|---------------------|-----------|
| Paywall $0-cost features at $6–30/mo | Give them away free |
| Hide infrastructure costs | Show users exactly what things cost |
| Charge flat subscription regardless of usage | Meter actual consumption, free for most |
| Lock users in with proprietary data | Open source, export anytime |
| Optimize for revenue extraction | Optimize for honest unit economics |

The bet: transparent pricing builds trust, trust builds community, community builds a sustainable open-source platform.
