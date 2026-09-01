---
name: hotcinema-design-system-migrator
description: Migrates legacy HotCinema frontend UI to the existing Shadcn/Radix shared primitive layer and semantic theme tokens. Use when refactoring page-specific controls, colors, tables, forms, dialogs, cards, headers, or compatibility CSS while preserving product behavior.
metadata:
  project: HotCinema
  area: frontend-design-system
  version: "1.0"
---

# HotCinema Design System Migrator

Use this skill when a HotCinema screen or component still carries legacy styling or duplicates the shared UI layer.

## Source of truth

Read `Frontend/SHADCN_STYLE_GUIDE.md` before changing UI. Inspect existing primitives under `Frontend/src/components/ui/` before creating anything new.

The migration target is the repository's existing Shadcn/Radix-oriented system, not a new visual framework.

## Non-negotiable rules

- Do not add another component library for controls already available in `src/components/ui`.
- Do not replace working business logic merely to make a component look cleaner.
- Use semantic theme tokens for ordinary application UI.
- Do not blindly remove explicit colors from cinema artwork/media overlays.
- Preserve white QR backgrounds when required for reliable scanning.
- Preserve named chart-series colors and seat-state colors when color itself carries meaning.
- Prefer Lucide icons for application controls unless an existing product asset requires otherwise.
- Avoid page-specific CSS if the same pattern is used on two or more screens.

## Migration sequence

For each touched screen, migrate in this order.

### 1. Controls

Replace raw/custom controls with existing primitives where appropriate:

- actions -> `Button`
- text/password/textarea -> `Input`, `InputPassword`, `Textarea`
- forms -> `Form`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`
- selection -> `Select`, `Checkbox`, `RadioGroup`, `Switch`
- overlays -> `Dialog`, `ResponsiveDialog`, `Drawer`, `AlertDialog`, `Popover`, `DropdownMenu`, `Tooltip`
- surfaces -> `Card`, `Alert`, `Separator`
- navigation -> `NavLinks`, `Breadcrumb`, sidebar primitives
- data -> `Table`, `DataTable`, `MetricCard`, `StatusBadge`, `Skeleton`

Do not wrap primitives in unnecessary one-off abstractions.

### 2. Colors

For normal application UI prefer:

- `bg-background` / `text-foreground`
- `bg-card` / `text-card-foreground`
- `bg-popover` / `text-popover-foreground`
- `bg-primary` / `text-primary-foreground`
- `bg-secondary` / `text-secondary-foreground`
- `bg-muted` / `text-muted-foreground`
- `bg-accent` / `text-accent-foreground`
- `bg-destructive` / `text-destructive-foreground`
- `border-border`, `border-input`, `ring-ring`

If a reusable product-specific color is needed, add a named semantic token instead of scattering raw palette classes.

### 3. Layout and density

- Customer pages should generally share the responsive `max-w-7xl` container pattern.
- Dense admin workspaces may use the existing wider admin container.
- Prefer the spacing scale (`gap-2/3/4/6/8`, `p-4/6/8`) over arbitrary pixels unless layout math requires fixed dimensions.
- Prefer theme-driven `rounded-md` / `rounded-lg`.
- Use borders/surface contrast for hierarchy; keep heavy shadows exceptional.
- Preserve intentional horizontal scrolling only inside scoped regions such as wide tables or seat maps.

### 4. Repeated page patterns

When two or more screens duplicate a pattern, consolidate it at the lowest sensible shared layer. Typical candidates:

- admin page headers
- filter/tool bars
- status presentation
- destructive confirmation dialogs
- empty/error states
- form sections
- metric blocks
- table action menus

Do not centralize genuinely feature-specific markup just to reduce file count.

### 5. Compatibility CSS cleanup

Inspect `Frontend/src/index.css` and `Frontend/src/styles/shadcn-system.css`.

For each compatibility selector:

1. find all live consumers
2. migrate consumers in scope
3. remove the selector only when no live consumer still depends on it
4. remove duplicate keyframes or malformed global declarations when safe
5. ensure the final cascade remains intentional

Never delete compatibility CSS based only on appearance.

## Interaction requirements

Every interactive primitive must retain or gain:

- hover state
- visible `focus-visible` ring
- disabled state
- accessible label for icon-only actions
- semantic button/link behavior
- `aria-current` for active navigation where applicable

## Theme verification

A migrated component should consume semantic tokens rather than maintain separate hard-coded light/dark pairs for ordinary surfaces. Test both themes when the change touches shared primitives, global CSS, or a broad page surface.

## Local verification

From `Frontend/`, run as applicable:

```bash
npm run audit:ui
npm run lint
npm test
npm run build
```

Do not use GitHub Actions for validation.

If `audit:ui` reports a legitimate exception such as a media overlay or QR background, keep the correct styling and improve the audit policy/documentation rather than corrupting the UI to silence the check.

## Completion criteria

A migration is complete when:

- touched controls use the shared primitive layer where available
- ordinary UI uses semantic tokens
- duplicated styling for the migrated block is removed
- no new legacy compatibility layer is introduced
- mobile behavior remains valid
- keyboard/focus behavior remains valid
- light/dark behavior remains valid
- product-semantic visual exceptions remain intact
- local checks pass or remaining failures are explicitly reported
