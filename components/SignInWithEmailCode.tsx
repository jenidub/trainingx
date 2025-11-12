import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignInWithEmailCode({
  handleCodeSent,
  provider,
  children,
}: {
  handleCodeSent: (email: string) => void;
  provider?: string;
  children?: React.ReactNode;
}) {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        const formData = new FormData(event.currentTarget);
        console.log("Attempting sign in with provider:", provider ?? "resend-otp");
        signIn(provider ?? "resend-otp", formData)
          .then(() => {
            console.log("Sign in successful");
            handleCodeSent(formData.get("email") as string);
          })
          .catch((error) => {
            console.log("=== ERROR CAUGHT ===");
            console.log("Full error object:", error);
            console.log("Error message:", error?.message);
            console.log("Error name:", error?.name);
            console.log("Error type:", typeof error);
            console.log("Is Error instance:", error instanceof Error);

            const errorMessage = error?.message || error?.toString() || "";
            const errorName = error?.name || "";

            let toastTitle = "Could not send code";
            let toastDescription: string | undefined;

            if (
              errorMessage.includes("InvalidAccountId") ||
              errorName === "InvalidAccountId" ||
              (error instanceof Error && error.message.includes("InvalidAccountId"))
            ) {
              toastTitle = "Account not found";
              toastDescription = "This account doesn't exist. Please sign up first.";
            } else if (
              errorMessage.includes("Invalid") ||
              errorMessage.includes("not found") ||
              errorMessage.includes("does not exist")
            ) {
              toastTitle = "Could not send code";
              toastDescription = "Please check your email address and try again.";
            } else {
              toastDescription = "Please try again later.";
            }

            console.log("About to show toast:", { toastTitle, toastDescription });

            toast.error(toastDescription || "Could not send code");
            console.log("Toast called");
            setSubmitting(false);
          });
      }}
    >
      <label htmlFor="email">Email</label>
      <Input name="email" id="email" className="mb-4" autoComplete="email" />
      {children}
        <Button type="submit" disabled={submitting}>
        Send code
      </Button>
    </form>
  );
}
