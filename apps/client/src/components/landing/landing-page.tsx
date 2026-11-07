import { LandingNavbar } from "./landing-navbar";
import { HeroSection } from "./hero-section";
import { ProductShowcase } from "./product-showcase";
import { BenefitsSection } from "./benefits-section";
import { LandingFooter } from "./landing-footer";

export function LandingPage() {
  return (
    <main
      id="inicio"
      className="min-h-dvh w-full overflow-hidden bg-[#FAF9F6] text-[#191919]"
    >
      <LandingNavbar />

      <HeroSection />

      <ProductShowcase />

      <BenefitsSection />

      <LandingFooter />
    </main>
  );
}
