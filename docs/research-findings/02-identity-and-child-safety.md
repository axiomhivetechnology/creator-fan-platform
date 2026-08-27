# Research Findings 02 — Identity Assurance and Child-Safety Escalation

**Research date:** 2026-08-27  
**Status:** Design input; not legal advice.

## Verified Sources

| Source | Confirmed finding | Product/specification impact |
|---|---|---|
| [NIST SP 800-63 Digital Identity Guidelines](https://pages.nist.gov/800-63-3/) | The NIST page states that SP 800-63-3 was superseded by SP 800-63-4 on August 1, 2025 and points to the current digital-identity guidance. It identifies separate identity-proofing, authentication/lifecycle-management, and federation/assertion subjects in the suite. | The platform must use a risk-based identity design, and should distinguish account authentication, creator/performer identity proofing, age/eligibility verification, payout/KYC verification, and privileged-staff MFA/re-authentication. Product requirements must reference the current NIST suite during vendor and control selection, rather than treating a UI age checkbox as identity proofing. |
| [NCMEC CyberTipline](https://www.missingkids.org/gethelpnow/cybertipline) | NCMEC describes the CyberTipline as a centralized reporting system for online exploitation of children and states that the public and electronic service providers can make reports of suspected online exploitation. The page also describes staff review and routing information to appropriate law-enforcement agencies for possible investigation. | The platform requires a prohibited-content incident runbook: immediate upload/publication/access stop, restricted evidence preservation, designated escalation owner, documented legal/incident process, and appropriate external reporting decision path. Staff-facing systems must never expose sensitive incident details beyond a strict need-to-know scope. This is not a substitute for counsel-defined reporting obligations. |

## Required Design Rules

### Identity and access

The platform must not use a self-attested “I am 18+” statement as the sole creator/performer eligibility control. A production design needs separate states for `acknowledged`, `verification_started`, `verification_pending`, `verified`, `failed`, `expired`, `reverification_required`, and `restricted`. It must retain the minimum necessary verification outcome and vendor reference in the ordinary account domain; restricted identity/evidence records must be segregated.

For fan accounts, the Premium Access sign-up flow must apply age/eligibility controls aligned to the launch jurisdiction and risk policy before accepting participation. For staff and administrators, MFA and re-authentication are mandatory before high-impact actions such as account restrictions, compliance-evidence access, moderation disposition, payout changes, role assignment, or policy configuration.

### Child-safety incidents

The content and live-event pipeline must include a high-priority safety event path that is functionally separate from ordinary reports. The pipeline must freeze current and future distribution, preserve a tamper-evident evidence reference, stop messaging/contact paths associated with the affected account as required by policy, prevent staff from downloading or casually browsing restricted evidence, and open a confidential escalation case. Exact preservation, notification, reporting, and law-enforcement interaction steps require legal review and must be executed only by assigned personnel.

## References

[1]: https://pages.nist.gov/800-63-4/ "NIST SP 800-63-4 Digital Identity Guidelines"
[2]: https://www.missingkids.org/gethelpnow/cybertipline "NCMEC — CyberTipline"
