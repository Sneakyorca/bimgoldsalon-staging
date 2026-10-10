import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductActions from "@/components/product/ProductActions";
import ProductCard from "@/components/site/ProductCard";
import { products } from "@/dummydata/productData";
import { formatPrice } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

const findProduct = (id: string) => products.find((p) => String(p.id) === id);

export const generateMetadata = async ({ params }: Props) => {
  const product = findProduct((await params).id);
  return { title: product ? `${product.name} | BIM-GOLD` : "Product | BIM-GOLD" };
};

const ProductDetailPage = async ({ params }: Props) => {
  const product = findProduct((await params).id);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <section className="mx-auto w-full max-w-360 px-5 pb-16 pt-6 lg:px-12">
      <nav aria-label="Breadcrumb" className="text-[14px] text-gray-600">
        <Link href="/product" className="hover:text-primary">Shop</Link> / <span className="text-black">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative rounded-2xl bg-card p-6">
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[12px] font-semibold uppercase text-white md:text-[14px] ${
              product.inStock ? "bg-green-600" : "bg-red-700"
            }`}
          >
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
          <Image
            src={product.image}
            alt={product.name}
            width={520}
            height={520}
            priority
            className="mx-auto h-72 w-auto object-contain md:h-125"
          />
        </div>

        <div>
          <p className="text-[14px] uppercase tracking-wide text-gray-600">{product.category}</p>
          <h1 className="mt-1 text-[32px] font-semibold leading-tight md:text-[40px]">{product.name}</h1>
          <p className="mt-3 text-[28px] font-bold">{formatPrice(product.price)}</p>
          <p className="mt-5 text-[16px] leading-relaxed">{product.blurb}</p>
          <ProductActions product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-5 text-[24px] font-semibold md:text-[32px]">You may also like</h2>
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
