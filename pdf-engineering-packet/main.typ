#import "report-theme.typ": report-accent, report-theme

#show: report-theme.with(
  title: "Creator Hub — Full Engineering Packet",
  author: "Kaden McCullen",
  rhythm: "report",
  running-header: true,
)

// ---------- Title page ----------
#page(margin: (top: 24%, x: 2.2cm), numbering: none, header: none)[
  #set par(first-line-indent: 0em)
  #align(center)[
    #text(size: 28pt, weight: "bold", fill: report-accent)[Creator Hub]
    #v(0.5em)
    #text(size: 21pt, weight: "bold")[Full Engineering Packet]
    #v(0.8em)
    #text(size: 13pt, fill: luma(75))[Architecture, implementation, rebuild guide, operations, and launch readiness]
    #v(2em)
    #line(length: 42%, stroke: 0.6pt + report-accent)
    #v(2em)
    #text(size: 11pt)[Project creator: Kaden McCullen]
    #v(0.5em)
    #text(size: 10pt, fill: luma(70))[Prepared as a single professional engineering and operating packet]
    #v(2em)
    #block(width: 82%, inset: 1em, radius: 4pt, fill: luma(245), stroke: 0.5pt + luma(205))[
      #text(size: 9.5pt)[
        *Creator and support disclosure.* Kaden McCullen independently came up with the project, its direction, and its requirements. To support Kaden, artificial intelligence provided Kaden research and code to support their project; it did not independently originate the project or make the product decisions.
      ]
    ]
    #v(2em)
    #text(size: 9pt, fill: luma(65))[Release basis: Creator Hub checkpoint c1d25f13, with PDF-specific documentation consolidation]
  ]
]

// ---------- Table of contents ----------
#page(numbering: none, header: none)[
  #outline(title: [Contents], indent: 1.5em)
]

#counter(page).update(1)

= Document purpose and usage

This packet is a practical rebuild guide for Creator Hub. It explains what the platform is intended to do, what has been implemented in the current React, Express, tRPC, Drizzle, and MySQL/TiDB project, how the principal controls work, how the repository is organized, how to reproduce the development workflow, and what must still be completed before a lawful production launch.

The packet is written for Kaden McCullen, engineering collaborators, product and design contributors, operations staff, payment and streaming vendors, security reviewers, and qualified legal or compliance advisers. It is an engineering and operating specification, not a legal opinion, payment-provider approval, tax determination, age-assurance certification, or guarantee that a provider will accept the business model.

#block(width: 100%, inset: 0.9em, radius: 4pt, fill: luma(245), stroke: 0.5pt + luma(205))[
  *Important interpretation.* The current repository is an implementation baseline and demonstration of the core access, creator, media, messaging, safety, and operations foundations. Provider-dependent payment settlement, creator payouts, live streaming, restricted evidence storage, and jurisdiction-specific approvals remain launch gates.
]

= Executive summary

Creator Hub is an adult-only creator monetization platform for human creators and paying members. Its product concept combines creator-hosted pages with paid posts and subscriptions, live rooms with optional gifting or donations, direct engagement, protected media, and platform operations. The defining business rule is Premium Access: an account must hold active platform membership authorization before entering the real creator network or performing protected network actions.

The application is currently a modular full-stack web project. The React client presents public and authenticated surfaces. Express hosts the runtime and tRPC transport. Drizzle maps relational domain tables to MySQL or TiDB. Server policy modules evaluate account state, role, Premium Access status, creator approval, payout readiness, ownership, resource entitlements, contact settings, bilateral blocks, publication state, and staff permissions. S3-compatible managed storage holds creator media bytes while the database stores metadata and access state.

The current featured creator is Kaden McCullen. The public presentation includes the confirmed Instagram handle \@itskadenbro. The visual language is matte black with restrained neon pink, editorial photography, Old English display typography, cursive creator treatment, glass-depth cards, grain, and reduced-motion-aware motion.

#table(
  columns: (1.7fr, 2fr, 2.8fr),
  table.header([Area], [Current state], [What it means]),
  [Public experience], [Implemented], [Landing page, age acknowledgement, safety messaging, public previews, Premium Access entry, and creator application surfaces exist.],
  [Premium Access], [Implemented], [Client gate and server policy enforce platform-level entry before protected network activity.],
  [Creator onboarding], [Foundation implemented], [Application, review status, eligibility and payout-readiness states exist; restricted evidence and final provider workflows remain separate.],
  [Paid content], [Foundation implemented], [Posts, products, subscriptions, PPV state, orders, entitlements, checkout foundation, and protected media registration exist.],
  [Live experiences], [Foundation implemented], [Event scheduling and entitlement checks exist; managed playback, chat, and broadcast operations remain provider work.],
  [Payments and payouts], [Provider-dependent], [Hosted checkout foundation exists, but adult-industry approval, settlement, payouts, disputes, reserves, and reconciliation remain required.],
  [Evidence vault], [Not complete], [A separate restricted evidence boundary is specified but is not yet implemented in the current application.],
  [Verification], [Passing], [Type checking passes and the current suite reports 18 passing tests in 8 test files.],
)

= Product definition and confirmed decisions

== Product concept

The platform is intended for human creators and paying guests. A creator can maintain a profile, publish paid or membership-restricted posts, schedule live events, communicate according to policy, and receive creator-level commercial benefits after approval and payout readiness. A member can obtain Premium Access, follow creators, subscribe to creator tiers, acquire protected posts or event access, message where permitted, and participate in future provider-backed gifting flows.

The project is deliberately structured so that public marketing and policy information can be visible without exposing the real private creator network. Public previews are not an authorization grant. Protected data, messages, offers, media, and live sessions must be authorized again on the server.

== Canonical creator record

#table(
  columns: (2fr, 4fr),
  table.header([Field], [Canonical value]),
  [Creator], [Kaden McCullen],
  [Handle], [kaden-mccullen],
  [Instagram], [\@itskadenbro],
  [Featured image], [/manus-storage/kaden-mccullen_560fb805.jpeg],
  [Category], [Featured creator],
  [Membership presentation], [\$9 / month],
  [Display status], [Live now],
  [Next event label], [Open studio session],
)

The Instagram handle is presentation metadata. It is surfaced on the homepage featured treatment, creator cards, and the creator profile as an external link. It is not an authentication credential, payment identifier, age or eligibility record, or substitute for creator review.

== Premium-entry decision

Premium Access is a platform-level entitlement. It is separate from creator subscriptions, PPV purchases, tickets, tips, and resource-specific entitlements. The current rule is cumulative: Premium Access must be active, and the creator or resource-level policy must also grant access. A Premium member is not automatically entitled to every creator, post, message, event, or asset.

= System architecture

== Context diagram

#block(width: 100%, inset: 0.8em, radius: 4pt, fill: luma(248), stroke: 0.5pt + luma(210))[
  #set text(size: 8.5pt)
  #align(center)[
    #text(weight: "bold")[Visitor / Member / Creator / Staff]
    #v(0.4em)
    ↓
    #text(weight: "bold")[React client and route presentation]
    #v(0.4em)
    ↓
    #text(weight: "bold")[Express runtime + typed tRPC appRouter]
    #v(0.4em)
    ↓
    #text(weight: "bold")[Policy modules: Premium Access, ownership, entitlement, relationship, staff scope]
    #v(0.4em)
    ↓
    #text(weight: "bold")[Drizzle ORM → MySQL / TiDB]
    #v(0.4em)
    #text[Managed object storage • OAuth • payment provider • future streaming provider • future evidence vault]
  ]
]

The application is a modular monolith until traffic, availability, or restricted-data requirements justify service separation. The payment adapter, media adapter, restricted evidence boundary, and authorization policy are treated as module contracts so provider-specific logic does not leak into the visual layer.

== Runtime layers

#table(
  columns: (1.6fr, 2fr, 2.8fr),
  table.header([Layer], [Implementation], [Responsibility]),
  [Browser], [React 19, Wouter, Tailwind CSS 4, Radix/shadcn primitives], [Public pages, protected workspaces, loading states, empty states, responsive presentation, and interaction feedback.],
  [Client data], [tRPC React bindings and TanStack Query], [Typed request/response flow, auth state, cache invalidation, and mutation state.],
  [HTTP runtime], [Express 4 and project server runtime], [OAuth callback, tRPC transport, static delivery, storage proxy, and process startup.],
  [API contract], [tRPC 11 and Zod], [Typed procedures, schema validation, router grouping, and server policy execution.],
  [Domain logic], [server/platform modules], [Access, Premium Access, media, messaging, and creator application decisions.],
  [Persistence], [Drizzle ORM with MySQL/TiDB], [Business records, state transitions, references, timestamps, indexes, and audit records.],
  [Storage], [S3-compatible managed storage], [Creator media bytes and managed asset paths.],
  [Identity], [Configured OAuth provider], [Session establishment, current-user context, and logout.],
  [Payments], [Hosted checkout foundation and adapter boundary], [Provider references, pending order creation, and event-oriented fulfillment foundation.],
)

== Repository map

#raw("client/src/App.tsx                 Routes and global providers\nclient/src/pages/                   Public, member, creator, live, safety, and operations pages\nclient/src/components/              Gates, headers, dashboard shells, cards, and UI primitives\nclient/src/lib/catalog.ts           Featured creator metadata and illustrative creator catalog\nclient/src/index.css                Theme tokens, typography, texture, image treatment, motion\nserver/routers.ts                   Concrete tRPC application router and procedure checks\nserver/db.ts                        Drizzle query and persistence helpers\nserver/platform/access.ts           Account, role, ownership, block, and resource policies\nserver/platform/premium.ts          Premium Access decision mapping\nserver/platform/creatorApplication.ts Application workflow helpers\nserver/platform/media.ts            MIME, size, filename, and storage-key validation\nserver/platform/messaging.ts        Conversation and participant policy helpers\nserver/payments/                    Hosted checkout and provider mapping foundations\nserver/storage.ts                   Managed storage target helpers\ndrizzle/schema.ts                   Relational schema, enums, indexes, and constraints\ndocs/                               Functional, technical, operations, audit, and rebuild documentation", lang: "text", block: true)

= Frontend routes and experience

#table(
  columns: (1.4fr, 1.6fr, 2.1fr, 2fr),
  table.header([Route], [Surface], [Access behavior], [Current purpose]),
  [/], [Home], [Public], [Editorial landing page, age acknowledgement, featured Kaden presentation, collection preview, approach, safety, and early-circle messaging.],
  [/join], [Premium Access], [Public entry/status], [Plan explanation, account entry, privacy boundary, provider-dependent payment notice, and secure access foundation.],
  [/apply], [Creator application], [Authenticated workflow], [Creator application submission and status messaging.],
  [/studio], [Creator studio], [Authenticated plus server creator policy], [Draft publishing and media workflow presentation.],
  [/studio/live], [Creator events], [Authenticated plus creator readiness], [Future live-event scheduling.],
  [/studio/contact], [Contact settings], [Authenticated plus approved creator], [Message policy and tips preference.],
  [/explore], [Explore], [PremiumAccessGate], [Premium creator collection and filters.],
  [/creator/:handle], [Creator profile], [PremiumAccessGate], [Kaden profile, paid membership presentation, protected-content explanation, social link, and live preview.],
  [/dashboard], [Account hub], [Auth-aware], [Account status and member workspace.],
  [/live], [Live lobby], [PremiumAccessGate], [Entitlement-aware live entry foundation.],
  [/inbox], [Inbox], [PremiumAccessGate], [Protected conversation workspace.],
  [/safety], [Safety center], [Public], [Reporting, restrictions, human review, and safety information.],
  [/operations], [Operations desk], [Staff checks in procedures], [Summary, application, media, report, and ad review queues.],
)

Public previews communicate the concept but do not authorize real private network data. The route wrapper improves user experience; the server remains the actual authorization boundary.

= Identity, roles, and authorization

== Account model

The `users` table stores the OAuth provider reference, display fields, role, account status, age acknowledgement timestamp, marketing-consent timestamp, and lifecycle timestamps. Passwords and raw payment-card credentials are not stored in the application schema.

Roles are `fan`, `creator`, `moderator`, `finance`, and `admin`. Account statuses are `active`, `pending_review`, `suspended`, and `closed`. Staff capabilities must be scoped to the operation and resource; a role label alone is not enough to authorize sensitive work.

== Authorization composition

#table(
  columns: (1.8fr, 3fr, 2.2fr),
  table.header([Dimension], [Examples], [Why it matters]),
  [Role], [Creator publishing, moderator review, finance/admin operations], [Limits privileged actions.],
  [Account state], [Active, pending review, suspended, closed], [Prevents inactive accounts from using sensitive workflows.],
  [Premium entitlement], [Active `premium_access` grant], [Controls entry to the creator network.],
  [Resource entitlement], [Creator membership, post, live event, bundle], [Controls the specific protected resource.],
  [Ownership], [Creator owns profile/post or staff has permitted scope], [Prevents object-level authorization errors.],
  [Relationship], [Conversation participant, membership, block state, contact policy], [Controls interpersonal actions.],
  [Lifecycle state], [Approved creator, payout-ready creator, published post, live event], [Prevents premature publication or playback.],
  [Audit requirement], [Application review, media review, report resolution, checkout], [Makes high-impact actions attributable.],
)

== Core gate examples

#raw("// Illustrative server-side decision shape.\ntype PremiumDecision = {\n  allowed: boolean;\n  reason: \"granted\" | \"premium_required\" | \"account_restricted\";\n};\n\n// The browser may request the action, but the server decides.\nif (!hasActiveAccount(user) || !canEnterPremiumNetwork(user, premiumStatus)) {\n  throw new TRPCError({ code: \"FORBIDDEN\" });\n}", lang: "typescript", block: true)

The concrete implementation uses `canEnterPremiumNetwork`, `canAccessProtectedResource`, `canPurchaseFromCreator`, `canAdministerPlatform`, `canModeratePlatform`, `hasActiveAccount`, `canSubmitCreatorApplication`, `isConversationParticipant`, and `canOpenConversation`.

#table(
  columns: (2.2fr, 3.6fr, 1.8fr),
  table.header([Action], [Required conditions], [Failure]),
  [Explore real creator network], [Active account and active Premium Access], [Forbidden / Premium Access recovery],
  [Follow a creator], [Premium Access and approved creator profile], [Forbidden or unavailable],
  [Open a conversation], [Premium Access, contact policy, relationship, no bilateral block], [Forbidden],
  [Send a message], [Open participant conversation, no block, valid body], [Forbidden],
  [Purchase creator offer], [Active account, Premium Access, active product, creator purchase policy], [Forbidden / not found],
  [Access post], [Premium Access plus matching creator membership or post entitlement], [Safe decision only],
  [Enter live event], [Premium Access plus event state and membership/ticket entitlement], [Safe decision only],
  [Draft post], [Approved creator and payout readiness], [Forbidden],
  [Upload media], [Accepted type/size, owned post, approved creator, payout readiness], [Bad request / forbidden],
  [Staff review], [Capability, resource/case scope, and audit event], [Forbidden],
)

= API and workflow implementation

== Concrete tRPC routers

#table(
  columns: (1.6fr, 2.6fr, 3.1fr),
  table.header([Router], [Procedures], [Behavior]),
  [auth], [me, logout], [Current session user and cookie clearing.],
  [premium], [plans, status], [Active Premium Access plans and current platform subscription/decision.],
  [creatorApplication], [me, submit], [Application read returning `null` when absent; validated submission and audit write.],
  [creator], [publishingStatus, createPost, createMediaUploadTarget, registerMedia, createLiveEvent, updateContactSettings], [Creator readiness, ownership, media validation, future event scheduling, and policy settings.],
  [member], [followCreator, blockAccount, unblockAccount], [Premium-gated follow and bilateral safety blocks.],
  [messaging], [open, send, list, history], [Premium gate, contact policy, participant checks, block checks, and audit on sending.],
  [operations], [summary, creatorApplications, reviewCreatorApplication, reports, resolveReport, pendingAssets, reviewAsset, pendingAds, reviewAd], [Scoped staff queues and review mutations.],
  [access], [post, liveEvent], [Entitlement decision without media bytes or playback credentials.],
  [checkout], [create], [Premium-gated hosted checkout foundation, pending order, and audit write.],
  [safety], [report], [Public report creation for profiles, posts, assets, messages, events, and ads.],
)

== Creator application

A signed-in account submits a display name, a lowercase handle, optional category and note, and an agreement acceptance. The server checks application eligibility, saves non-document workflow state, and writes `creator.application_submitted`. Review procedures can set application status, eligibility status, payout readiness, and review notes. Restricted age, identity, consent, and compliance materials are intentionally outside the ordinary application table.

== Creator publishing and media

Publishing status is enabled only when the creator profile is approved and payout readiness is `ready`. A post supports `public`, `members`, `ppv`, and `private` access types. PPV requires a price and non-PPV posts reject a price. Upload targets are generated only after media type, byte size, ownership, creator approval, and payout checks. Registered assets begin in pending moderation state and are stored as metadata pointing to managed storage.

== Messaging and safety

Opening a conversation requires Premium Access, a creator, the creator’s contact policy, the current creator relationship when required, and no bilateral block. Sending requires participant membership, an open conversation, a valid body, and no block. Public reports accept a subject type, subject ID, reason, and optional detail. Staff review procedures resolve reports and moderate pending assets or advertisements.

== Live-event workflow

Approved and payout-ready creators can schedule future events with `members`, `ticketed`, or `private` access. The access procedure checks Premium Access, event status, creator/resource entitlement, and ownership. Actual broadcast, chat, playback-token issuance, stream moderation, and provider callbacks are not active in the current build.

= Relational data model

#table(
  columns: (1.8fr, 2.3fr, 3.1fr),
  table.header([Table], [Domain], [Important fields or purpose]),
  [users], [Identity], [OAuth reference, role, account status, age acknowledgement, consent, timestamps.],
  [platformAccessPlans], [Platform commerce], [Premium plan code, pricing, currency, provider references, lifecycle.],
  [platformSubscriptions], [Platform commerce], [Provider customer/subscription references and period status.],
  [creatorProfiles], [Creator], [Owner, handle, display name, visibility, approval, payout, message policy, tips setting.],
  [creatorApplications], [Creator], [Agreement version, eligibility, payout readiness, review status, reviewer.],
  [membershipTiers], [Creator commerce], [Creator, name, prices, active state, order.],
  [posts], [Content], [Creator, access type, tier, PPV price, publication status.],
  [contentAssets], [Media], [Creator, storage key, MIME, size, post, moderation status.],
  [products], [Commerce], [Subscription, post, bundle, or live-event product and price.],
  [orders], [Commerce], [Buyer, creator, product, totals, fees, provider references, order status.],
  [subscriptions], [Commerce], [Fan, creator, tier, provider subscription, lifecycle.],
  [entitlements], [Authorization], [User, resource type/id, source, status, validity, revoke reason.],
  [liveEvents], [Live], [Creator, schedule, access type, event status, provider stream ID.],
  [tips], [Commerce], [Fan, creator, optional post/event, amount foundation.],
  [conversations], [Messaging], [Fan, creator, state, timestamps.],
  [creatorFollows], [Relationship], [Member-to-creator follow state.],
  [accountBlocks], [Safety], [Blocking user, blocked user, reason, timestamps.],
  [messages], [Messaging], [Conversation, sender, body, state, timestamps.],
  [adPlacements], [Advertising], [Sponsor, disclosure, approval, active window, placement state.],
  [reports], [Safety], [Subject, reporter, reason, detail, workflow status.],
  [moderationActions], [Safety], [Staff action, target, rationale, timestamps.],
  [auditLogs], [Governance], [Actor, action, target, metadata, timestamps.],
)

The schema stores provider references and workflow states, not passwords, raw payment-card data, or ordinary-query copies of restricted evidence. A future evidence vault must be separate, encrypted, access-granted by case, and independently audited.

= Payments, payouts, tokens, and accounting

The checkout foundation uses hosted payment collection. The `checkout.create` procedure requires an active account and Premium Access before allowing a creator offer. It loads the active product and creator, creates a hosted session with provider metadata, creates a pending order keyed by provider checkout ID, writes an audit event, and returns the hosted URL.

This code path is not a production approval. The selected provider must explicitly underwrite the actual adult-content category, recurring billing, creator payouts, PPV, tips, gifting, reserves, refunds, disputes, tax reporting, supported countries, supported currencies, and marketplace flow. The current test provider configuration does not close those business decisions.

Tokens, power, and gifts remain a product-definition gate. Before activation, document the unit name, price ladder, wallet balance rules, purchase flow, chargeback/refund rules, creator redemption and payout treatment, platform commission, taxation, age and jurisdiction constraints, fraud controls, spending limits, and ledger reconciliation. Never launch a virtual economy with ambiguous value or undefined redemption.

= Media and live infrastructure

The storage design separates bytes from access decisions. A creator asset is registered by storage key, content type, byte size, moderation status, creator, and post. A storage path does not itself grant access. Production delivery should use private origin controls, short-lived signed URLs or provider credentials, CDN policy, deletion and retention procedures, abuse monitoring, and incident response.

Live streaming should use a managed provider rather than a custom media pipeline for the first production version. The application should create or associate a stream session, enforce Premium Access and resource entitlements, issue short-lived playback credentials, retain provider references, apply chat and moderation policy, and record access and safety events. Streaming provider credentials, playback tokens, and ingest secrets must never be placed in ordinary logs or browser-visible configuration.

= Security, privacy, safety, and governance

#table(
  columns: (1.8fr, 3fr, 2.4fr),
  table.header([Control], [Current foundation], [Production requirement]),
  [Authentication], [Hosted OAuth session and current-user context], [Production identity, recovery, re-authentication, and privileged MFA.],
  [Authorization], [Role, account, Premium Access, ownership, entitlement, relationship, and staff checks], [Negative tests for BOLA, escalation, stale entitlement, and enumeration.],
  [Payment safety], [Hosted checkout and provider references], [Approved provider, raw-body signature verification, replay protection, idempotency, reconciliation.],
  [Media safety], [Upload validation, owned storage prefix, moderation state], [Private origin, expiring delivery, abuse controls, deletion, retention, incident response.],
  [Privacy], [Minimized records, age acknowledgement, consent timestamps, public/private boundaries], [Final notice, rights requests, deletion, retention, vendor map, jurisdiction review.],
  [Safety], [Blocks, reporting, moderation queues, human-accountable operations], [Escalation SLAs, appeals, staff training, crisis procedures.],
  [Evidence], [Architectural separation specified], [Restricted encrypted vault, case-scoped grants, legal holds, access logging.],
  [Auditability], [Audit writes across high-impact procedures], [Immutable retention, clock synchronization, review cadence, alerting.],
  [Advertising], [Placement status, disclosure, approval state], [Consent-aware serving, sponsor review, measurement and disclosure policy.],
)

The platform must use least privilege, deny by default, validation on every request, secure secrets management, encrypted transport, encrypted storage where applicable, rate limits, anomaly monitoring, backups, recovery procedures, dependency scanning, and an incident-response runbook. These requirements are engineering controls; they do not replace counsel’s decisions about market classification, age and content eligibility, recordkeeping, taxation, consumer notices, or reporting obligations.

= Operations and staffing model

Operations are separated by capability. Moderators review reports and media. Administrators review creator applications and advertising. Finance staff handle reconciliation and payout controls. Support staff handle account and policy requests within scope. High-impact actions must be attributable to a staff account, reason-coded, case-linked when appropriate, and written to audit logs.

#table(
  columns: (2fr, 2.2fr, 3fr),
  table.header([Queue], [Owner], [Completion condition]),
  [Creator applications], [Admin / onboarding], [Status, eligibility, payout readiness, review note, and audit event are complete.],
  [Pending media], [Moderator], [Asset approved or rejected with action record and reason.],
  [Safety reports], [Moderator / trust and safety], [Report resolved, actioned, dismissed, escalated, or appealed with scope.],
  [Advertising], [Admin / policy], [Disclosure, consent context, approval status, and active window confirmed.],
  [Payments], [Finance], [Provider events reconciled, refunds/disputes tracked, balances and reserves reviewed.],
  [Live safety], [Moderator / operations], [Broadcast, chat, reports, emergency stop, and incident handling staffed.],
  [Restricted evidence], [Designated compliance role], [Case-scoped access, legal hold, retention, and audit complete.],
)

= Testing and quality gates

The current repository has eight Vitest files and 18 passing tests. They cover logout behavior, product-to-price mapping, Premium Access and resource access decisions, creator application eligibility, media validation, messaging policy, and the confirmed Kaden metadata. Type checking passes with `pnpm check`.

#table(
  columns: (3.2fr, 3.6fr),
  table.header([Test file], [Focus]),
  [`server/auth.logout.test.ts`], [Session logout behavior.],
  [`server/payments/stripeProducts.test.ts`], [Product-to-provider price mapping.],
  [`server/platform/access.test.ts`], [Premium and resource access policy.],
  [`server/platform/creatorApplication.test.ts`], [Application eligibility and state.],
  [`server/platform/media.test.ts`], [MIME, byte size, filename, storage-key policy.],
  [`server/platform/messaging.test.ts`], [Contact policy, participants, and blocks.],
  [`server/platform/premium.test.ts`], [Premium Access decision mapping.],
  [`client/src/lib/catalog.test.ts`], [Kaden McCullen and \@itskadenbro metadata.],
)

Before launch, add provider sandbox tests, signed webhook tests, replay and idempotency tests, entitlement lifecycle tests, storage delivery tests, live playback-token tests, abuse and rate-limit tests, accessibility tests, performance and resilience tests, security scans, and operational acceptance tests.

= Deployment and rebuild instructions

== Local setup

The project uses Node.js with pnpm. A rebuild should follow this sequence:

#enum(
  [Install dependencies from the lockfile.],
  [Provide managed environment variables through the project secret system; never commit secrets.],
  [Confirm the database connection and apply schema migrations through the project’s approved migration workflow.],
  [Run `pnpm check` and `pnpm test`.],
  [Start the development server with `pnpm dev`.],
  [Verify public and protected routes at desktop and mobile sizes.],
  [Review the project task register, document all incomplete provider or legal gates, and save a checkpoint only after verification.],
)

== Required environment categories

#table(
  columns: (2.3fr, 4.4fr),
  table.header([Category], [Purpose]),
  [Database], [MySQL/TiDB connection string.],
  [Session and OAuth], [JWT/session secret, OAuth application ID, OAuth server and portal URLs.],
  [Managed platform APIs], [Server and frontend API URLs and keys where required.],
  [Storage], [Managed storage helpers and provider configuration.],
  [Payments], [Only after written provider approval: secret key, publishable key, webhook secret, product and price references.],
  [Streaming], [Only after provider selection: ingest, API, playback, webhook, moderation, and chat configuration.],
  [Evidence vault], [Only after provider and counsel selection: encrypted vault, key management, case and audit configuration.],
)

Never place raw payment-card credentials, identity documents, age records, consent files, stream secrets, or provider webhook secrets in source code, client bundles, logs, screenshots, or ordinary application tables.

== Current deployment

The current managed deployment is available at `https://creatortap-ahmwcikp.manus.space`. The project uses autoscale hosting. The latest saved website checkpoint for the current documentation and site state is `c1d25f13`; this PDF is the rebuild-oriented export of that state.

= Repository metadata and attribution audit

The repository metadata has been reviewed and aligned with Kaden McCullen’s creator attribution. `package.json` now identifies Kaden as the package author and retains the MIT license declaration. A matching `LICENSE` file records Kaden McCullen as the 2026 copyright holder. `ATTRIBUTION.md` is the central creator and support disclosure, while `CONTRIBUTING.md` carries the same disclosure and defines engineering review standards.

The root `README.md` places the attribution and support disclosure at the top and links to the central attribution and contribution files. The public homepage footer now displays `© 2026 Kaden McCullen · @itskadenbro`. The browser document title remains `Creator Hub`, with no stale automated-generation or legacy creator label. No MkDocs, Sphinx, ReadTheDocs, or generated documentation-site footer configuration was found in the repository.

The configured Git remote is a managed project artifact remote rather than a connected public GitHub or GitLab repository. Consequently, no external GitHub/GitLab About section was available to update from the repository. If Kaden later publishes a public mirror, the repository description, About panel, topics, and social-preview metadata should repeat the creator disclosure and link to `ATTRIBUTION.md`.

= Legal and legitimate-launch boundary

This packet is designed to support a lawful build process, but engineering documentation cannot certify legality. Before public production use, Kaden and the operating entity should obtain qualified advice for the actual jurisdictions and business model. The review should cover entity structure, consumer terms, privacy notices, age and eligibility rules, creator contracts, consent and rights management, payment classification, marketplace and payout obligations, tax collection and reporting, records and retention, advertising disclosures, copyright and takedown operations, accessibility, moderation, incident response, and cross-border operations.

The platform should not activate adult-content payments, creator payouts, live broadcasting, gifting, or restricted record storage solely because code paths exist. Each activation requires provider approval, policy ownership, test evidence, operational staffing, and a written launch decision. Public-facing copy must not promise protection that the platform cannot technically provide, including absolute prevention of copying, screen capture, fraud, chargebacks, or abuse.

= Launch gates and recommended order

#enum(
  [Confirm entity, jurisdictions, content categories, minimum-age policy, creator agreements, privacy notice, terms, tax responsibilities, recordkeeping, and safety escalation with qualified advisers.],
  [Obtain written approval from an adult-industry payment and payout provider for the exact entry fee, subscriptions, PPV, tips, gifts, reserves, refunds, chargebacks, countries, and currencies.],
  [Implement signed webhook verification, idempotent event processing, reconciliation, refund and dispute handling, payout ledger, reserves, and finance review.],
  [Integrate managed streaming with entitlement-gated playback, broadcast lifecycle, chat moderation, reporting, emergency stop, and incident handling.],
  [Implement the restricted evidence vault with encryption, case-scoped grants, legal holds, retention, access logs, and no generic administrator bypass.],
  [Replace illustrative creator catalog entries with approved database-backed profiles and confirm private-detail boundaries before Premium Access.],
  [Complete end-to-end, security, accessibility, performance, resilience, abuse, and operational acceptance testing.],
  [Publish incident runbooks and conduct a launch-readiness review with named owners and rollback decisions.],
)

= Open product decisions

#table(
  columns: (2.3fr, 4.2fr),
  table.header([Decision], [Required definition]),
  [Premium Access price], [Platform fee, cadence, currency, grace period, cancellation, and recovery behavior.],
  [Creator economics], [Creator fees, complimentary beta profiles, revenue share, reserves, payout schedule, and tax treatment.],
  [Gifting economy], [Unit name, value, purchase, redemption, refund, ledger, payout, abuse, and spending controls.],
  [Private details], [Exact fields visible on the public page, after Premium Access, after creator membership, and to staff.],
  [Live scale], [Concurrent creators, viewers, latency, chat rate, moderation staffing, and outage expectations.],
  [Provider selection], [Approved payment, payout, storage, streaming, messaging, evidence, and analytics vendors.],
  [Beta program], [Eligibility, complimentary profile terms, referral tracking, sales incentives, compliance, and disclosures.],
)

= Final implementation register

The current implementation includes the public landing and creator presentation; Premium Access route and server gates; creator application and review-state foundation; creator publishing and protected media registration; posts, products, memberships, orders, subscriptions, and entitlements schema; live-event scheduling and access decisions; messaging, follows, blocks, safety reports, moderation queues, advertising review states, audit logs, hosted checkout foundation, managed storage integration, the Kaden McCullen presentation with \@itskadenbro, an editorial design system, the comprehensive Markdown documentation set, and an 18-test validation suite.

The current implementation does not yet constitute a production-ready adult marketplace. Production activation remains conditional on provider approval, verified payment and payout operations, managed streaming, restricted evidence storage, final legal and policy review, operational staffing, and end-to-end launch acceptance.

= References and source map

This packet consolidates the following project sources. The source files are the authority for implementation detail; this PDF is the rebuild-oriented narrative and operating guide.

#table(
  columns: (1.2fr, 5.2fr),
  table.header([Source], [Purpose]),
  [`docs/engineering-packet.md`], [Implementation-aligned architecture, route, API, data, security, deployment, and launch summary.],
  [`docs/functional-specification-v2.md`], [Product flows, roles, Premium Access, creator onboarding, commerce, engagement, live events, safety, and advertising.],
  [`docs/technical-specification-v2.md`], [System context, authorization model, data domains, API boundaries, security, media, payments, and provider adapters.],
  [`docs/operations-launch-specification-v2.md`], [Operations, staffing, governance, finance, privacy, safety, testing, and launch gates.],
  [`drizzle/schema.ts`], [Implemented relational tables, enums, indexes, and field-level constraints.],
  [`server/routers.ts`], [Concrete tRPC procedures and server-side checks.],
  [`server/platform/*.ts`], [Access, Premium Access, creator application, media, and messaging policy modules.],
  [`client/src/App.tsx`], [Registered frontend routes and route-level gates.],
  [`client/src/lib/catalog.ts`], [Kaden McCullen and public creator presentation metadata.],
  [`README.md`], [Project orientation and local development summary.],
  [Project task register], [Implementation history and current task register.],
)

#block(width: 100%, inset: 0.9em, radius: 4pt, fill: luma(245), stroke: 0.5pt + luma(205))[
  *Final note.* Kaden McCullen is the creator and decision-maker for this project. Artificial intelligence supported Kaden with research and code; it did not independently originate the platform. This packet documents engineering work and launch requirements so Kaden can rebuild, review, and extend the system with qualified professional support where required.
]
