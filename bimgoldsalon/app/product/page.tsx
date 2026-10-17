import ShopView from "@/components/shop/ShopView";
import { getProducts } from "@/Data/products";

export const metadata = { title: "Shop | BIM-GOLD" };

const ProductPage = async () => {
  const products = await getProducts();
  const categories = [...new Set(products.map((p) => p.category))].sort();
  return <ShopView products={products} categories={categories} />;
};

export default ProductPage;
