import { getServices } from "@/Data/services";
import ServicesList from "./ServicesList";

const Services = async () => {
  const all = await getServices();
  const featured = all.filter((s) => s.featured);
  const list = featured.length > 0 ? featured : all;
  if (list.length === 0) return null;
  return <ServicesList services={list} />;
};

export default Services;
