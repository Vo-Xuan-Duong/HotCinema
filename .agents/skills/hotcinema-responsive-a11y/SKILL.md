---
name: hotcinema-responsive-a11y
description: Hardens HotCinema UI for mobile, tablet, desktop, keyboard navigation, focus visibility, semantic controls, dialogs, tables, seat maps, and accessible labels. Use when fixing responsive breakage, overflow, navigation, forms, modals, or accessibility defects.
metadata:
  project: HotCinema
  area: frontend-responsive-a11y
  version: "1.0"
---

# HotCinema Responsive and Accessibility Hardening

Use this skill to make touched HotCinema interfaces usable across viewport sizes and non-pointer input without changing core business behavior.

## Read first

- `Frontend/SHADCN_STYLE_GUIDE.md`
- relevant layout: `Frontend/src/layouts/UserLayout.jsx` or `Frontend/src/layouts/AdminLayout.jsx`
- relevant shared primitives in `Frontend/src/components/ui/`
- the route and feature components being changed

## Viewport matrix

Verify at least these widths when browser tooling is available:

- 320 px — minimum supported narrow mobile
- 390 px — common mobile
- 768 px — tablet / admin sidebar transition
- 1024 px — small desktop/tablet landscape
- 1440 px — desktop

For dense admin pages, also inspect 1600-1920 px when charts, large tables, or multi-column workspaces are involved.

Do not optimize only for screenshots. Controls must remain operable.

## Responsive rules

### Page shell

Check that:

- header does not cover route content
- admin sidebar/inset do not overlap content
- mobile sidebar overlay closes predictably
- fixed/sticky elements have correct offsets
- page-level horizontal scrolling is absent unless the entire page is intentionally a canvas
- containers preserve readable padding at 320 px

### Flex/grid content

Prefer:

- mobile-first single-column stacking
- `min-w-0` on flex/grid children that contain truncating content
- wrapping toolbars when actions do not fit
- responsive grids instead of fixed card widths
- scoped `overflow-x-auto` for genuinely wide structures

Do not solve overflow by globally hiding it; hidden overflow can make controls unreachable.

### Tables

For admin tables:

- preserve the shared `DataTable`/`Table` behavior
- allow scoped horizontal scrolling if columns cannot reasonably collapse
- keep primary identifiers/actions discoverable
- avoid tiny unreadable typography as an overflow workaround
- ensure row actions remain keyboard accessible

### Seat maps

Seat maps are a legitimate fixed-grid case. Requirements:

- horizontal overflow must be scoped to the seat-map card/container
- the whole page must not shift horizontally
- row labels and screen orientation remain understandable
- selected/booked/held/disabled states are not communicated by color alone
- seat buttons retain accessible names and visible keyboard focus
- couple seats spanning columns remain operable at narrow widths
- booking summary remains reachable after the map on mobile and may be sticky only when it does not cover content

### Media/hero surfaces

- media overlays may use explicit black/white contrast when required by artwork
- text must remain readable over varying images
- essential calls to action must not disappear solely because the poster/secondary visual is hidden on small screens
- avoid fixed hero heights that clip translated or long content

## Accessibility rules

### Semantic controls

Use actual `button`, link, input, select, checkbox, radio, and dialog semantics. Do not make a `div` clickable when a semantic element fits.

Every button inside a form must have the intended `type`.

### Keyboard and focus

Every interactive element must:

- be reachable in a logical order
- show a visible `focus-visible` state
- avoid focus traps outside intentional modal/dialog behavior
- remain operable without hover

Do not remove outlines unless an equivalent visible focus ring is present.

### Names and descriptions

- icon-only buttons require `aria-label` or an equivalent accessible name
- form controls require labels
- validation errors should be associated with their controls through shared form primitives where possible
- navigation should expose active/current state
- progress/loading text should be understandable without animation

### Dialogs, drawers, popovers

Prefer existing Radix/Shadcn primitives. Verify:

- trigger semantics
- initial focus is sensible
- Escape/close behavior works
- focus returns to the trigger or a logical destination
- background content is not the active interaction target while modal content is open
- mobile layouts use responsive dialog/drawer patterns when appropriate

### Status and color

Do not communicate booking/payment/seat/admin status only through color. Preserve text labels, icons, shapes, or badges that communicate state.

## Reduced motion

Motion must be decorative or progressive enhancement. Do not require animation to reveal critical information. When adding substantial motion, respect `prefers-reduced-motion` or use existing primitives that already handle reduced motion appropriately.

## Verification approach

When browser tooling exists:

1. load the changed route at each relevant target width
2. tab through primary controls
3. open/close dialogs and menus
4. verify focus and scroll behavior
5. inspect both themes for shared-token changes
6. verify no unintended horizontal page scroll

When browser tooling is unavailable, perform source-based checks and add targeted component/integration tests where feasible. Report that visual verification remains outstanding rather than claiming it passed.

## Local checks

From `Frontend/`, run applicable checks:

```bash
npm run lint
npm test
npm run build
```

Also run `npm run audit:ui` when styling changes are involved.

Do not invoke GitHub Actions.

## Done criteria

The touched UI is complete only when:

- it works at 320 px and larger relevant widths
- intentional wide structures use scoped overflow
- critical actions remain reachable
- keyboard focus is visible and logical
- semantic controls are used
- icon-only controls are named
- status is not color-only
- dialogs/menus remain keyboard operable
- no new theme-specific hard-coded application surface colors were required without justification
