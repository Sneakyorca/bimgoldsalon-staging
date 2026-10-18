# BIM-GOLD Product System

## Purpose

The product system supports the customer shop, product detail pages, cart actions, related products, and admin catalog management. Customers see sale prices and stock status. Administrators manage catalog records, pricing, discounts, stock, categories, images, and additional metadata.

## Customer Flow

```text
/app/product/page.tsx
  -> Data/products.js:getProducts()
  -> components/shop/ShopView.tsx
      -> search by name and description
      -> category filter
      -> pagination (8 products per page)
      -> components/site/ProductCard.tsx

/app/product/[id]/page.tsx
  -> Data/products.js:getProductById()
  -> Data/products.js:getProductGallery()
  -> Data/products.js:getRelatedProducts()
  -> components/product/ProductGallery.tsx
  -> components/product/ProductActions.tsx
  -> CartContext
```

### Shop Listing

`components/shop/ShopView.tsx` provides:

- Search across product name and blurb.
- Category filtering.
- Eight products per page.
- Pagination with scroll-to-top behavior.
- Empty-search feedback when no products match.
- Responsive product grid: two columns on medium screens and four on large screens.

### Product Cards

`components/site/ProductCard.tsx` provides:

- Product image and accessible image alt text.
- Product name and description.
- Customer price.
- Original price and discount badge when a discount exists.
- In-stock or out-of-stock badge when requested by the parent.
- Add-to-cart action without navigating away from the card.
- Cart quantity badge for products already in the cart.
- Toast confirmation after a successful add-to-cart action.
- Disabled cart action for unavailable products.

### Product Detail

`app/product/[id]/page.tsx` provides:

- Dynamic metadata based on the product name.
- Breadcrumb navigation back to the shop.
- Product image gallery with a fallback image.
- Stock state and low-stock warning.
- Regular price, sale price, original price, and discount percentage.
- Product description.
- Product actions and cart integration.
- Related products from the same category.

## Product Types

The shared types live in `lib/products.ts` so server and client components use the same contract.

### Customer Product

```ts
type Product = {
  id: number;
  name: string;
  blurb: string;
  price: number; // customer-facing sale price
  originalPrice: number; // regular price before discount
  discountPercent: number;
  category: string;
  stock: number;
  inStock: boolean;
  image: string;
};
```

### Admin Product

```ts
type AdminProduct = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number; // regular price
  discountPercent: number;
  salePrice: number; // calculated customer-facing price
  stock: number;
  color: string;
  image: string;
  images: string[];
  extraInfo: Record<string, string>;
};

type ProductInput = Omit<AdminProduct, "id" | "salePrice">;
```

The database should remain the authority for calculated `salePrice`. Client-side discount calculation is preview-only.

## Data Access

### Customer Queries

- `Data/products.js:getProducts()` loads the product listing from the `products` table.
- `Data/products.js:getProductById(id)` loads one product.
- `Data/products.js:getProductGallery(id)` loads additional product images.
- `Data/products.js:getRelatedProducts(category, id)` loads related products.

All customer reads should preserve the current product shape expected by `ShopView`, `ProductCard`, `ProductActions`, and the detail route.

### Admin Queries and Mutations

Admin data is exposed through the server-side auth/API swap point and server actions:

- `getAdminSnapshot()` loads admin products and catalog data.
- `saveProduct(id, input)` creates or updates a product.
- `deleteProduct(id)` removes a product after authorization.
- `setProductStock(id, stock)` updates stock.
- `getProducts()` and `getProductById()` remain customer-facing reads.

Every admin mutation must call `requireAdmin()` before validation or data access. UI-only hiding is not authorization.

## Admin UI

The admin product workflow is composed from:

- `components/admin/ProductsManager.tsx` - Product list and add/edit/delete controls.
- `components/admin/ProductForm.tsx` - Product editor.
- `components/admin/CategoryField.tsx` - Existing or new category selection.
- `components/admin/ImageField.tsx` - Main image and gallery selection.
- `components/admin/ExtraInfoEditor.tsx` - Stable editable metadata rows.
- `components/admin/StockEditor.tsx` - Inline stock update.
- `components/admin/AdminDialog.tsx` - Modal editor shell.
- `components/admin/ConfirmButton.tsx` - Accessible destructive-action confirmation.
- `components/admin/Table.tsx` - Shared catalog table structure.
- `components/admin/ui.ts` - Shared inputs, buttons, labels, and panel styles.
- `lib/admin/stock.ts` - Stock-level presentation.
- `lib/admin/constants.ts` - Stock and gallery limits.
- `lib/admin/schemas.ts` - Server-side product validation.

The product manager should show:

- Image thumbnail.
- Name.
- Category.
- Regular price.
- Stock input.
- Stock status.
- Color.
- Edit action.
- Delete action with confirmation.

## Validation Rules

Server actions validate all values because server actions are public endpoints. TypeScript types are not runtime validation.

### Product Rules

- Name: required, maximum 80 characters.
- Category: required, maximum 60 characters.
- Regular price: number from 0 to 100,000.
- Discount: number from 0 to 95 percent.
- Stock: whole number from 0 to 100,000.
- Color: maximum 40 characters.
- Additional details: maximum 20 entries.
- Detail labels: 1 to 40 characters.
- Detail values: maximum 200 characters.
- Gallery: maximum 6 extra images.

### Image Rules

Allowed image types:

- PNG
- JPEG
- WebP

Limits:

- Maximum source file size: 8 MB.
- Images are compressed in the browser before being sent through a server action.
- Maximum data URL size: 400,000 characters.
- SVG is rejected.
- JPEG output uses a white background because JPEG does not preserve transparency.
- Customer-facing fallback image: `lib/products.ts:NO_IMAGE`.

Image storage constants:

- Bucket: `catalog-images`.
- Public URL helpers: `isCatalogImageUrl()` and `catalogPathFromUrl()` in `lib/products.ts`.

When real Supabase Storage is enabled, replace the browser data-URL transport with an upload flow while keeping the form contract stable.

## Pricing Rules

- `price` is the regular price stored by admin input.
- `discountPercent` stores the discount percentage.
- `salePrice` is the customer-facing calculated value and should be calculated by the database/backend.
- `discountedPrice()` in `lib/products.ts` is only a UI preview helper.
- `formatPrice()` formats values for customer-facing output.
- Admin forms should show the preview price but must not treat client calculation as authoritative.

## Stock Rules

```ts
stock <= 0                  -> Out of Stock
stock <= LOW_STOCK_THRESHOLD -> Low Stock
stock > LOW_STOCK_THRESHOLD  -> In Stock
```

The shared threshold is `LOW_STOCK_THRESHOLD = 5`.

The product detail page shows a low-stock warning when the product is available and stock is at or below the threshold. Product cards disable adding unavailable products to the cart.

## Security and Authorization

- Product admin routes are protected by the admin DAL and proxy gate.
- Every product mutation re-checks `requireAdmin()` server-side.
- Never trust product price, stock, discount, image, or metadata values from the browser.
- Never expose Supabase service-role credentials to client components.
- Enable RLS on production product and storage tables.
- Storage policies must restrict writes to authorized admins.
- Validate image URLs before persisting them.
- Keep previous order item names/prices as snapshots so deleting or editing a product does not rewrite historical orders.

## Known Integration Checks

Before production deployment, verify:

1. The `products` table columns match `AdminProduct` and customer `Product` fields.
2. `sale_price` is calculated consistently by the database and read queries.
3. `product_images` or the equivalent gallery table returns stable ordering.
4. The `catalog-images` storage bucket exists and has correct read/write policies.
5. `Data/products.js` and the server API use the same Supabase client conventions.
6. Admin product actions validate the same limits as `lib/admin/schemas.ts`.
7. Product deletion behavior protects historical order snapshots.
8. `next.config.ts` keeps the 4 MB server-action body limit for compressed image data URLs.
9. Product detail pages handle missing products with `notFound()`.
10. Product cards remain keyboard accessible and do not submit or navigate when the cart button is activated.

## Relevant Files

- `app/product/page.tsx`
- `app/product/[id]/page.tsx`
- `components/shop/ShopView.tsx`
- `components/site/ProductCard.tsx`
- `components/product/ProductActions.tsx`
- `components/product/ProductGallery.tsx`
- `components/admin/ProductsManager.tsx`
- `components/admin/ProductForm.tsx`
- `components/admin/ServicesManager.tsx`
- `Data/products.js`
- `Data/adminProducts.js`
- `lib/products.ts`
- `lib/format.ts`
- `lib/admin/constants.ts`
- `lib/admin/schemas.ts`
- `lib/admin/images.ts`
- `lib/auth/api.ts`
- `app/admin/actions.ts`
