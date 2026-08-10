# HotCinema Shadcn UI Standard

This document is the frontend UI contract for HotCinema. New screens and refactors should follow these rules so the application behaves like one design system instead of a collection of page-specific styles.

## 1. Source of truth

- Shadcn configuration: `components.json` with `style: new-york` and CSS variables enabled.
- Shared UI primitives: `src/components/ui/*`.
- Theme tokens: existing root theme variables plus `src/styles/shadcn-system.css` during the migration period.
- Icons: `lucide-react` by default.
- Do not introduce another component library for controls already covered by the shared UI layer.

## 2. Semantic colors only for application UI

Use semantic classes:

- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-popover` / `text-popover-foreground`
- `bg-primary` / `text-primary-foreground`
- `bg-secondary` / `text-secondary-foreground`
- `bg-muted` / `text-muted-foreground`
- `bg-accent` / `text-accent-foreground`
- `bg-destructive` / `text-destructive-foreground`
- `border-border`, `border-input`, `ring-ring`

Do not use `bg-white`, `text-gray-*`, `border-gray-*`, arbitrary hex colors, or page-specific red/blue/green utilities for ordinary surfaces, text, controls, borders, or state UI.

Explicit colors are acceptable only when the color itself carries product meaning and cannot be represented by an existing semantic token, for example movie artwork overlays or data-visualization series. Add a named theme token when the same color becomes reusable application UI.

## 3. Compose pages from primitives

Prefer these components before writing custom HTML controls:

- Actions: `Button`
- Text fields: `Input`, `InputPassword`, `Textarea`
- Forms: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`
- Selection: `Select`, `Checkbox`, `RadioGroup`, `Switch`
- Surfaces: `Card`, `Alert`, `Separator`
- Overlays: `Dialog`, `ResponsiveDialog`, `Drawer`, `DropdownMenu`, `Popover`, `Tooltip`
- Navigation: `NavLinks`, `Breadcrumb`, `Sidebar*`
- Data: `Table`, `DataTable`, `StatusBadge`, `MetricCard`, `Skeleton`
- Feedback: centralized toast/notification context and shared empty/error states

If a pattern appears on two or more screens, move it into `components/ui` or a feature component instead of copying classes.

## 4. Layout rules

- Page background: `bg-background` or `bg-muted/30` for secondary workspace areas.
- Main content width should use a shared responsive container (`max-w-7xl` for customer pages, up to `max-w-[1600px]` for dense admin workspaces).
- Use the spacing scale (`gap-2/3/4/6/8`, `p-4/6/8`) rather than arbitrary pixel values unless layout constraints require them.
- Prefer `rounded-md`/`rounded-lg` driven by the theme radius instead of unrelated radius values on every screen.
- Use shadows sparingly. Borders and surface contrast should carry most hierarchy.

## 5. Interactive states

Every interactive control must have:

- hover state
- keyboard focus-visible ring using `ring-ring`
- disabled state
- accessible label for icon-only actions
- `aria-current="page"` for active navigation where applicable

Do not implement clickable `div` elements when a `button` or link is semantically correct.

## 6. Light and dark themes

Components must consume semantic tokens. Do not add separate `dark:text-*` / `dark:bg-*` pairs for normal application surfaces when the root token already changes in `.dark`.

Theme-specific exceptions should be rare and limited to media overlays or external brand assets.

## 7. Forms

- Use shared input height and radius from primitives; do not recreate focus borders on every form.
- Validation text uses `text-destructive` through `FormMessage`.
- Loading/submit state belongs on `Button`.
- Keep API validation mapping in form logic, not in CSS.

## 8. Tables and admin screens

- Use `DataTable`/`Table` for consistent header, border, hover, density and empty states.
- Filters should use `Input`, `Select`, date fields and buttons from the UI layer.
- Statuses should use `StatusBadge` tones rather than raw color names.
- Page titles/actions should follow one page-header pattern instead of custom colored icon boxes per page.

## 9. Migration rule

Legacy screens may keep temporary compatibility classes, but new code must not add new legacy styling. When touching an old screen:

1. Replace raw controls with shared primitives.
2. Replace hard-coded colors with semantic tokens.
3. Remove duplicated CSS for the migrated block.
4. Verify light/dark behavior and mobile layout.
5. Run `npm run audit:ui` and review new findings.

Use `npm run audit:ui:strict` only when working toward a zero-violation gate; the non-strict command is intentionally available during the migration period.

## 10. Definition of done for UI work

A frontend UI change is complete when it uses the shared primitive layer, semantic tokens, keyboard-accessible interactions, responsive layout, both themes, and contains no new page-specific design system primitives.
