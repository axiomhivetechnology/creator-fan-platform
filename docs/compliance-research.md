# Compliance Research Notes — OnlyFans-Style Platform

## Source Findings

The platform’s sponsored-content workflow should require a creator or brand to identify paid, gifted, affiliate, or otherwise materially connected posts before publication. The Federal Trade Commission describes its Endorsement Guides as addressing material connections between advertisers and endorsers in social-media and influencer marketing, and its influencer guidance states that creators working with brands must make a good disclosure of their relationship to the brand.[1]

The creator-earnings and payout domains must preserve accurate, exportable transaction and adjustment records. The Internal Revenue Service describes the gig economy as income-generating activity frequently conducted through a digital platform and notes that gig-economy income must be reported even when not reported on an information return. Its digital-platform guidance identifies worker classification, payment reporting, and tax filing as platform concerns.[2]

## Implementation Consequences

| Domain | Initial product control | Boundary |
|---|---|---|
| Sponsored content | A required sponsorship label, disclosure status, advertiser/creator attribution, review state, and audit event. | This supports an operational workflow; jurisdiction-specific disclosure text remains subject to legal review. |
| Creator income | Append-only ledger entries for gross sale, platform fee, refund, chargeback, reserve, payout, and adjustment records. | The website provides transaction records but not tax advice or automatic tax filings. |
| Payouts | A creator payout-readiness status and a provider integration seam. | Production payout activation needs payment-provider, KYC, tax, and legal configuration. |
| Safety | Age acknowledgement and account/content review states that gate relevant experiences. | Age assurance, jurisdiction eligibility, and any adult-content rules require formal policy and counsel decisions before launch. |

## References

[1]: https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews "Federal Trade Commission — Endorsements, Influencers, and Reviews"
[2]: https://www.irs.gov/businesses/gig-economy-tax-center "Internal Revenue Service — Gig Economy Tax Center"
