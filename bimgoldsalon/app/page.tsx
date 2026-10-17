import TrainingPopup from "@/components/home/TrainingPopup";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Services from "@/components/home/Services";
import Products from "@/components/home/Products";
import Testimonials from "@/components/home/Testimonials";
import Map from "@/components/home/Map";

export default function Home() {
  return (
    <main>
      <TrainingPopup />
      <Hero />
      <About />
      <Services />
      <Products />
      <Testimonials />
      <Map />
    </main>
  );
}
