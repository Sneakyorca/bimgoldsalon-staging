import { getActivePromo } from "@/Data/promo";
import PromoClient from "./PromoClient";

export default async function Promo() {
  const p = await getActivePromo();
  if (!p) return null;
  return (
    <PromoClient
      promo={{
        style: p.style,
        title: p.title,
        message: p.message,
        buttonLabel: p.buttonLabel,
        buttonUrl: p.buttonUrl,
        startsAt: p.startsAt,
        endsAt: p.endsAt,
        repeatHours: p.repeatHours,
        version: p.version,
      }}
    />
  );
}
