# Story 10.4: Mobile Order History and Tracking

**Status:** done
**Epic:** 10 — Mobile App (React Native + Expo)
**Project context:** `_bmad-output/project-context.md`

## Story

As a mobile customer,
I want to view my order history and track order status on my phone,
so that I can stay informed about my purchases.

## Acceptance Criteria

**AC1 — Order history:**
Given I am on the Orders tab
When the screen loads
Then my orders are displayed in a FlatList sorted by most recent first
And each order shows: order ID (truncated), date, status badge, and total amount
And an empty state is shown if I have no orders

**AC2 — Order detail:**
Given I tap on an order
When the order detail screen loads
Then I see full order details: items, shipping address, status, and total
And the status is polled every 60 seconds and updated automatically

**AC3 — Auth guard:**
Given I am not logged in
When I navigate to the Orders tab
Then I am redirected to the login screen

## Tasks

- [x] `mobile/src/screens/orders/OrdersScreen.tsx` — order history screen
- [x] `mobile/src/screens/orders/OrderDetailScreen.tsx` — order detail screen
- [x] `mobile/src/api/ordersApi.ts` — orders API client

## Dev Notes

### Architecture references
- FlatList: `keyExtractor={(item) => item._id}` for order list
- Status polling: `useInterval(fetchStatus, 60_000)` custom hook
- Status badge: colored `View` with `Text` based on status value
- Date: use `formatDate()` utility

### Key files
- `mobile/src/screens/orders/OrdersScreen.tsx` — order list
- `mobile/src/screens/orders/OrderDetailScreen.tsx` — detail with polling

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ OrdersScreen with FlatList and status badges
- ✅ Empty state for no orders
- ✅ OrderDetailScreen with full order info
- ✅ Status polling every 60 seconds
- ✅ Auth guard redirects to login

### File List
- `mobile/src/screens/orders/OrdersScreen.tsx`
- `mobile/src/screens/orders/OrderDetailScreen.tsx`
- `mobile/src/api/ordersApi.ts`
