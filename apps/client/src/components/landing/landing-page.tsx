import { LandingNavbar } from "./landing-navbar";
import { HeroSection } from "./hero-section";
import { BenefitsSection } from "./benefits-section";
import { OrderModalitiesSection } from "./order-modalities-section";
import { FAQSection } from "./faq-section";
import { DemoRequestSection } from "./demo-request-section";
import { LandingFooter } from "./landing-footer";

export function LandingPage() {
  return (
    <main
      id="inicio"
      className="min-h-dvh w-full overflow-x-clip bg-(--color-bg-base) text-(--color-text-body)"
    >
      <LandingNavbar />
      <HeroSection />
      <BenefitsSection />
      <OrderModalitiesSection />
      <FAQSection />
      <DemoRequestSection />
      <LandingFooter />
    </main>
  );
}
