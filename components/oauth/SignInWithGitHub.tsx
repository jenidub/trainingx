"use client"

import { useAuthActions } from "@convex-dev/auth/react";
import { GitHubLogo } from "@/components/GitHubLogo";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function SignInWithGitHub() {
  const { signIn } = useAuthActions();
  
  const handleSignIn = async () => {
    try {
      await signIn("github");
    } catch (error) {
      console.error(error);
      const errorMessage = error?.message || error?.toString() || "";
      
      toast.error(errorMessage.includes("popup") || errorMessage.includes("blocked")
        ? "Please allow popups and try again."
        : "Could not sign in with GitHub. Please try again later.");
    }
  };
  
  return (
    <Button
      className="flex-1"
      variant="outline"
      type="button"
      onClick={() => void handleSignIn()}
    >
      <GitHubLogo className="mr-2 h-4 w-4" /> GitHub
    </Button>
  );
}
