import { CodeInput } from "@/components/auth/CodeInput";
import { SignInMethodDivider } from "@/components/auth/SignInMethodDivider";
import { SignInWithEmailCode } from "@/components/auth/SignInWithEmailCode";
import { SignInWithOAuth } from "@/components/auth/SignInWithOAuth";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignInFormEmailCode() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="max-w-[384px] mx-auto flex flex-col gap-4">
      {step === "signIn" ? (
        <>
          <h2 className="font-semibold text-2xl tracking-tight">
            Sign in or create an account
          </h2>
          <SignInWithOAuth />
          <SignInMethodDivider />
          <SignInWithEmailCode handleCodeSent={(email) => setStep({ email })} />
        </>
      ) : (
        <>
          <h2 className="font-semibold text-2xl tracking-tight">
            Check your email
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter the 8-digit code we sent to your email address.
          </p>
          <form
            className="flex flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitting(true);
              const formData = new FormData(event.currentTarget);
              signIn("resend-otp", formData).catch((error) => {
                console.error(error);
                const errorMessage = error?.message || error?.toString() || "";
                const errorName = error?.name || "";

                let toastMessage = "Code could not be verified";

                if (
                  errorMessage.includes("InvalidAccountId") ||
                  errorName === "InvalidAccountId" ||
                  (error instanceof Error && error.message.includes("InvalidAccountId"))
                ) {
                  toastMessage = "Verification failed: This account doesn't exist. Please sign up first.";
                } else if (
                  errorMessage.includes("Invalid") ||
                  errorMessage.includes("incorrect") ||
                  errorMessage.includes("wrong")
                ) {
                  toastMessage = "Invalid code: The code you entered is incorrect. Please try again.";
                } else {
                  toastMessage = "Verification failed: Please try again.";
                }

                toast.error(toastMessage);
                setSubmitting(false);
              });
            }}
          >
            <label htmlFor="code">Code</label>
            <CodeInput />
            <input name="email" value={step.email} type="hidden" />
            <Button type="submit" disabled={submitting}>
              Continue
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setStep("signIn")}
            >
              Cancel
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
