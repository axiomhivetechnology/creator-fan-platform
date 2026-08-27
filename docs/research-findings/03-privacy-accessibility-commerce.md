# Research Findings 03 — Privacy, Accessibility, Copyright, and Commerce

**Research date:** 2026-08-27  
**Status:** Design input; not legal, tax, or regulatory advice.

## Verified Sources and Resulting Requirements

| Source | Confirmed finding | Product/specification impact |
|---|---|---|
| [California DOJ — CCPA](https://oag.ca.gov/privacy/ccpa) | The page describes CCPA consumer rights including notice, knowledge/access, deletion subject to exceptions, correction, opt-out of sale or sharing, non-discrimination, and limits on use/disclosure of sensitive personal information. It identifies information concerning sex life or sexual orientation among examples of sensitive personal information. | Treat account, payment, identity/age evidence, content-access activity, communications, sexual-orientation/sex-life-related data, and precise geolocation as highly sensitive in the data inventory. Build privacy notice/versioning, request intake/authentication/workflow, deletion/exception handling, preference/consent, global privacy control handling where applicable, and vendor/subprocessor records. Confirm applicability and final disclosure requirements with privacy counsel. |
| [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | WCAG 2.2 is a W3C Recommendation with testable success criteria; the W3C encourages the most current version. The source notes criteria for text alternatives, time-based media/captions, focus, target size, and accessible authentication among its requirements. | Adopt WCAG 2.2 AA as the documented target unless a different obligation is confirmed. The age/identity, Premium Access, checkout, creator upload, video/live, messaging, reporting, and account-recovery flows require manual and automated accessibility testing. Distinctive typography can be editorial but cannot be the only way to convey mandatory content. |
| [U.S. Copyright Office — DMCA Designated Agent Directory](https://www.copyright.gov/dmca-directory/) | The Copyright Office states that certain online service providers seeking DMCA safe-harbor protection must designate an agent, make qualifying contact information public on their site, and provide it to the Office. The page also lists elements of an effective claimed-infringement notice and says a provider must respond expeditiously after receiving a qualifying notice to remove or disable access. | Provide a copyright/DMCA policy, public agent details after counsel-approved designation, notice/counter-notice case intake, resource location, status/decision audit, restricted evidence references, creator notification, and an expeditious removal/disable workflow. Safe-harbor eligibility and statutory details require counsel confirmation. |
| [PCI Security Standards Council — Standards](https://www.pcisecuritystandards.org/standards/) and [Merchant Resources](https://www.pcisecuritystandards.org/merchants/) | PCI DSS is described as baseline technical and operational requirements protecting environments that store, process, or transmit payment-account data. PCI SSC identifies merchant/system scope and notes that encryption alone does not necessarily remove an environment from scope. | Use a provider-hosted checkout/portal or a validated payment-element pattern that keeps raw card entry out of Creator Hub. Never log card numbers/CVV/PAN-equivalent data. Maintain an asset/script inventory for payment pages, change control, vendor assessment, webhook verification, and a provider-confirmed PCI scope/validation plan. |
| [Stripe Connect](https://docs.stripe.com/connect) | The page describes platform/marketplace payment patterns, connected-account onboarding, verification information, fees, charge splitting, balances, and payouts. | These patterns describe generic marketplace architecture, but the separate Stripe restricted-business source means they must **not** be assumed available for the adult-entertainment use case. The product requires an approved adult-industry acquirer/provider with equivalent documented capabilities. |
| [FTC — Negative Option Rule materials](https://www.ftc.gov/legal-library/browse/rules/negative-option-rule) and [IRS — Gig Economy Tax Center](https://www.irs.gov/gig) | FTC materials address recurring subscription/negative-option practices; the IRS describes digital-platform considerations around classifying workers, reporting payments, and paying/filing taxes. | The recurring-billing design must show price, recurring cadence, material terms, cancellation mechanism, confirmation/receipt, renewal/failure behavior, and audit trail. The financial model needs provider/accounting exports, creator settlement records, adjustment history, payout-ready account evidence, and a tax/worker-classification review process. Final obligations depend on the chosen model and jurisdiction. |

## Engineering Design Consequences

The project must replace any “generic payment processor is sufficient” assumption with a **processor-eligibility control**. No payment provider is activated until its underwriting/acceptable-use process confirms support for the exact business, jurisdiction, content, merchant-of-record, recurring subscription, PPV, tipping, refund, dispute, marketplace, and creator-payout model.

The UI must offer a stylized experience without compromising legibility. Old English and cursive type remain decorative/display treatments. Plain-language sans-serif equivalents must be used for account terms, payment consent, age/verification instructions, privacy choices, moderation actions, warnings, and all form controls.

The platform’s privacy, takedown, payment, and safety queues must be built as case-management workflows with authorized access, status, deadline/priority metadata, action rationale, and audit events. Public-facing policies and support routes cannot be buried behind the Premium Access gate.

## References

[1]: https://oag.ca.gov/privacy/ccpa "California Department of Justice — California Consumer Privacy Act"
[2]: https://www.w3.org/TR/WCAG22/ "W3C — Web Content Accessibility Guidelines 2.2"
[3]: https://www.copyright.gov/dmca-directory/ "U.S. Copyright Office — DMCA Designated Agent Directory"
[4]: https://www.pcisecuritystandards.org/standards/ "PCI Security Standards Council — Standards"
[5]: https://www.pcisecuritystandards.org/merchants/ "PCI Security Standards Council — Merchant Resources"
[6]: https://docs.stripe.com/connect "Stripe — Connect"
[7]: https://www.ftc.gov/legal-library/browse/rules/negative-option-rule "Federal Trade Commission — Negative Option Rule"
[8]: https://www.irs.gov/gig "Internal Revenue Service — Gig Economy Tax Center"
