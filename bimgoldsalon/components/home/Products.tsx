import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import Carousel from "./Carousel";
import { products } from "@/dummydata/productData";
import SectionTitle from "./SectionTitle";
import ProductCard from "../site/ProductCard";

const Products = () => (
  <section className="mx-auto w-full max-w-360 px-5 pt-14 lg:px-12 lg:pt-20">
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <SectionTitle
          plain="Explore Our"
          accent="Products"
          className="[&>div]:hidden text-center"
        />
      </div>
      <div className="flex justify-end items-center gap-4 text-xs lg:text-sm">
        <span className="rounded-full bg-card px-3 py-1.5">Best Sellers</span>
        <Link href="/product" className="hover:text-primary">
          View More
        </Link>
      </div>
    </div>

    <Carousel
      align="end"
      itemClass="basis-[calc(51%-8px)] lg:basis-[calc(26%-12px)]"
      loop
      arrowControls
    >
      {products.slice(0, 12).map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </Carousel>
  </section>
);

export default Products;
