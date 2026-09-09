# Creator Hub — Documentation Index


> **Creator and support disclosure:** The creator of this project is **Kaden McCullen**. Kaden independently came up with the project, its direction, and its requirements. To support Kaden, artificial intelligence provided Kaden research and code to support their project; it did not independently originate the project or make the product decisions.

This index identifies the canonical specifications and supporting research for **Creator Hub**, an adult-only creator membership platform. The implementation follows a premium-entry model: an account must hold verified **Premium Access** before it can join the real creator network, engage/contact creators, use creator offers, or seek protected content/live-event access.

> This documentation set is an engineering and operating specification. It does not itself create legal, tax, payment-provider, age-assurance, or regulatory compliance. Launch requires qualified review and written approvals for the actual business model and jurisdiction.

| Document | Purpose | Primary audience | Status |
|---|---|---|---|
| [Full Engineering Packet](engineering-packet.md) | Implementation-aligned architecture, routes, API procedures, data model, authorization, workflows, testing, deployment, social metadata, and launch gates. | Engineering, product, design, operations, security, finance | Current release packet. |
| [Developer Editor Specification](developer-editor-specification.md) | Admin-only IDE-style public-site customization workspace, settings model, audit behavior, safe boundaries, rebuild sequence, and launch notes. | Engineering, product, operations, security | Current feature specification. |
| [Functional Specification v2](functional-specification-v2.md) | Product purpose, roles, Premium Access gate, creator onboarding, content, commerce, engagement, live events, reports, ads, accessibility, and acceptance journeys. | Product, design, engineering, operations | Canonical. |
| [Technical Specification v2](technical-specification-v2.md) | System architecture, policy enforcement, data model, provider adapters, APIs/events, media/video, security/privacy, and nonfunctional targets. | Engineering, security, vendor integration | Canonical. |
| [Operations & Launch Specification v2](operations-launch-specification-v2.md) | Governance, policy library, staffing/queues, finance, privacy, safety, advertising, testing, release blockers, and launch checklist. | Operations, finance, legal, security, executive sponsor | Canonical. |
| [Premium Entry Model](premium-entry-model.md) | Original presentation of the platform membership boundary. | Product/design | Superseded by Functional Specification v2 where inconsistent. |
| [Architecture Baseline](architecture.md) | Original platform module/trust-boundary overview. | Engineering | Superseded by Technical Specification v2 where inconsistent. |
| [Feature Specification](feature-specification.md) | Original feature brief. | Product | Superseded by Functional Specification v2 where inconsistent. |
| [Technical Architecture Specification](technical-architecture-specification.md) | Original technical brief. | Engineering | Superseded by Technical Specification v2 where inconsistent. |
| [Compliance Research](compliance-research.md) | Earlier IRS/FTC/provider research summary. | Product/operations | Supporting. |
| [Documentation Scope](documentation-scope.md) | Research scope, source hierarchy, U.S.-first assumption, and review boundary. | All stakeholders | Supporting. |
| [Research Finding 01](research-findings/01-recordkeeping-and-payment-provider.md) | Federal recordkeeping and processor-eligibility findings. | Legal, finance, security | Supporting. |
| [Research Finding 02](research-findings/02-identity-and-child-safety.md) | Identity assurance and child-safety escalation findings. | Security, trust & safety | Supporting. |
| [Research Finding 03](research-findings/03-privacy-accessibility-commerce.md) | Privacy, accessibility, copyright, payment security, and subscription findings. | Privacy, design, finance, operations | Supporting. |

## Recommended Reading Order

Product/design should start with the Functional Specification v2, then read the Operations & Launch Specification v2 for the requirements that constrain flows. Engineering should pair the Technical Specification v2 with the Functional Specification v2 before implementing a module, and should read the Developer Editor Specification before changing public presentation controls. Finance, legal, privacy, and trust-and-safety owners should use the Operations & Launch Specification v2 and research findings to establish the final launch register and approval process.

## Core Design Decision

| Decision | Requirement |
|---|---|
| Public boundary | Landing, plans, creator application, policy, safety, privacy, copyright, billing recovery, and support can be public. Real premium creator discovery, offers, engagement, messages, purchases, and live events cannot. |
| First membership gate | An active platform `premium_access` entitlement is required for real network participation. It is separate from creator membership, PPV, ticket, tip, and contact rules. |
| Adult-entertainment payment gate | No generic processor is activated merely because a technical integration exists. The selected provider must explicitly approve the actual adult content and transaction/fund-flow model. |
| Verification/evidence boundary | Account/profile information is distinct from restricted identity/age/consent/compliance evidence. Restricted evidence is not stored or queried as ordinary product data. |
| Safety model | No unaudited staff access to restricted evidence and no AI-only moderation. Reports/critical incidents follow scoped, human-accountable workflows. |
