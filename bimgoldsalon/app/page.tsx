import { Suspense } from "react";
import About from "@/components/home/About";
import Hero from "@/components/home/Hero";
import Map from "@/components/home/Map";
import Products from "@/components/home/Products";
import SectionSkeleton from "@/components/home/SectionSkeleton";
import Services from "@/components/home/Services";
import Testimonials from "@/components/home/Testimonials";
import TrainingPopup from "@/components/home/TrainingPopup";
import LocalBusinessJsonLd from "@/components/site/LocalBusinessJsonLd";

export default function Home() {
  return (
    <div>
      <LocalBusinessJsonLd />
      <TrainingPopup />
      <Hero />
      <About />
      <Suspense fallback={<SectionSkeleton />}>
        <Services />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <Products />
      </Suspense>
      <Testimonials />
      <Map />
    </div>
  );
}
