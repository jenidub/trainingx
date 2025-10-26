import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WhyThisMatters from "@/components/WhyThisMatters";
import TrackRecord from "@/components/TrackRecord";
import HowItWorks from "@/components/HowItWorks";
import SkillsMastery from "@/components/SkillsMastery";
import PracticeZone from "@/components/PracticeZone";
import AppStudio from "@/components/AppStudio";
import CareerHub from "@/components/CareerHub";
import TrainersOrganizations from "@/components/TrainersOrganizations";
import YouthPath from "@/components/YouthPath";
import AnalyticsCertificates from "@/components/AnalyticsCertificates";
import ComparisonTable from "@/components/ComparisonTable";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <WhyThisMatters />
      <TrackRecord />
      <HowItWorks />
      {/* <SkillsMastery /> */}
      {/* <PracticeZone /> */}
      {/* <AppStudio /> */}
      <CareerHub />
      <TrainersOrganizations />
      {/* <YouthPath /> */}
      {/* <AnalyticsCertificates /> */}
      <ComparisonTable />
      <FinalCTA />
      <Footer />
    </div>
  );
}
