import Image from "next/image";
import Link from "next/link";
import SocialLinks from "./Social-Links";

const Hero = () => (
  <section className="mx-auto w-full max-w-360 px-4">
    <div className="relative overflow-hidden rounded-3xl bg-primary text-white">
      <div className="flex flex-col items-center px-6 pt-4 text-center md:flex-row md:px-8 md:pt-0 md:text-left lg:px-14">
        <div className="z-10 md:w-1/2 md:py-20 lg:py-40">
          <p className="text-xs md:text-[13px] lg:text-[16px]">
            BIM - GOLD HAIR &amp; BEAUTY AND SALON
          </p>
          <h1 className="mt-12 text-2xl font-semibold leading-tight md:mt-4 md:text-2xl lg:mt-6 lg:text-4xl">
            Crowning You <br className="hidden md:block" />
            With <br className="md:hidden" />
            Confidence And Beauty
          </h1>
          <Link
            href="/booking"
            className="mt-6 hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary md:inline-block lg:px-5 lg:py-2.5 lg:text-[16px]"
          >
            Book Your Session
          </Link>
        </div>

        <div className="relative mt-4 w-full md:mt-10 lg:mt-0 md:w-1/2">
          <div className="h-94 lg:h-74">
            <Image
              src="/images/hero.png"
              alt="Three smiling women with different hair styles"
              width={760}
              height={520}
              priority
              className="mx-auto h-auto w-full max-w-xs object-contain md:max-w-none"
            />
          </div>
          <Link
            href="/booking"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary md:hidden"
          >
            Book Your Session
          </Link>
        </div>
      </div>

      <SocialLinks className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col md:flex lg:right-8" />
    </div>
  </section>
);

export default Hero;
