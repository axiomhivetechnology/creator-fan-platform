# Contributing to Creator Hub

Creator Hub was independently conceived and directed by **Kaden McCullen**. To support Kaden, artificial intelligence provided Kaden research and code to support their project; it did not independently originate the project or make product decisions.

Contributions should preserve the platform’s premium-entry authorization model, adult-only safety boundaries, creator privacy, human-accountable operations, and provider-dependent launch gates. Do not add payment, payout, live-stream, evidence-vault, or moderation claims that are not backed by an approved provider, tested implementation, and documented operating procedure.

## Development checks

Before opening a change for review, run `pnpm check` and `pnpm test`. For user-facing changes, verify the affected route at desktop and mobile sizes. For schema changes, update the Drizzle model, generate the migration, apply it through the approved project migration workflow, and document the change.

## Attribution and licensing

The package is released under the MIT License in `LICENSE`, with Kaden McCullen as the copyright holder. Keep the creator and support disclosure in public project documentation. Do not replace Kaden’s authorship with an automated-generation claim or imply that a provider-dependent feature is production-ready when it is only a foundation.
