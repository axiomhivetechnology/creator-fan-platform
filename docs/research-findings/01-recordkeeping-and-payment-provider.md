# Research Findings 01 — Recordkeeping and Payment Provider Eligibility

**Research date:** 2026-08-27  
**Status:** Design input; not legal advice.

## Verified Sources

| Source | Confirmed finding | Product/specification impact |
|---|---|---|
| [28 CFR Part 75](https://www.ecfr.gov/current/title-28/chapter-I/part-75) | The regulation addresses recordkeeping and record-inspection provisions for covered visual depictions. The retrieved text identifies the producer definition and describes, for covered material, performer legal-name/date-of-birth records based on picture identification; image/ID record handling; aliases; indexing/cross-referencing; production-date and URL/unique-reference links; and special treatment of live Internet depictions. | The production design requires counsel-confirmed coverage analysis; a restricted evidence vault; performer/depiction/alias/URL linkage; searchable record index; immutable audit trail; retention/destruction policy; access controls; and a no-publish state until the applicable compliance review is complete. Do not store this evidence in ordinary profile/media tables. |
| [Stripe — Prohibited and Restricted Businesses](https://stripe.com/en-th/legal/restricted-businesses) | The retrieved policy lists adult services, including pay-per-view and adult live-chat features, under prohibited businesses and says Stripe services must not be used for listed business/product types. | The existing Stripe checkout integration must be treated as **not eligible for the intended adult-entertainment fund flow** unless a provider-specific written authorization and applicable local policy confirm otherwise. The documentation must require a specialist adult-industry payment/acquiring provider that explicitly accepts the actual content, subscription, PPV, tipping, and marketplace-payout model before any production payment feature is activated. |

## Required Design Changes

The payment architecture must become provider-agnostic behind a `PaymentProviderAdapter`. It must not assume that a generic processor or generic marketplace product is permitted for adult content, adult live sessions, pay-per-view, recurring memberships, tips, or creator payouts. The payment-provider selection process must capture the provider’s written support for the selected merchant-of-record and fund-flow model, requirements for descriptions/disclosures, chargeback/reserve practices, content/creator evidence, underwriting approval, and webhook/test procedures.

The creator onboarding architecture must distinguish account-profile verification from restricted legal/compliance evidence. The latter belongs in a dedicated encrypted evidence domain with separate access, audits, review/retention controls, and counsel-approved workflows. Whether a particular creator, depiction, or platform workflow is covered must be determined by qualified counsel; this document specifies engineering safeguards, not a legal conclusion.

## Follow-up Research Questions

| Question | Why it matters |
|---|---|
| Which launch states/countries are in scope, and what age-verification, recordkeeping, consumer, privacy, tax, and content rules apply there? | It controls identity assurance, access gating, contractual terms, data location, and launch eligibility. |
| Which adult-industry acquirer/payment processor supports the intended subscription, PPV, tip, live, refund, and marketplace/payout model? | It determines the provider adapter, commercial disclosures, reserve/chargeback workflows, and creator settlement design. |
| What content is in scope and who qualifies as producer/secondary producer under the selected operational model? | It determines the compliance evidence and inspection statement/record program, if applicable. |

## References

[1]: https://www.ecfr.gov/current/title-28/chapter-I/part-75 "eCFR — 28 CFR Part 75"
[2]: https://stripe.com/en-th/legal/restricted-businesses "Stripe — Prohibited and Restricted Businesses"
