import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ConvexTest from "./ConvexTest";
import Home from "@/pages/Home";
import AssessmentLite from "@/pages/AssessmentLite";
import MatchingQuiz from "@/pages/MatchingQuiz";
import AIReadinessQuiz from "@/pages/AIReadinessQuiz";
import PromptingIntelligenceQuiz from "@/pages/PromptingIntelligenceQuiz";
import EnterGate from "@/pages/EnterGate";
import AssessmentFull from "@/pages/AssessmentFull";
// Using local version with Convex data
import PracticeZone from "@/pages/PracticeZone";
// Note: PracticeZoneConvex is for generic projects, not practice zone projects
// import PracticeZone from "@/pages/PracticeZoneConvex";
import ProjectWorkspace from "@/pages/ProjectWorkspace";
import ProjectResult from "@/pages/ProjectResult";
import MatchingZone from "@/pages/MatchingZone";
import AIDatabase from "@/pages/AIDatabase";
import CareerDetails from "@/pages/CareerDetails";
import Dashboard from "@/pages/DashboardConvex";
import Portfolio from "@/pages/Portfolio";
import Certificate from "@/pages/Certificate";
import CustomGPTs from "@/pages/CustomGPTs";
import PlatformGPTs from "@/pages/PlatformGPTs";
import Leaderboard from "@/pages/Leaderboard";
import Community from "@/pages/Community";
import NotFound from "@/pages/not-found";
import RouteGuard from "@/components/RouteGuard";
import { WizardChat } from "@/components/WizardChat";
import { WizardContextProvider } from "@/contexts/WizardContextProvider";
import { SidebarLayout } from "@/components/SidebarLayout";
import { SignInFormsShowcase } from "@/auth/SignInFormsShowcase";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={SignInFormsShowcase} />
      <Route path="/quiz" component={PromptingIntelligenceQuiz} />
      <Route path="/old-quiz" component={AIReadinessQuiz} />
      <Route path="/assessment" component={AssessmentLite} />
      <Route path="/matching-quiz" component={MatchingQuiz} />
      <Route path="/enter" component={EnterGate} />
      {/* <Route path="/assessment">
        <RouteGuard>
          <AssessmentFull />
        </RouteGuard>
      </Route> */}
      <Route path="/practice">
        <RouteGuard>
          <SidebarLayout>
            <PracticeZone />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/practice/:slug">
        <RouteGuard>
          <ProjectWorkspace />
        </RouteGuard>
      </Route>
      <Route path="/practice/:slug/result">
        <RouteGuard>
          <ProjectResult />
        </RouteGuard>
      </Route>
      <Route path="/matching">
        <RouteGuard>
          <SidebarLayout>
            <MatchingZone />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/ai-database">
        <RouteGuard>
          <SidebarLayout>
            <AIDatabase />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/career/:careerId">
        <RouteGuard>
          <SidebarLayout>
            <CareerDetails />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/dashboard">
        <RouteGuard>
          <SidebarLayout>
            <Dashboard />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/portfolio">
        <RouteGuard>
          <SidebarLayout>
            <Portfolio />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/certificate">
        <RouteGuard>
          <Certificate />
        </RouteGuard>
      </Route>
      <Route path="/custom-gpts">
        <RouteGuard>
          <SidebarLayout>
            <CustomGPTs />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/platform-gpts">
        <RouteGuard>
          <SidebarLayout>
            <PlatformGPTs />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/leaderboard">
        <RouteGuard>
          <SidebarLayout>
            <Leaderboard />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route path="/community">
        <RouteGuard>
          <SidebarLayout>
            <Community />
          </SidebarLayout>
        </RouteGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WizardContextProvider>
        <Toaster />
        {/* <ConvexTest /> */}
        <Router />
        <WizardChat />
      </WizardContextProvider>
    </TooltipProvider>
  );
}

export default App;
