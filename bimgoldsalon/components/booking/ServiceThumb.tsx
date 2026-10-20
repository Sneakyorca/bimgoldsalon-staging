import Image from "next/image";
import { NO_IMAGE } from "@/lib/products";

const ServiceThumb = ({
  image,
  className = "size-20",
}: {
  image?: string;
  className?: string;
}) => {
  const src = image || NO_IMAGE;
  return (
    <Image
      src={src}
      alt=""
      width={160}
      height={160}
      sizes="80px"
      className={`${className} shrink-0 rounded-xl ${
        src === NO_IMAGE ? "bg-[#f3f1ee] object-contain" : "object-cover"
      }`}
    />
  );
};

export default ServiceThumb;
