import Image from "next/image";

const Logo = ({ priority = false }: { priority?: boolean }) => (
  <Image
    className="h-12.25 w-11.25 object-cover md:h-12 md:w-auto md:object-contain lg:h-18 lg:w-32.25"
    src="/logo.png"
    alt="Bimgold logo"
    width={129}
    height={72}
    priority={priority}
  />
);

export default Logo;
