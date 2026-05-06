# Admin Backoffice Upgrade — Production-Level Inventory & Analytics

This document describes the comprehensive upgrade to the admin backoffice system, bringing it to production-level standards used by Shopify, WooCommerce, Magento, and BigCommerce.

---

## What Was Added

### 1. **Enhanced Product Model**
- **`costPrice`** — Cost of goods sold (COGS) for margin calculation
- **`lowStockThreshold`** — Per-product alert threshold (default: 5)

### 2. **Dedicated Inventory Page** (`/admin/inventory`)
**Features:**
- Summary cards: Total units, inventory value, in-stock/low-stock/out-of-stock counts
- Full inventory table with:
  - Product image, name, category
  - Selling price, cost price, **margin %** (color-coded: green if >30%)
  - Current stock / threshold
  - Status badge (in stock / low stock / out of stock)
  - **Inline "Adjust" button** — quick stock adjustment without opening full edit form
- Stock adjustment modal with:
  - Adjustment input (+/- integer)
  - Optional note field (for future audit log)
  - Real-time preview of new stock level

**Backend:**
- `GET /admin/inventory` — returns all products with computed status
- `PATCH /admin/inventory/:id/adjust` — adjusts stock by delta (e.g., +10 or -5)

### 3. **Customers Page** (`/admin/customers`)
**Features:**
- Paginated customer list (20 per page)
- Search by name or email
- Columns: Name, email, joined date, order count, total spent
- Enriched with order stats via MongoDB aggregation

**Backend:**
- `GET /admin/customers` — returns customers with order count and total spend

### 4. **Analytics Page** (`/admin/analytics`)
**Features:**
- Period selector: Last 7 days / 30 days / 90 days
- **Revenue over time** — bar chart with hover tooltips showing date, revenue, order count
- **Top 10 products by revenue** — ranked list with product image, units sold, revenue
- **Orders by status** — horizontal bar chart showing distribution (pending/processing/shipped/delivered/cancelled)

**Backend:**
- `GET /admin/analytics?from=&to=` — returns:
  - `topProducts[]` — top 10 by revenue
  - `ordersByStatus[]` — order count per status
  - `revenueByDay[]` — daily revenue + order count

### 5. **Upgraded Dashboard**
**New features:**
- **Low-stock alert banner** — yellow alert box showing count of low/out-of-stock products with "View inventory" CTA
- Fetches inventory summary on load to display alert

### 6. **Updated Product Form**
**New fields:**
- **Selling price** (renamed from "Price")
- **Cost price / COGS** — optional, defaults to 0
- **Stock quantity** (existing)
- **Low stock alert threshold** — defaults to 5

---

## How Real Production Systems Work

### Inventory Management (Shopify / WooCommerce pattern)
1. **Stock levels** — tracked per product variant
2. **Low-stock thresholds** — configurable per product
3. **Stock adjustments** — inline quick-adjust + full edit form
4. **Stock history** — audit log of all adjustments (not yet implemented here, but the `note` field is reserved for it)
5. **Automatic alerts** — dashboard banner + email notifications (banner implemented, email not yet)
6. **Multi-location inventory** — not implemented (single-location only)

### Cost Tracking & Margins
- **COGS (Cost of Goods Sold)** — stored per product
- **Margin calculation** — `(price - cost) / price * 100`
- **Inventory valuation** — `sum(stock * cost)` across all products
- **Profit tracking** — revenue - COGS (not yet implemented — requires linking orders to cost at time of sale)

### Customer Management
- **Customer lifetime value (CLV)** — total spend across all orders
- **Order frequency** — order count per customer
- **Segmentation** — by spend, order count, or custom tags (not yet implemented)
- **Customer detail page** — full order history, notes, tags (not yet implemented)

### Analytics
- **Revenue trends** — daily/weekly/monthly charts
- **Top products** — by revenue, units sold, or profit
- **Order status breakdown** — funnel visualization
- **Conversion metrics** — cart abandonment, checkout completion (not yet implemented)
- **Cohort analysis** — customer retention over time (not yet implemented)

---

## What's Still Missing (Future Enhancements)

### Inventory
- [ ] Stock movement history / audit log
- [ ] Low-stock email alerts
- [ ] Bulk stock import/export (CSV)
- [ ] Multi-location inventory
- [ ] Stock reservations (hold stock during checkout)

### Financial
- [ ] Expense tracking (separate Expense model)
- [ ] Profit calculation (revenue - COGS - expenses)
- [ ] Tax reporting
- [ ] Supplier management

### Customers
- [ ] Customer detail page with full order history
- [ ] Customer segmentation and tags
- [ ] Customer notes
- [ ] Lifetime value trends

### Analytics
- [ ] Cart abandonment tracking
- [ ] Conversion funnel
- [ ] Cohort analysis
- [ ] Custom date range picker (currently fixed periods)
- [ ] Export reports to CSV/PDF

### Orders
- [ ] Bulk order actions (mark as shipped, cancel, etc.)
- [ ] Order notes and internal comments
- [ ] Shipping label generation
- [ ] Return/refund workflow (partial refunds)

---

## Database Schema Changes

### Product Model
```typescript
{
  name: string
  description: string
  price: number
  costPrice: number          // NEW — default 0
  images: string[]
  category: string
  stockQuantity: number
  lowStockThreshold: number  // NEW — default 5
  ratings: { average: number; count: number }
  createdAt: Date
  updatedAt: Date
}
```

**Migration:** Existing products will have `costPrice: 0` and `lowStockThreshold: 5` by default (handled by Mongoose defaults).

---

## API Endpoints Added

### Inventory
- `GET /api/v1/admin/inventory` — full inventory overview with status
- `PATCH /api/v1/admin/inventory/:id/adjust` — adjust stock by delta

### Customers
- `GET /api/v1/admin/customers?search=&page=&pageSize=` — paginated customer list with order stats

### Analytics
- `GET /api/v1/admin/analytics?from=&to=` — top products, orders by status, revenue by day

---

## Frontend Routes Added

- `/admin/inventory` — Inventory management page
- `/admin/customers` — Customer list page
- `/admin/analytics` — Analytics dashboard

---

## Testing Checklist

### Inventory
- [ ] Create product with cost price and low stock threshold
- [ ] Verify inventory page shows correct status (in stock / low / out)
- [ ] Adjust stock using inline modal (+10, -5, etc.)
- [ ] Verify margin % calculation is correct
- [ ] Verify low-stock alert appears on dashboard when threshold is reached

### Customers
- [ ] Verify customer list shows correct order count and total spent
- [ ] Search by name and email
- [ ] Verify pagination works

### Analytics
- [ ] Switch between 7d / 30d / 90d periods
- [ ] Verify revenue chart displays correctly
- [ ] Verify top products list is sorted by revenue
- [ ] Verify orders by status chart shows correct distribution

### Product Form
- [ ] Create product with cost price and threshold
- [ ] Edit existing product — verify cost price and threshold load correctly
- [ ] Verify form validation for new fields

---

## Performance Considerations

### Inventory Page
- Loads all products in one query (no pagination) — acceptable for <1000 products
- For larger catalogs, add pagination or virtual scrolling

### Analytics
- Uses MongoDB aggregation pipelines — efficient for date-range queries
- Revenue by day query is limited to 90 days max — acceptable performance
- For larger date ranges, consider pre-aggregated daily summaries

### Customers Page
- Paginated (20 per page) — scalable
- Order stats enrichment uses aggregation — efficient

---

## Security Notes

- All admin endpoints require `authMiddleware` + `requireRole('admin')`
- Stock adjustments are logged in the `note` field (reserved for future audit log)
- No customer PII is exposed beyond name/email (no addresses, payment info)

---

## Deployment Notes

1. **Database migration:** No manual migration needed — Mongoose defaults handle new fields
2. **Existing products:** Will have `costPrice: 0` and `lowStockThreshold: 5` by default
3. **Backward compatibility:** All existing endpoints remain unchanged
4. **Frontend build:** Run `npm run build` in `frontend/` to compile new pages

---

## Summary

This upgrade brings the admin backoffice to **production-level standards** with:
- ✅ Dedicated inventory management with inline stock adjustments
- ✅ Cost tracking and margin calculation
- ✅ Customer management with order stats
- ✅ Analytics dashboard with revenue trends and top products
- ✅ Low-stock alerts on dashboard
- ✅ Per-product low-stock thresholds

The system now matches the core inventory and analytics features of Shopify, WooCommerce, and other professional e-commerce platforms.
