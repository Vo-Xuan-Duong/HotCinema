---
name: hotcinema-ui-state-finisher
description: Completes HotCinema frontend loading, empty, error, retry, disabled, auth, realtime, booking, and payment states using shared UI primitives. Use when a screen works only on the happy path or has inconsistent feedback during API, WebSocket, booking, or payment transitions.
metadata:
  project: HotCinema
  area: frontend-ui-states
  version: "1.0"
---

# HotCinema UI State Finisher

Use this skill to eliminate happy-path-only screens and make asynchronous UI behavior explicit, coherent, and recoverable.

## Principles

- Backend responses remain authoritative for booking totals, promotion validity, inventory, ownership, payment status, and ticket state.
- Never fabricate successful data when an API request fails.
- Do not hide failures behind an empty state if the user should know the request failed.
- Prefer existing shared `Skeleton`, `Empty`, `Alert`, `Card`, `Button`, `StatusBadge`, toast/notification, and dialog primitives.
- Reuse route-level loading patterns instead of adding unrelated spinners to every page.
- Do not invoke GitHub Actions.

## State matrix

For each touched data-driven feature, explicitly consider these states.

### Loading

Use a skeleton when the page shape is known and preserving layout reduces visual jump. Use a compact loader for short local actions where a skeleton would be misleading.

Requirements:

- loading feedback must not look like real data
- primary submit actions expose pending state and prevent accidental duplicate submissions
- preserve useful existing content during background refresh when possible

### Loaded

Verify normal content with:

- full data
- partial/optional fields missing
- long titles/names/addresses
- zero-valued metrics/prices where valid

Do not render `undefined`, `NaN`, broken dates, or inaccessible placeholder text.

### Empty

Use a meaningful empty state only when the request succeeded but there is no content.

Examples:

- no movies for a filter
- no booking history
- no notifications
- no concessions for a cinema
- no admin records for a query

Where useful, provide the next valid action such as clear filters, return to catalog, or create a record.

### Error

Differentiate recoverable request failure from legitimate empty data.

A recoverable route error should usually provide:

- short explanation
- retry action when safe
- preserved navigation/back path

Do not expose raw stack traces or internal server details to end users.

### Disabled and submitting

For actions that mutate state:

- disable while the same operation is in flight
- preserve visible label or add clear loading text/icon
- avoid duplicate booking/payment/admin submissions
- keep disabled semantics accessible, not only visual

### Authentication and authorization

For protected customer/admin surfaces:

- expired/absent session should follow the existing auth flow
- preserve intended redirect target when the existing routing supports it
- unauthorized users must not receive a fake empty page
- UI hiding is not a substitute for backend authorization

## Booking-specific states

### Seat selection

Handle explicitly:

- seat layout loading
- no seat data
- seat becomes unavailable before confirmation
- seat held by current user
- seat held by another user
- booked/blocked/maintenance/unavailable
- WebSocket connected/disconnected/reconnecting if available
- concession loading/empty/sold-out
- promotion validating/valid/invalid/expired
- booking creation pending/conflict/error

If the backend returns a seat conflict, refresh/reconcile seat state and tell the user to reselect rather than pretending the original selection is still valid.

### Booking payment

Handle explicitly:

- required route/booking data missing
- booking details loading
- payment initiation pending
- redirect initiation failure
- callback processing
- payment status still pending
- confirmed payment
- failed/cancelled/expired payment
- retry only when backend/business rules permit it

Never calculate or override the authoritative booking total in the UI when the backend provides one.

### Booking result and tickets

For success/detail/history surfaces:

- confirmed booking with tickets
- confirmed booking while ticket data is still loading, if possible
- QR generation pending/failure
- missing optional cinema/movie metadata
- cancellation/refund action pending/success/failure where exposed

Keep QR scan backgrounds suitable for scanners even in dark theme.

## Realtime state

When WebSocket/realtime functionality is present:

- show connection state only when it provides useful user context
- do not imply live seat state while disconnected
- fall back to safe refresh/reconciliation behavior when possible
- avoid duplicate toasts for every low-level socket event

## Admin state consistency

Admin lists/forms should consistently cover:

- initial loading
- no rows
- filter returns zero rows
- API error
- create/update/delete pending
- destructive confirmation
- validation failure
- status badge mapping
- pagination edge cases

Prefer shared table/form/status primitives over page-specific feedback markup.

## Implementation approach

1. Identify all asynchronous operations in the component.
2. List their possible success/failure/empty/conflict states.
3. Consolidate redundant booleans where they create impossible UI combinations.
4. Add or reuse shared feedback primitives.
5. Keep previous useful data during refresh when safe.
6. Add focused tests for state transitions with meaningful regression risk.
7. Verify mobile layout does not break when errors or long messages appear.

## Local verification

From `Frontend/`, run applicable checks:

```bash
npm run lint
npm test
npm run build
npm run audit:ui
```

Do not invoke GitHub Actions.

## Done criteria

A touched asynchronous feature is complete when:

- loading is explicit
- empty is distinct from error
- retry exists where safe and useful
- submit/mutation actions prevent accidental duplication
- auth failures follow existing auth behavior
- booking/payment conflicts are reconciled against backend truth
- realtime disconnection is not misrepresented as current data
- user feedback uses shared primitives consistently
- local checks pass or remaining failures are reported precisely
