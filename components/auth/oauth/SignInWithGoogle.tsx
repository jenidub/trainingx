"use client"

import { useAuthActions } from "@convex-dev/auth/react";
import { GoogleLogo } from "@/components/common/logos/GoogleLogo";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export function SignInWithGoogle() {
  const { signIn } = useAuthActions();
  
  const handleSignIn = async () => {
    try {
      await signIn("google");
    } catch (error) {
      console.error(error);
      const errorMessage = error?.message || error?.toString() || "";
      
      toast.error(errorMessage.includes("popup") || errorMessage.includes("blocked")
        ? "Please allow popups and try again."
        : "Could not sign in with Google. Please try again later.");
    }
  };
  
  return (
    <Button
      className="flex-1 py-3"
      variant="outline"
      type="button"
      onClick={() => void handleSignIn()}
    >
      <GoogleLogo className="mr-2 h-4 w-4" /> Google
    </Button>
  );
}
