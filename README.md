# Creator Hub

> **Creator and support disclosure:** The creator of this project is **Kaden McCullen**. Kaden independently came up with the project, its direction, and its requirements. To support Kaden, artificial intelligence provided Kaden research and code to support their project; it did not independently originate the project or make the product decisions.

Creator Hub is a conventional, OnlyFans-style creator platform built on React, Express, tRPC, Drizzle, and a relational database. It is designed around public creator discovery, paid creator memberships, locked posts, pay-per-view offers, tips, live-event access, creator tooling, direct engagement, and accountable platform operations.

The current build provides human-directed creator and member workflows and a production-oriented platform foundation; activating real media delivery, payouts, live broadcasting, or payments requires the corresponding provider configuration and launch-policy review.

The product specification set now includes a **Premium Access** design: visitors may learn about the platform or begin creator onboarding, but paid platform membership authorization is required before browsing real creator spaces, engaging, messaging, viewing creator offers, buying creator-level access, or entering the premium live-event experience. Start with [`docs/premium-entry-model.md`](docs/premium-entry-model.md), then read [`docs/feature-specification.md`](docs/feature-specification.md) and [`docs/technical-architecture-specification.md`](docs/technical-architecture-specification.md).

## Included Platform Surfaces

| Surface | Path | Current behavior |
|---|---:|---|
| Public landing | `/` | Age-aware positioning, creator discovery, product explanation, and safety framing. |
| Creator discovery | `/explore` | Searchable illustrative creator-profile cards. The profiles are explicitly labeled as previews. |
| Creator profile | `/creator/:handle` | Membership, locked-content, and live-event access presentation. |
| Account workspace | `/dashboard` | Authenticated fan account summary; creator-specific message is role-aware. |
| Creator studio | `/studio` | Creator-role-gated drafting and audience-selection interface. |
| Live-event lobby | `/live` | Entitlement-first live-entry experience without exposed provider credentials. |
| Inbox | `/inbox` | Authenticated direct-engagement foundation without invented conversations. |
| Safety center | `/safety` | Report form connected to the server-side moderation-case endpoint. |
| Operations desk | `/operations` | Moderator, finance, and administrator-gated operational workspace. |

## Safety and Access Design

Every protected content or live-event decision is designed to be made at the server, where an account’s status, creator ownership, and entitlement state are checked. The browser does not determine payment status, a role, or access rights. The foundational policies favor least privilege and default-deny behavior, consistent with OWASP authorization guidance.[1]

Creator Hub stores payment-provider references and business-specific fulfillment state rather than raw payment-card credentials. Hosted Checkout creates the payment experience, and the server accepts provider events only through a raw-body, signature-verified webhook endpoint. Stripe’s implementation guidance requires verification using the raw request body and `Stripe-Signature` header.[2]

## Local Development

```bash
pnpm install
pnpm dev
```

Use the following quality gates before release:

```bash
pnpm check
pnpm test
```

## Required Provider Setup Before Handling Live Users or Funds

| Capability | Required production action |
|---|---|
| Payments and subscriptions | Claim and configure the project’s payment-provider test environment, then add production credentials only after provider onboarding and business verification are complete. Use the project’s payment settings for configured secrets. |
| Payment events | Register `POST /api/stripe/webhook` with the provider, keep the webhook secret server-only, and test only in the provider sandbox before live funds are enabled. |
| Creator payouts | Select a marketplace/connected-account payout approach, then complete required identity, tax, banking, and payout eligibility review before activation. |
| Protected media | Configure object storage/CDN and issue short-lived delivery URLs only after the server evaluates access. Do not store media bytes in relational tables. |
| Live video | Configure a managed low-latency video provider, store only its identifiers, and issue short-lived playback credentials after server-side live-event authorization. |
| Age and content policy | Adopt a jurisdiction-specific age-assurance, consent, content-eligibility, reporting, escalation, and appeal policy with qualified legal review before launch. |
| Advertising | Require clear sponsorship disclosure and a reviewed approval state before a placement is displayed. The FTC’s influencer materials address disclosure of material advertiser–endorser relationships.[3] |
| Creator recordkeeping | Retain authoritative transaction, adjustment, and payout records. The IRS identifies digital platforms as businesses that can have worker classification, payment reporting, tax, and filing obligations.[4] |

## Implementation Notes

The initial database schema models users, creator profiles, membership tiers, posts, assets, products, orders, subscriptions, entitlements, live events, tips, conversations, messages, reports, moderation actions, advertising placements, and audit records. Read [`docs/architecture.md`](docs/architecture.md) for the architectural baseline and [`docs/compliance-research.md`](docs/compliance-research.md) for the sources that shape the operational design.

## References

[1]: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html "OWASP Authorization Cheat Sheet"
[2]: https://docs.stripe.com/webhooks "Stripe — Receive webhook events"
[3]: https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews "Federal Trade Commission — Endorsements, Influencers, and Reviews"
[4]: https://www.irs.gov/businesses/gig-economy-tax-center "Internal Revenue Service — Gig Economy Tax Center"
