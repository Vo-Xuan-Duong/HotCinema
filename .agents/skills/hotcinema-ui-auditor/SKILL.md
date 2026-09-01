---
name: hotcinema-ui-auditor
description: Audits HotCinema frontend routes and components for design-system drift, legacy styling, missing UI states, accessibility defects, responsive risks, duplicated primitives, and maintainability problems. Use before or during broad UI cleanup and production-readiness work.
metadata:
  project: HotCinema
  area: frontend-ui-audit
  version: "1.0"
---

# HotCinema UI Auditor

Use this skill to establish evidence-based UI debt before changing large parts of the frontend.

## Read first

Inspect:

- `Frontend/SHADCN_STYLE_GUIDE.md`
- `Frontend/src/router/user.routes.jsx`
- `Frontend/src/router/admin.routes.jsx`
- `Frontend/src/components/ui/`
- `Frontend/src/index.css`
- `Frontend/src/styles/shadcn-system.css`
- `Frontend/scripts/audit-shadcn.mjs`

Do not assume every explicit color is a violation. The HotCinema contract permits intentional visual colors for media overlays, QR scan backgrounds, data visualization, and product-semantic seat states.

## Audit method

### Route inventory

Derive the current route list directly from router source. For every route record:

- page component
- layout
- primary feature components
- authentication requirement
- important interaction pattern
- likely responsive complexity

### Design-system audit

Look for:

- application surfaces using raw `white`, `black`, gray, red, blue, green, etc. instead of semantic tokens
- arbitrary hex/rgb/hsl colors that should be reusable theme tokens
- custom button/input/select/dialog/table implementations when shared primitives already exist
- duplicated card, filter bar, page header, status, empty state, confirmation, or toolbar patterns
- excessive page-specific shadows/radii/spacing that diverge from the style guide
- compatibility selectors that no longer have live consumers
- duplicated or malformed global CSS/keyframes

Before flagging a raw color, classify its purpose:

1. normal application UI -> usually migrate
2. media/artwork overlay -> often valid
3. QR scan surface -> white background may be required
4. chart/data series -> explicit series color may be valid
5. seat/status meaning -> use the named semantic product token if one exists

### State audit

For each data-driven screen determine whether it has meaningful behavior for:

- loading
- loaded
- empty
- API failure
- retry
- disabled/submitting
- unauthorized/expired session
- destructive confirmation
- partial data

For booking/realtime/payment also inspect:

- seat hold conflict
- WebSocket disconnected/reconnecting
- booking creation conflict
- payment pending
- payment callback processing
- payment success/failure
- stale or missing route state

### Accessibility audit

Flag:

- clickable `div`/`span` used instead of semantic controls
- icon-only actions without accessible names
- missing `type="button"` where implicit form submission is unsafe
- absent or invisible focus-visible state
- interactive controls not reachable with keyboard
- missing active-navigation semantics
- form controls without programmatic labels/messages
- dialog/drawer controls with unclear focus or close behavior
- information conveyed by color alone

### Responsive audit

Search for source patterns that commonly fail at small widths:

- fixed widths without a mobile fallback
- unbounded horizontal flex rows
- large absolute-positioned content
- sticky elements with conflicting top offsets
- tables without an intentional overflow strategy
- poster/hero layouts that assume desktop width
- seat grids whose overflow leaks to the whole page
- admin filter/toolbars that cannot wrap

Target at least 320, 390, 768, 1024, and 1440 px during browser verification.

### Maintainability audit

Flag feature files that combine too many UI responsibilities, especially when they contain several of these at once:

- API fetching
- realtime events
- normalization
- complex derived pricing/state
- large rendering trees
- dialogs/forms
- tables/grids
- unrelated feature sections

Recommend extraction only when it reduces UI regression risk; do not refactor solely to reduce line count.

## Local static checks

From `Frontend/`, use local commands where appropriate:

```bash
npm run audit:ui
npm run lint
npm test
npm run build
```

Do not invoke GitHub Actions.

The existing Shadcn audit is a signal, not the complete UI audit. It checks a limited set of styling patterns and cannot prove responsive, accessible, or visual correctness by itself.

## Severity

Classify findings:

- **P0** — blocks or breaks a core flow; inaccessible critical action; severe content overlap/overflow
- **P1** — meaningful inconsistency, missing state, duplicated primitive, responsive/accessibility defect
- **P2** — cosmetic polish or maintainability improvement with low immediate user impact

Avoid flooding the report with tiny P2 findings before P0/P1 issues are resolved.

## Output

For audit-only tasks, report findings in this order:

1. P0 issues
2. P1 issues
3. P2 issues
4. routes checked
5. commands run
6. explicit exceptions intentionally not changed

Each actionable finding should include file/path, reason, and recommended fix.

For implementation tasks, fix P0/P1 issues in scope and then report remaining debt.
