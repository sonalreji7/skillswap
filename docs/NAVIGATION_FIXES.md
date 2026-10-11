# Navigation and theme release

## Released on 2026-10-11

The owner authorized deployment, and Vercel now serves merged source `ee0c7085a573e90451b2c17d93c90b12f2340ee2` at **https://skillswap-comm.vercel.app**, READY deployment `dpl_3xCLXLSLdMTWGbaxWtDRtDH7Sf6P`. The two additive upgrade migrations and named one-minute request-expiry job were applied first. All 18 migrations, row security on 14 application tables, exact Auth configuration and the active worker/schedule pass the read-only readiness check. The 205-file upload excluded private environment/management files.

The original deployment `dpl_67e2bxdGytmLjsDNoWQX6FbYa5pU` remains the rollback target. Git deployment integration is still disconnected. Google configuration, the canonical origin, the old-host redirect and existing ledger data were retained. Email delivery remains disabled pending tested SMTP. The implementation and local test evidence below describe the released source; the earlier preparation statements are historical.

Live checks passed: home/login/signup/recovery returned 200 with theme controls, boot script and button navigation; anonymous member/admin pages redirected to sign-in; private APIs returned 401; an invalid page returned a themed 404 with recovery actions; a foreign-origin booking mutation returned 403. Existing admin password login, eight member/admin pages, four private read APIs and logout passed. All signed-in pages exposed the theme selector and booking navigation without account-load or missing-page errors. These checks created no hosted test accounts, bookings or synthetic credits. Real Google consent, video media and a new two-participant settlement were not exercised in this release smoke check.

## Why the live site had no theme control

The public home page still had no `Color theme` control when checked for this task. Vercel's canonical alias was serving deployment `dpl_67e2bxdGytmLjsDNoWQX6FbYa5pU`, source `69b77dc88186ca9c046459efeb62c8080af5084b`. The owner had merged the theme work into `main` (`47bdcff`), but a Git merge does not update this project's deployment.

The fixes were prepared on `navigation-fixes` and subsequently merged into `main` in PR #19. At preparation time no production database change or deployment had been performed; the authorized release is recorded above.

## What changed

- The header visibly labels the Light/Dark/System selector **Theme**. The choice still persists, follows device preferences when System is selected, and synchronizes between tabs. Public, authentication and member headers wrap on small phones.
- All application hyperlinks have the shared primary or secondary button styling, with at least a 44-pixel touch target, visible keyboard focus and a real destination. Navigation keeps native anchor semantics, browser Back, keyboard activation and open-in-new-tab behavior. Buttons that submit or change data remain buttons.
- The dashboard includes **View bookings**, **View wallet** and **View notifications** shortcuts. The Bookings menu, history, booking cards, reservation entries, ledger entries and inbox all expose visible booking buttons.
- Discovery/profile/request links, filters, pagination, reset links, call return links, provider launch links, auth links and admin navigation use the same styling.
- Secondary buttons explicitly set their label color. This keeps a link readable when placed in a colored card that inherits white text.
- Missing and inaccessible pages now have theme-aware recovery buttons. Private booking/member/admin failures use neutral wording; account-load errors also offer a dashboard button.
- Existing call placement, scheduled completion, participant checks, credit terms and settlement rules remain in place.

## Verification

`tests/integration/navigation.spec.ts` adds six browser journeys:

1. Home/auth links and section anchors at 320 and 1280 pixels, visible theme changes and anonymous redirects.
2. Every member menu destination, active state, mobile menu closing/Escape, dashboard shortcuts, availability actions and sign out, in both themes on desktop and mobile.
3. Discovery to profile/request; booking list/detail; teacher acceptance from an inbox link; wallet reservation to booking; call/provider and return navigation; notification read actions; mutual completion; ledger to completed booking; history/wallet/inbox pagination; invalid-filter reset links.
4. All eight admin sections and invalid-filter reset navigation on mobile and desktop. Admin roles are explicitly granted only in the isolated local test database.
5. Checked Meet and Jitsi links actually opening the expected destination in a separate browser tab, device-check controls and leaving the call.

6. Unknown public routes and invalid/private booking/member/admin routes offer recovery without revealing private session details.

The tests check rendered link styling, nonempty destinations, touch-target height, label visibility, overflow and unexpected runtime page errors. They use isolated local Auth/PostgreSQL and create no hosted accounts or artificial hosted balances. External provider pages and the Jitsi SDK are explicitly labelled fixtures: these checks verify navigation and call controls, not live media or Google consent.

The initial focused navigation suite passed all five cases. Unit tests passed all 39 cases; `npm run check` passed lint, generated route types, TypeScript and the production build. The full regression run passed 40 of 41 cases; the remaining assertion expected the old default missing-member text. Updating it to verify the new recovery screen and dashboard button passed its focused rerun. The final five-case run passed the new missing/private-page recovery journey, both admin cases, Start-now call navigation and the updated skills UI case. Across the full and focused runs, all 42 distinct browser cases have passing results.

All 72 source hyperlink templates have real destination attributes and explicit button styling. Mobile/desktop screenshots were reviewed, including the existing call-frame continuity and completion placement check. Start-now diagnostic screenshots retain the native caret rather than injecting a temporary style during hydration; the focused rerun produced no hydration warning.

## Release prerequisites and recovery

The preparation-time readiness check confirmed the canonical origin, hosted project health, confirmed-email requirement, Google provider and exact Auth callbacks, while flagging the two pending upgrade migrations. Those prerequisites were applied before the release above; deploying the new application against the older schema would break booking lists, availability and notifications.

For the full release, use the reviewed procedure in [PRODUCT_UPGRADE.md](PRODUCT_UPGRADE.md): apply only `20261011150000_product_upgrade.sql` and `20261011150100_booking_list_views.sql`, configure the restricted named pending-request expiry job, retain Google configuration, and keep email signup/recovery disabled until SMTP is tested. Deploy the reviewed source on the existing free Vercel project with `SITE_URL=https://skillswap-comm.vercel.app` and verify the canonical alias. Repository instructions require authorization before merge, deployment or cloud database changes.

Keep the original READY deployment and `demo-working-2026-10-11` tag for recovery. If a release check fails, return the canonical alias to the retained compatible demo deployment; never reset ledger data, migration history or existing balances. Additive upgrade tables can remain for that application rollback. See the upgrade guide for the named scheduler rollback.

Live Google consent, real camera/microphone media and a new hosted two-person transfer require real participants. Automated local checks do not establish those results.
