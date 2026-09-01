---
name: hotcinema-ui-finisher
description: Orchestrates end-to-end completion and hardening of the HotCinema React frontend. Use when asked to finish, polish, standardize, audit, or make the HotCinema UI production-ready across customer, booking, auth, or admin routes.
metadata:
  project: HotCinema
  area: frontend-ui
  version: "1.0"
---

# HotCinema UI Finisher

Use this skill as the coordinator for broad HotCinema UI work. Preserve working business behavior while driving the frontend toward a consistent, responsive, accessible, testable UI.

## Scope and safety

- Work primarily under `Frontend/` unless the user explicitly asks for backend changes.
- Do not redesign backend-authoritative booking, payment, promotion, inventory, ownership, or seat-state rules in the frontend.
- Do not run, rerun, dispatch, or modify GitHub Actions unless the user explicitly asks. Prefer local checks.
- Do not push completion changes directly to `main`/`master` when a working branch can be used.
- Do not open a pull request automatically unless the user asks, because this repository's CI runs on `pull_request`.
- Do not introduce another component library for controls already covered by `Frontend/src/components/ui/*`.
- Preserve intentional media styling, QR scan surfaces, chart series colors, and semantic seat-state colors.

## Always read first

From the repository root, inspect:

1. `Frontend/SHADCN_STYLE_GUIDE.md`
2. `Frontend/package.json`
3. `Frontend/src/router/user.routes.jsx`
4. `Frontend/src/router/admin.routes.jsx`
5. `Frontend/src/styles/shadcn-system.css`
6. `Frontend/src/index.css`
7. Relevant shared primitives in `Frontend/src/components/ui/`

Treat `SHADCN_STYLE_GUIDE.md` as the design-system contract unless the user explicitly changes that contract.

## Workflow

### 1. Build the route and surface inventory

Derive routes from the router files instead of relying on a stale hard-coded list. Group them into:

- Auth
- Customer discovery: home, movies, movie detail, cinemas, schedules, search
- Member account: profile, notifications, booking history/detail
- Booking funnel: booking entry, seat selection, payment, callback, success, failure
- Admin workspace: dashboard, movies, cinemas/seats, schedules, bookings, users, comments, reports, promotions, F&B, staff, permissions, payment, settings, notifications

For each route, identify the main feature components and shared primitives it consumes.

### 2. Establish the current UI debt

Apply the sibling skill `hotcinema-ui-auditor` when available. At minimum inspect:

- legacy hard-coded application colors
- duplicate or compatibility CSS
- raw controls that duplicate shared primitives
- inconsistent page headers, cards, tables, filters, dialogs, status badges, spacing, radii, shadows
- missing loading, empty, error, disabled, unauthorized, disconnected, or retry states
- likely mobile overflow and breakpoint failures
- keyboard/focus/label issues
- oversized feature components whose UI responsibilities should be extracted before further visual work

Classify findings as:

- **P0**: broken flow, inaccessible core control, severe mobile breakage, hidden content, unusable booking/payment/admin action
- **P1**: design-system divergence, missing state, significant responsive inconsistency, duplicated primitive
- **P2**: polish, density, spacing, hierarchy, motion, minor consistency

Fix P0 before P1, and P1 before broad cosmetic P2 work.

### 3. Close the design-system migration

Apply `hotcinema-design-system-migrator` when relevant.

Required direction:

- Prefer `Button`, `Input`, `Form*`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Card`, `Alert`, `Dialog`, `ResponsiveDialog`, `Drawer`, `DropdownMenu`, `Popover`, `Tooltip`, `DataTable`, `StatusBadge`, `MetricCard`, `Skeleton`, and other existing shared primitives.
- Use semantic tokens such as `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, and `ring` for normal application UI.
- Migrate compatibility CSS only when the touched usage has been converted; do not remove a compatibility selector that is still required elsewhere.
- Extract repeated patterns into feature/shared components instead of copying class strings.

### 4. Finish route state coverage

Apply `hotcinema-ui-state-finisher` when relevant.

For each data-driven route verify, where applicable:

- initial loading or skeleton
- loaded content
- empty result
- partial data
- recoverable API error with retry path
- destructive-operation confirmation
- disabled/submitting state
- authentication/authorization state
- disconnected/reconnecting real-time state
- payment pending/success/failure/callback state

Do not fabricate business results when an API call fails.

### 5. Verify responsive behavior and accessibility

Apply `hotcinema-responsive-a11y` when relevant.

Minimum target widths:

- 320 px
- 390 px
- 768 px
- 1024 px
- 1440 px

Also inspect dense admin layouts near 1600-1920 px where useful.

Explicitly check:

- no unintended page-level horizontal scroll
- header/sidebar/content do not overlap
- sticky elements do not cover controls
- tables and seat maps use intentional scoped overflow when necessary
- buttons and links remain reachable by keyboard
- focus-visible state is visible
- icon-only actions have accessible names
- active navigation exposes current state
- dialog/drawer focus behavior remains correct
- motion is not required to understand state

### 6. Add or update visual regression coverage

For broad UI changes, apply `hotcinema-visual-regression` when the environment permits browser testing.

Prioritize screenshots for:

1. Home
2. Movies + movie detail
3. Cinemas/schedule
4. Seat selection
5. Booking payment
6. Booking success/failure
7. Profile/history
8. Admin dashboard
9. Admin data tables/forms
10. Admin cinema/seat management

Cover mobile and desktop; cover both themes for shared UI changes.

### 7. Run local quality gates

From `Frontend/`, run the applicable local commands:

```bash
npm run audit:ui
npm run lint
npm test
npm run build
```

Use `npm run audit:ui:strict` only when intentionally driving to a zero-violation gate. A strict failure caused by approved media/QR/chart/seat exceptions must be fixed in the audit policy or documented precisely; do not mechanically change correct product styling.

If visual tests exist, run the relevant local visual test command too.

Do not use GitHub Actions as a substitute for local verification.

## Definition of done

A UI completion task is not done until the touched surface satisfies all applicable conditions:

- shared primitives are reused rather than duplicated
- ordinary application colors use semantic tokens
- responsive layout is usable from 320 px upward
- keyboard focus and accessible naming are present
- loading/empty/error/disabled states are coherent
- light/dark behavior is valid when the surface uses theme tokens
- intentional media, QR, chart, and seat colors remain semantically correct
- no new compatibility CSS is introduced without necessity
- no unrelated business-flow behavior is changed
- local lint/tests/build pass, or every remaining failure is reported with file and cause
- visual regressions are checked when browser tooling is available

## Completion report

Return a concise engineering report containing:

- routes/components changed
- P0/P1 issues fixed
- remaining UI debt, if any
- local commands run and their result
- visual/browser checks performed
- explicit note that GitHub Actions were not invoked
