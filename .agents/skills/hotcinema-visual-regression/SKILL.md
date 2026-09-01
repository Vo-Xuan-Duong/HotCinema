---
name: hotcinema-visual-regression
description: Adds and maintains local browser-based visual regression coverage for HotCinema customer, booking, auth, and admin UI. Use for broad styling changes, responsive hardening, shared primitive changes, or when validating that UI cleanup did not break other routes.
metadata:
  project: HotCinema
  area: frontend-visual-regression
  version: "1.0"
---

# HotCinema Visual Regression

Use this skill to verify UI behavior in a real browser instead of relying only on source review, lint, or jsdom tests.

## Safety

- Run browser tests locally in the agent environment.
- Do not run, rerun, dispatch, or modify GitHub Actions unless the user explicitly asks.
- Do not open a pull request automatically because this repository's CI runs on pull requests.
- Never overwrite screenshot baselines merely to make a failing test green. Update baselines only after confirming the visual change is intentional.

## Detect the current setup first

Inspect:

- `Frontend/package.json`
- existing browser/e2e/visual test directories
- Vite configuration
- mock/fixture support under `Frontend/src/mocks/`
- auth and route setup

If Playwright or another established browser test stack already exists, extend it instead of adding a second framework.

If no browser test framework exists and the task requires visual regression coverage, prefer `@playwright/test` for new coverage.

When adding Playwright:

- add it as a dev dependency
- update `package-lock.json`
- keep config/tests under `Frontend/`
- add clear local npm scripts such as `test:e2e` and/or `test:visual`
- install only the browser(s) needed for the current local task when environment cost matters
- do not add a GitHub Actions workflow unless the user explicitly requests CI integration

## Route matrix

Derive current routes from:

- `Frontend/src/router/user.routes.jsx`
- `Frontend/src/router/admin.routes.jsx`

Do not maintain a permanently stale copied route list when it can be generated/read from source.

Prioritize visual coverage for critical surfaces:

1. Home
2. Movies list
3. Movie detail
4. Cinemas / cinema detail / schedule
5. Search
6. Seat selection
7. Booking payment
8. Payment callback/result surfaces
9. Booking history/detail
10. Profile/notifications
11. Admin dashboard
12. Admin list/table screens
13. Admin create/edit forms
14. Admin cinema/seat/schedule management

## Viewport coverage

For broad route coverage, use a minimal high-signal matrix rather than exploding combinations.

Recommended core projects or explicit viewport checks:

- mobile: 390 x 844
- desktop: 1440 x 1000

For responsive defects, add targeted checks at:

- 320 px width
- 768 px width
- 1024 px width

For dense admin pages, inspect a wide desktop viewport where useful.

## Theme coverage

When changes affect global tokens, shared primitives, layout shell, or components used in both themes:

- capture light theme
- capture dark theme

For isolated media overlays or feature-specific changes, theme duplication is optional if semantic surfaces are unaffected.

## Deterministic visual state

A screenshot test is useful only when its state is stable.

Prefer, in order:

1. existing deterministic mock/fixture mode in the repo
2. Playwright network interception with stable fixtures
3. a known local backend test dataset

Avoid depending on uncontrolled production/external data for screenshot baselines.

Stabilize common nondeterminism where necessary:

- disable or finish nonessential animations/transitions before capture
- wait for route data and fonts/images needed by the assertion
- use fixed test data for dates/times/countdowns when practical
- avoid screenshotting transient toasts unless the toast itself is under test
- mask or isolate genuinely nondeterministic regions instead of masking the entire meaningful UI

Do not hide real layout shifts with arbitrary sleeps. Wait for an observable stable condition.

## Authentication

For protected member/admin screenshots:

- prefer reusable authenticated storage state when credentials/test auth are available
- otherwise use the repository's deterministic mock/test mode if it can represent the required role
- never commit real user credentials or tokens
- keep local secrets in environment variables or ignored files

If protected visual coverage cannot be executed in the current environment, still build the harness for public routes and report the auth coverage gap explicitly.

## Screenshot assertions

Organize tests so failures identify the route, viewport, and theme.

Good screenshot targets:

- whole-page screenshot for route shell/layout regressions
- component/region screenshot for dense tables, seat maps, forms, dialogs, and chart cards when whole-page noise is high

Do not use a huge tolerance to hide meaningful regressions. Configure tolerance narrowly enough to catch broken spacing, overflow, missing content, and theme errors while accounting for minor renderer variance.

## Interaction checks before capture

A visual test should perform critical interactions when the screenshot depends on them, for example:

- open mobile navigation
- open a filter/dropdown/dialog
- select a seat in deterministic booking data
- display validation errors
- switch theme
- expand responsive admin controls

For accessibility behavior such as keyboard focus, combine screenshots with semantic assertions; a screenshot alone is not enough.

## Baseline policy

When a screenshot changes:

1. inspect the diff
2. determine whether the change was intentional
3. check at least nearby route/shared-component consumers
4. update the baseline only after the new rendering satisfies the design-system and responsive contract

Never bulk-update all baselines after an unexplained shared primitive change.

## Suggested local commands

Use the actual scripts present in `Frontend/package.json`. If this skill introduces Playwright, use scripts similar to:

```bash
npm run test:visual
npm run test:e2e
```

Then also run the normal local frontend gates where relevant:

```bash
npm run audit:ui
npm run lint
npm test
npm run build
```

Do not use GitHub Actions as the test runner.

## Minimum acceptance for broad UI changes

Before claiming a broad UI cleanup is complete:

- critical public customer routes have browser coverage
- booking funnel has at least high-value route/state coverage when deterministic test data exists
- admin shell plus representative table/form routes have coverage when auth can be established
- mobile and desktop screenshots exist for changed responsive surfaces
- both themes are checked for shared theme/component changes
- visual diffs were reviewed rather than automatically accepted
- any untestable protected/dynamic surfaces are listed explicitly

## Report

Report:

- browser framework used or added
- routes/states covered
- viewports/themes covered
- screenshot failures found and fixed
- baselines intentionally updated
- coverage gaps and why they remain
- local commands executed
- explicit confirmation that GitHub Actions were not invoked
