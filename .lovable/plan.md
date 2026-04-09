## Revamp Plan

### 1. Separate Product Editor Page
- Move the current inline dialog product editing (in `ProductStore.tsx`) to a dedicated route `/products/:productId/edit`
- Full-page editor with gallery, variants, pricing, stock, visibility — all with more space
- Products list page links to this editor

### 2. Products Block in Page Builder — Simplified
- The "Products" block in page builder becomes a product picker: select which existing products (from that persona) to display
- No inline product creation/editing — just a multi-select of existing products
- Renders a clean product grid with links to individual product pages

### 3. Public Product Detail Page (like Shopify reference)
- New route: `/p/:userId/:personaSlug/product/:productId`
- Full product page with:
  - Large image gallery with thumbnails (like the scarf screenshot)
  - Variant selectors (color swatches as images, size/option pills)
  - Quantity selector with +/- buttons
  - "Add to Cart" button
  - Price display with variant modifiers
  - Stock status
- Clicking a product on the public profile navigates here instead of opening a bottom sheet

### 4. Page Builder Built-in Shopping Cart Tab
- Add a cart icon/tab to the page builder toolbar
- Auto-shows only when there are product blocks on the page
- Shows cart contents, quantity controls, and checkout flow
- Persists cart state across page navigation within the builder preview

### 5. Card Studio Preview Simplification
- Remove: display name, "NFC Hub" header text
- Keep: just the 3D card, flip button, share button
- Add: smaller "Save Contact" button that scales properly in the page builder embed

### Files affected:
- `src/pages/CommercePage.tsx` — product list with edit links
- New: `src/pages/ProductEditPage.tsx` — full product editor
- `src/components/page-builder/BlockRenderer.tsx` — simplified products block
- New: `src/pages/PublicProductPage.tsx` — Shopify-style product detail
- `src/components/commerce/ProductDetailSheet.tsx` → refactor or replace
- `src/components/page-builder/` — cart tab integration
- Card studio preview component — strip down to essentials
- `src/App.tsx` — new routes
