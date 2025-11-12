import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { CodeInput } from "@/components/CodeInput";
import { SignInWithEmailCode } from "@/components/SignInWithEmailCode";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function ResetPasswordWithEmailCode({
  handleCancel,
  provider,
}: {
  handleCancel: () => void;
  provider: string;
}) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"forgot" | { email: string }>("forgot");
  const [submitting, setSubmitting] = useState(false);
  return step === "forgot" ? (
    <>
      <h2 className="font-semibold text-2xl tracking-tight">
        Send password reset code
      </h2>
      <SignInWithEmailCode
        handleCodeSent={(email) => setStep({ email })}
        provider={provider}
      >
        <input name="flow" type="hidden" value="reset" />
      </SignInWithEmailCode>
      <Button type="button" variant="link" onClick={handleCancel}>
        Cancel
      </Button>
    </>
  ) : (
    <>
      <h2 className="font-semibold text-2xl tracking-tight">
        Check your email
      </h2>
      <p className="text-muted-foreground text-sm">
        Enter the 8-digit code we sent to your email address and choose a new
        password.
      </p>
      <form
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitting(true);
          const formData = new FormData(event.currentTarget);
          signIn(provider, formData).catch((error) => {
            console.error(error);
            const errorMessage = error?.message || error?.toString() || "";
            const errorName = error?.name || "";
            
            let toastTitle = "Code could not be verified";
            let toastDescription: string | undefined;
            
            if (
              errorMessage.includes("InvalidAccountId") ||
              errorName === "InvalidAccountId" ||
              (error instanceof Error && error.message.includes("InvalidAccountId"))
            ) {
              toastTitle = "Verification failed";
              toastDescription = "This account doesn't exist. Please sign up first.";
            } else if (
              errorMessage.includes("Invalid") ||
              errorMessage.includes("incorrect") ||
              errorMessage.includes("wrong")
            ) {
              toastTitle = "Invalid code";
              toastDescription = "The code you entered is incorrect. Please try again.";
            } else if (
              errorMessage.includes("password") ||
              errorMessage.includes("too short") ||
              errorMessage.includes("requirements")
            ) {
              toastTitle = "Password error";
              toastDescription = "The new password doesn't meet the requirements. Please try again.";
            } else {
              toastTitle = "Reset failed";
              toastDescription = "Code could not be verified or new password is too short. Please try again.";
            }
            
            toast.error(toastDescription || "Reset failed");
            setSubmitting(false);
          });
        }}
      >
        <label htmlFor="email">Code</label>
        <CodeInput />
        <label htmlFor="newPassword">New Password</label>
        <Input
          type="password"
          name="newPassword"
          id="newPassword"
          className="mb-4 "
          autoComplete="new-password"
        />
        <input type="hidden" name="flow" value="reset-verification" />
        <input type="hidden" name="email" value={step.email} />
        <Button type="submit" disabled={submitting}>
          Continue
        </Button>
        <Button type="button" variant="link" onClick={() => setStep("forgot")}>
          Cancel
        </Button>
      </form>
    </>
  );
}
