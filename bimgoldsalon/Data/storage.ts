import "server-only";
import { createClient } from "@/lib/supabase/server";
import { CATALOG_BUCKET, catalogPathFromUrl } from "@/lib/products";

/** Deletes files from the catalog bucket. Ignores URLs that aren't ours. */
export async function removeCatalogImages(urls: string[]) {
  const paths = urls
    .map(catalogPathFromUrl)
    .filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(CATALOG_BUCKET).remove(paths);
  if (error) console.error("[removeCatalogImages]", error.message);
}
