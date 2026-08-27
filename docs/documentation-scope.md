# Creator Hub — Documentation Scope and Decision Record

**Author:** Manus AI  
**Status:** Research and specification baseline  
**Primary working jurisdiction:** United States federal baseline, with state, local, international, and launch-market requirements identified as mandatory review items.

> **Working analysis, not legal or tax advice.** The requirements below turn recognized compliance and safety concerns into product controls. A qualified attorney, privacy professional, and tax professional must confirm the rules that apply to the business entity, creators, content, launch geography, and payment/payout model before any production release.

## 1. Purpose

This documentation set defines the functional, technical, operational, and launch requirements for a professional adult-entertainment creator platform. It is intended to prevent an incomplete implementation from treating age controls, creator verification, consent evidence, paid access, payment processing, content protection, moderation, privacy, advertising disclosure, records, and staff operations as disconnected afterthoughts.

The product premise is explicit: **the public landing page is the only general-public experience. Premium Access is the platform-level paid gate. Active Premium Access is required before a person can browse real creator spaces, send or receive creator-contact requests, engage with creator content, open creator offers, buy creator-level memberships or PPV, tip, or enter the premium live-event environment.** Creator-level access requirements then apply in addition to, not instead of, Premium Access.

## 2. Product and Content Boundary

| In scope | Out of scope for the product baseline |
|---|---|
| Adult-only creator profiles, paid platform membership, creator memberships, PPV, tips, private messages, moderated live-event experiences, lawful advertising, and professional staff controls. | Content involving minors, age-bypass tools, non-consensual or illegal material, unverified performer participation, raw card-data storage, unmoderated live broadcasting, or anonymous paid interaction. |
| Human-led creator review, content/moderation review, reporting, suspension, appeal support, and audit trails. | AI-generated adult material, AI age estimation as the sole age-control mechanism, AI content generation, AI recommendation, or AI-only enforcement. |

The platform must never expose, market, solicit, process, or attempt to facilitate material that violates law, provider policy, creator agreement, or the platform’s content standards. The final prohibited-content taxonomy, identity/consent evidence standard, retention schedule, and escalation matrix require jurisdiction-specific professional review.

## 3. Source Hierarchy

| Priority | Source category | Use in this project |
|---:|---|---|
| 1 | Applicable statutes, regulations, agency publications, and regulator guidance | Define non-negotiable control areas, recordkeeping, advertising, security, tax, and privacy obligations. |
| 2 | Payment, identity, storage, and streaming provider documentation and acceptable-use rules | Determine whether a proposed commercial/technical workflow is supportable and how it must be implemented. |
| 3 | OWASP, NIST, W3C/WCAG, and analogous recognized standards | Define secure and accessible technical implementation patterns. |
| 4 | Contractual platform policies and internal risk decisions | Define rules more restrictive than the minimum law/provider standard, including prohibited content and operational thresholds. |
| 5 | Secondary commentary | Context only; it cannot override a primary source or qualified counsel. |

## 4. Research Inputs and Deliverable Set

| Research stream | Key question | Documentation deliverable |
|---|---|---|
| Premium Access and identity | How does the platform ensure paid authorization before engagement? | Access-control specification, route matrix, entitlement state machine, billing recovery rules. |
| Adult-safety and creator verification | What evidence, review, and restriction controls should exist before monetization? | Creator onboarding and content-governance specification, staff review workflow, policy register. |
| Payments, marketplace/payouts, tax records | How are subscriptions, creator revenue, tips, refunds, and payout eligibility handled without raw-card exposure? | Commerce specification, provider-event contract, ledger/reconciliation model, launch checklist. |
| Privacy, security, and protected media | How are sensitive data, assets, and live access handled? | Data classification, asset/stream control specification, security test plan. |
| Messaging, live interaction, moderation | How are adult-only interactions kept consent-aware, rate-limited, reportable, and auditable? | Engagement and live-event functional requirements, moderation case specification. |
| Advertising and disclosure | How do sponsored placements remain transparently labeled and reviewable? | Advertising governance and disclosure requirements. |

## 5. Assumptions Requiring Formal Confirmation

| Assumption | Current treatment | Required decision owner |
|---|---|---|
| Primary launch geography | U.S. federal baseline for documentation; no state, foreign, or local launch clearance is asserted. | Business legal counsel. |
| Adult content category | Consensual adult creator content only, with no content permitted outside formal policy/provider terms. | Legal counsel and Trust & Safety lead. |
| Merchant/payout model | A provider-supported marketplace or connected-account model is required; the final merchant-of-record and fund-flow role are not yet selected. | Finance leadership, tax counsel, payments counsel. |
| Identity/age assurance | A specialist verification vendor and human review policy are required before production use. | Legal counsel, privacy lead, Trust & Safety lead. |
| Recordkeeping | The platform requires secure, limited-access evidence handling and a retention/destruction schedule; the final scope is subject to counsel. | Legal counsel and records officer. |
| Privacy/consent | Consent and data rights are configurable by jurisdiction; the privacy notice and lawful basis are not finalized. | Privacy counsel/data protection officer. |
| Promotion | All paid/sponsored relationships require visible disclosures and a staff approval state. | Legal counsel, marketing compliance owner. |

## 6. Engineering Interpretation

Engineering may implement the controls and interfaces described by this project, but must not represent the site as “legally compliant” merely because these features exist. Every production release must be conditional on final policy documents, selected providers that permit the actual content and fund flows, documented staff ownership, and a completed launch review.

The next research and specification phases use the U.S.-first baseline only to identify design obligations and unknowns. They do not substitute for legal classification, content review, tax analysis, or formal age/identity-verification advice.
