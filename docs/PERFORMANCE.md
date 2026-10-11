# Navigation performance

## Measured delay

On 2026-10-11, the canonical production deployment `dpl_3xCLXLSLdMTWGbaxWtDRtDH7Sf6P` (source `ee0c708`) ran its functions in Washington, D.C. (`iad1`), while Supabase runs in Mumbai (`ap-south-1`). Both Vercel deployment metadata and response region headers confirmed this placement.

A read-only authenticated check used the existing administrator, loaded each route twice sequentially, consumed the full response and signed out. It created no accounts, bookings or credits. The following measurements include this cloud workspace's network/proxy overhead; they are small samples, not a benchmark of an Indian phone or a guarantee of typical user latency.

| Page | First response, ms | Second response, ms |
| --- | ---: | ---: |
| Dashboard | 3,336 | 2,155 |
| Discover | 2,614 | 1,676 |
| Bookings | 2,444 | 1,297 |
| Wallet | 2,725 | 2,356 |
| Notifications | 2,132 | 1,712 |
| Profile | 2,220 | 1,634 |

The twelve page responses averaged **2,192 ms**. The unread-notifications API took 1,755 and 1,675 ms. Every private response correctly remained uncached; caching account balances or bypassing identity checks is not the proposed fix.

## Production result

The performance release is live at **https://skillswap-comm.vercel.app**, source `a565076afb1c7b8bf7f8492fa5f9a4173f20db14`, READY deployment `dpl_3KgcQpsSPinSrAJ38efXXgsfTKKe`. Deployment metadata and every measured dynamic response confirm Mumbai (`bom1`). The existing Hobby plan, Node 24, Auth origin, Google configuration, 18 migrations and ledger data were retained.

| Page | Before mean, ms | After mean, ms |
| --- | ---: | ---: |
| Dashboard | 2,746 | 930 |
| Discover | 2,145 | 594 |
| Bookings | 1,870 | 830 |
| Wallet | 2,540 | 881 |
| Notifications | 1,922 | 458 |
| Profile | 1,927 | 920 |

Across the same twelve page samples per stage, the mean fell from **2,192 to 769 ms**, a **64.9% latency reduction**. The notification API mean fell from 1,715 to 1,046 ms. All after-release responses were 200 and `MISS`, preserving private freshness. This compares full HTTP response completion from the cloud workspace; physical-phone interaction timings and broader latency percentiles have not been measured.

The first API-created release, `dpl_Aw49WytenoxzuuSttawQ6e2AW1Vv`, retained `iad1` despite the repository region setting. After checking actual deployment metadata and live response headers, the project default was explicitly changed through Vercel's documented `resourceConfig.functionDefaultRegions` setting to the single region `bom1`, and the same reviewed source was rebuilt. Both project configuration and repository configuration now select Mumbai. The original UI release remains READY for rollback.

## Changes released

- `vercel.json` selects **Mumbai (`bom1`)** so function/database traffic stays in the same region. Vercel documents that this overrides the project default and that Hobby supports any single region; no plan upgrade or multi-region deployment is requested.
- Independent profile, timezone and reputation reads execute together. Dashboard availability, discovery filters/results, request details and booking detail reads also overlap where their authorization dependencies allow it. Profile/participant guards still precede protected booking reads, and financial actions retain their existing database transactions.
- Background page refreshes retain a guard until their React transition commits. The previous microtask guard could expire while the response was still pending. Hidden-page suppression, refresh intervals and timer/listener cleanup remain in place.
- Header links show a fixed-size pending indicator and an accessible announcement. On phones, the menu stays available during a blocked transition and closes when the destination changes; clicking the current destination still closes it. Native link semantics remain intact.
- The shared loading boundary displays neutral page skeletons. Authentication in the member layout remains authoritative, and private data is not included in placeholders.
- Booking and discovery GET filters use Next.js `Form` for client navigation, keeping the document, header and theme instead of reloading the whole page. Field names and query validation are retained; native GET submission remains the fallback before JavaScript is ready.

Vercel references: [function regions](https://vercel.com/docs/functions/configuring-functions/region), [project region configuration](https://vercel.com/docs/project-configuration/vercel-json#regions), and [region codes](https://vercel.com/docs/regions). Next.js behavior was checked against the installed 16.4 documentation before implementation. The deprecated `preferredRegion` export is not used.

## Verification and release

Local unit tests pass all 39 cases, and lint, route generation, TypeScript and the production build pass. Three new browser scenarios verify delayed desktop/mobile navigation with a usable theme control, coalesced focus/visibility refreshes that resume after the response, and filter submission preserving the document/header/theme. They use the isolated local database and intentionally delay real RSC requests; no external-provider timing is inferred from them. Test-owned skill selections are cleared afterwards without deleting ledger history.

The refresh regression was also run against the previous `live-refresh.tsx`: it failed because three RSC requests began while the first was held. Restoring the fix passed with only one request, then verified that another refresh could begin after completion. This baseline failure is deliberate evidence of the old bug, not a failure of the final fix.

The full application regression passed all 44 cases (11.5 minutes), including actual elapsed demo settlement and call-frame continuity. After the filter transport change, the final seven-case affected-flow run passed, including the additional document-preservation regression; all 45 distinct browser scenarios have passing results across the full and focused runs. The final lint/type/build check also passed. Both Vercel builds reached READY; the second is the verified Mumbai production release. No database migration or financial rule change was required. Git pushes do not currently auto-deploy.

Hosted readiness passes all 15 configuration checks. Live public/Auth pages include themes and button links, private pages redirect anonymous requests, private APIs return 401, foreign-origin booking requests return 403, and missing pages return themed 404 recovery. Real Google consent, video media and another hosted two-person transfer were not exercised by these HTTP checks.

Existing admin password login/logout also pass. Dashboard, discovery, bookings, wallet, notifications, community, profile and administration all return 200 with theme and booking navigation, without missing-page or account-load errors. Me, bookings, wallet and admin-overview read APIs return 200. These checks use a scoped existing session and create no hosted test accounts, bookings or synthetic credits.

Retain the previous READY deployment `dpl_3xCLXLSLdMTWGbaxWtDRtDH7Sf6P` and pushed Git tag `release-before-performance-2026-10-11` (source `ee0c708`) for application rollback. The earlier `demo-working-2026-10-11` release remains retained too. Promoting an existing deployment retains its built region; rebuilding old source uses the project default unless deliberately changed. Do not reset migration history, ledger entries or existing balances to roll back application code. Google consent, actual video media, SMTP delivery and latency on the owner's physical phone remain separate manual checks.
