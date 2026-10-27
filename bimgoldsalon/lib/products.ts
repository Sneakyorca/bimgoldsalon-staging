// Shared by server and client code. Nothing secret or server-only in here.

export type Product = {
  id: number;
  name: string;
  blurb: string;
  /** What the customer pays (after any discount) */
  price: number;
  /** Regular price before any discount */
  originalPrice: number;
  discountPercent: number;
  category: string;
  stock: number;
  inStock: boolean;
  image: string;
  hasOptions?: boolean;
  priceFrom?: boolean;
};

export type AdminProduct = {
  id: number;
  name: string;
  description: string;
  category: string;
  /** Regular price */
  price: number;
  discountPercent: number;
  /** What the customer pays. Calculated by the database. */
  salePrice: number;
  stock: number;
  color: string;
  image: string;
  images: string[];
  extraInfo: Record<string, string>;
};
export type ProductInput = Omit<AdminProduct, "id" | "salePrice">;

/** Shown when a product has no photo yet (file in /public/images) */
export const NO_IMAGE = "/images/no-image.svg";

// ---- Stock ---------------------------------------------------------------

/** At or below this many left, a product counts as "low stock". */
export const LOW_STOCK_THRESHOLD = 5;

export type StockLevel = "in" | "low" | "out";

export const stockLevel = (stock: number): StockLevel =>
  stock <= 0 ? "out" : stock <= LOW_STOCK_THRESHOLD ? "low" : "in";

export const STOCK_BADGE: Record<
  StockLevel,
  { label: string; className: string }
> = {
  in: { label: "In Stock", className: "bg-emerald-100 text-emerald-700" },
  low: { label: "Low Stock", className: "bg-amber-100 text-amber-700" },
  out: { label: "Out of Stock", className: "bg-rose-100 text-rose-700" },
};

/** Preview only. The database's sale_price column is the real number. */
export const discountedPrice = (price: number, percent: number) =>
  Math.round(price * (100 - percent)) / 100;

// ---- Image storage ---------------------------------------------------------

export const CATALOG_BUCKET = "catalog-images";

const catalogPrefix = () =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${CATALOG_BUCKET}/`;

export const isCatalogImageUrl = (url: string) =>
  url.startsWith(catalogPrefix());

/** "…/catalog-images/products/abc.jpg" -> "products/abc.jpg" (null if not ours) */
export const catalogPathFromUrl = (url: string) =>
  isCatalogImageUrl(url)
    ? decodeURIComponent(url.slice(catalogPrefix().length))
    : null;
