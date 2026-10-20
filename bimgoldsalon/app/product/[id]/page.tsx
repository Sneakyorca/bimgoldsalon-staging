import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductActions from "@/components/product/ProductActions";
import ProductGallery from "@/components/product/ProductGallery";
import ProductCard from "@/components/site/ProductCard";
import {
  getProductById,
  getProductGallery,
  getRelatedProducts,
} from "@/Data/products";
import { formatPrice } from "@/lib/format";
import { LOW_STOCK_THRESHOLD, NO_IMAGE } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const product = await getProductById((await params).id);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const description =
    product.blurb.replace(/\s+/g, " ").trim().slice(0, 155) ||
    `Buy ${product.name} from BIM-GOLD Hair & Beauty Salon.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      siteName: "BIM-GOLD Hair & Beauty Salon",
      locale: "en_GB",
      images: [product.image],
    },
  };
};

const ProductDetailPage = async ({ params }: Props) => {
  const product = await getProductById((await params).id);
  if (!product) notFound();

  const [gallery, related] = await Promise.all([
    getProductGallery(product.id),
    getRelatedProducts(product.category, product.id),
  ]);
  const photos = [product.image, ...gallery].filter(
    (u, i, all) => u && u !== NO_IMAGE && all.indexOf(u) === i,
  );
  const images = photos.length > 0 ? photos : [NO_IMAGE];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.blurb,
    category: product.category,
    image: images.map((u) => (u.startsWith("http") ? u : `${SITE_URL}${u}`)),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "GBP",
      price: product.price.toFixed(2),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <section className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-[14px] text-gray-600">
        <Link href="/product" className="hover:text-primary">
          Shop
        </Link>{" "}
        / <span className="text-black">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery name={product.name} images={images}>
          <span
            className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[12px] font-semibold uppercase text-white md:text-[14px] ${
              product.inStock ? "bg-green-600" : "bg-red-700"
            }`}
          >
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
        </ProductGallery>

        <div>
          <p className="text-[14px] uppercase tracking-wide text-gray-600">
            {product.category}
          </p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight md:text-[36px]">
            {product.name}
          </h1>
          <p className="mt-3 flex flex-wrap items-baseline gap-3 text-[28px] font-bold">
            {formatPrice(product.price)}
            {product.discountPercent > 0 && (
              <>
                <span className="text-[18px] font-normal text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="rounded-full bg-primary px-3 py-1 text-[14px] font-semibold text-white">
                  -{Math.round(product.discountPercent)}%
                </span>
              </>
            )}
          </p>
          {product.inStock && product.stock <= LOW_STOCK_THRESHOLD && (
            <p className="mt-2 text-[15px] font-semibold text-amber-700">
              Only {product.stock} left in stock
            </p>
          )}
          <p className="mt-5 whitespace-pre-line text-[16px] leading-relaxed">
            {product.blurb}
          </p>
          <ProductActions product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-5 text-[24px] font-semibold md:text-[32px]">
            You may also like
          </h2>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} variant="grid" showStatus />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ProductDetailPage;
