import { useEffect } from "react";
import { useLocation } from "wouter";
import { saveState } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { getInitialState } from "@shared/schema";

export default function EnterGate() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const savedResults = localStorage.getItem('lite_assessment_results');
    const liteResults = savedResults ? JSON.parse(savedResults) : null;

    // If user completed lite assessment with name/email, auto-create their account
    if (liteResults?.userName && liteResults?.userEmail) {
      const initialState = getInitialState();
      
      const userState = {
        ...initialState,
        userName: liteResults.userName,
        userEmail: liteResults.userEmail,
        isLoggedIn: true,
        lastActiveDate: new Date().toISOString(),
        streak: 1,
        promptScore: liteResults.promptScore,
        skills: liteResults.skills,
        previousSkills: liteResults.skills,
        rubric: liteResults.rubric,
        assessmentHistory: [{
          date: liteResults.completedAt || new Date().toISOString(),
          promptScore: liteResults.promptScore,
          skills: liteResults.skills,
          rubric: liteResults.rubric
        }]
      };

      saveState(userState);
      trackEvent('auth_complete', { userName: liteResults.userName, hasLiteResults: true });
      setLocation('/dashboard');
    } else {
      // No lite results, redirect to assessment
      setLocation('/assessment');
    }
  }, [setLocation]);

  // Show loading while processing
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gradient-from border-r-transparent mb-4"></div>
        <p className="text-muted-foreground">Setting up your account...</p>
      </div>
    </div>
  );
}
