import type { MetadataRoute } from "next";
import { getProducts } from "@/Data/products";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = [
    { path: "", priority: 1 },
    { path: "/booking", priority: 0.9 },
    { path: "/product", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/training", priority: 0.5 },
    { path: "/terms", priority: 0.2 },
    { path: "/privacy", priority: 0.2 },
  ].map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    priority: p.priority,
  }));

  let products: MetadataRoute.Sitemap = [];
  try {
    products = (await getProducts()).map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: now,
      priority: 0.6,
    }));
  } catch {
    // if the database is unreachable, still serve the main pages
  }
  return [...pages, ...products];
}
