"use client";

import dynamic from "next/dynamic";
import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyThisMatters from "@/components/landing/WhyThisMatters";

const TweetSlider = dynamic(
  () => import("../ui/image-auto-slider").then((mod) => mod.TweetSlider),
  { ssr: false }
);
const TimelineSection = dynamic(
  () => import("@/components/landing/TimelineSection"),
  { ssr: false }
);
const PromptToEverything = dynamic(
  () => import("@/components/landing/PromptToEverything"),
  { ssr: false }
);
const SkillsOpportunityHub = dynamic(
  () => import("@/components/landing/SkillsOpportunityHub"),
  { ssr: false }
);
const TrainersOrganizationsRevamp = dynamic(
  () => import("@/components/landing/TrainersOrganizationsRevamp"),
  { ssr: false }
);
const ComparisonSection = dynamic(
  () => import("@/components/landing/ComparisonSection"),
  { ssr: false }
);
const PricingSection = dynamic(
  () => import("@/components/landing/PricingSection"),
  { ssr: false }
);
const AffiliateProgram = dynamic(
  () => import("@/components/landing/AffiliateProgram"),
  { ssr: false }
);
const FinalCTA = dynamic(() => import("@/components/landing/FinalCTA"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/landing/Footer"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex flex-col">
        <Hero />
        <HowItWorks />
        <WhyThisMatters />
        {/* <TweetSlider /> */}

        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-32 md:space-y-40"> */}
        <TimelineSection />
        <PromptToEverything />
        <SkillsOpportunityHub />
        <TrainersOrganizationsRevamp />
        <ComparisonSection />
        {/* </div> */}

        <PricingSection />
        <AffiliateProgram />

        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
