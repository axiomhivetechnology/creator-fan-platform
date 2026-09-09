# Developer Editor IDE Specification

> **Creator and support disclosure:** The creator of this project is **Kaden McCullen**. Kaden independently came up with the project, its direction, and its requirements. To support Kaden, artificial intelligence provided Kaden research and code to support their project; it did not independently originate the project or make the product decisions.

## Purpose

The Developer Editor is an admin-only workspace for low-risk public-site customization. It provides an IDE-inspired file tree, structured settings editor, live draft preview, reset behavior, and audited save behavior without exposing server authorization, payment credentials, payout readiness, creator identity, or restricted compliance evidence.

## Editable settings

The editor persists a singleton `siteSettings` record with brand name, header attribution, membership label, hero eyebrow, hero title line, hero accent line, hero description, and two public visibility flags for the early-circle and safety panels. All text is trimmed and length-bounded with a shared Zod schema before persistence.

| Surface | Editable | Reason |
|---|---:|---|
| Brand name | Yes | Public presentation copy only. |
| Header attribution | Yes | Public attribution strip. |
| Hero copy | Yes | Public marketing narrative. |
| Membership label | Yes | Public presentation label. |
| Early-circle panel | Yes | Public visibility flag. |
| Safety panel | Yes | Public visibility flag; disabling it should require a separate launch review. |
| Featured creator identity | No | Remains catalog- and verification-controlled. |
| Payment or payout settings | No | Requires provider and finance controls. |
| Premium Access authorization | No | Server policy, not presentation configuration. |
| Compliance evidence | No | Must remain in the approved restricted evidence system. |

## Custom notifications

The Developer Editor includes a Custom Announcements workspace. An administrator can author a bounded title and message, select one of four severities (`info`, `success`, `warning`, or `urgent`), select an audience (`everyone`, `fans`, `creators`, `staff`, or `admins`), publish the announcement, and deactivate or reactivate it. Active announcements are delivered through a global site banner with severity styling, local dismissal, and audience filtering. Scheduling fields are supported by the persistence model and validation layer for future expansion.

Notifications are stored in `siteNotifications`, never inserted as hardcoded demo content. The server filters active windows and audience eligibility before delivery. Create and status changes use administrator-only tRPC procedures and append audit events `developer.notification_created` and `developer.notification_status_changed`.

## Access and audit behavior

The `/developer` route is rendered inside the authenticated dashboard shell and appears in navigation only for users whose role is `admin`. The server mutation uses `adminProcedure`, which requires an authenticated administrator. A successful update writes the singleton settings record and creates an `auditLogs` row with action `developer.site_settings_updated`, target `site_settings`, actor ID, changed fields, and editor context.

Public pages read the settings through `siteSettings.current`. If the database is unavailable or the record is absent, the application uses safe defaults so public rendering remains deterministic. The creator catalog remains the source of truth for Kaden McCullen and `@itskadenbro`; the editor cannot rewrite creator identity.

## Rebuild sequence

To rebuild this feature, add the `siteSettings` table to the relational schema, generate and apply the migration, add database helpers for defaulted reads and administrator upserts, add a public query plus administrator-only mutation, and mount the `/developer` route inside the dashboard shell. Build the editor as a structured form with a read-only protected-boundaries panel and a draft preview. Add tests for safe defaults and schema rejection, then run type checking, the full test suite, and responsive visual verification.

## Launch notes

This editor is a customization control plane, not a code execution environment. It intentionally does not accept arbitrary JavaScript, CSS, SQL, payment credentials, storage keys, streaming keys, or compliance documents. A later expansion to true source editing would require sandboxed compilation, diff review, signed releases, rollback, branch isolation, and an independent security review.
